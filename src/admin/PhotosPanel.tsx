import { useRef, useState, type FormEvent } from 'react'
import type { CategoryRow, PhotoRow } from '../data/types'
import { makeVariants } from '../lib/image'
import { toPhoto } from '../lib/gallery'
import { BUCKET, getClient } from '../lib/supabase'
import { btnDanger, btnPrimary, card, errorMessage, input } from './ui'

type Props = { categories: CategoryRow[]; photos: PhotoRow[]; onChange: () => Promise<void> }

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 40 * 1024 * 1024
const stripExt = (name: string) => name.replace(/\.[^.]+$/, '')

function CategorySelect({ categories, value, onChange, label }: {
  categories: CategoryRow[]
  value: string
  onChange: (v: string) => void
  label: string
}) {
  const tops = categories.filter((c) => !c.parent_id)
  return (
    <select className={input} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— ไม่มีหมวด —</option>
      {tops.map((t) => {
        const kids = categories.filter((c) => c.parent_id === t.id)
        return kids.length ? (
          <optgroup key={t.id} label={t.label}>
            <option value={t.id}>{t.label}</option>
            {kids.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
          </optgroup>
        ) : (
          <option key={t.id} value={t.id}>{t.label}</option>
        )
      })}
    </select>
  )
}

function PhotoItem({ row, categories, onChange, setMsg }: {
  row: PhotoRow
  categories: CategoryRow[]
  onChange: () => Promise<void>
  setMsg: (m: string | null) => void
}) {
  const [caption, setCaption] = useState(row.caption)
  const [busy, setBusy] = useState(false)

  const patch = async (values: Partial<Pick<PhotoRow, 'caption' | 'category_id'>>) => {
    setMsg(null)
    const { data, error } = await getClient().from('photos').update(values).eq('id', row.id).select()
    if (error || !data?.length) setMsg(error ? errorMessage(error) : 'แก้ไขไม่สำเร็จ (สิทธิ์ไม่พอ?)')
    await onChange()
  }

  const remove = async () => {
    if (!confirm(`ลบรูป "${row.caption || 'ไม่มีชื่อ'}" ถาวร ?`)) return
    setBusy(true)
    setMsg(null)
    const sb = getClient()
    // ลบแถวก่อน ถ้าลบไฟล์ไม่สำเร็จ แค่เหลือไฟล์ค้าง ไม่ทำให้หน้าเว็บมีรูปเสีย
    const { data, error } = await sb.from('photos').delete().eq('id', row.id).select()
    if (error || !data?.length) {
      setMsg(error ? errorMessage(error) : 'ลบไม่สำเร็จ (สิทธิ์ไม่พอ?)')
    } else {
      await sb.storage.from(BUCKET).remove([row.src_path, row.thumb_path])
    }
    await onChange()
    setBusy(false)
  }

  return (
    <li className={`${card} flex flex-col gap-3`}>
      <img src={toPhoto(row).thumb} alt={row.caption} loading="lazy" className="aspect-[4/3] w-full rounded-lg border border-white/[0.08] object-cover" />
      <input
        className={input}
        aria-label="ชื่อรูป"
        value={caption}
        maxLength={200}
        onChange={(e) => setCaption(e.target.value)}
        onBlur={() => caption !== row.caption && patch({ caption })}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      <CategorySelect
        categories={categories}
        label="หมวดหมู่ของรูป"
        value={row.category_id ?? ''}
        onChange={(v) => patch({ category_id: v || null })}
      />
      <button type="button" className={btnDanger} disabled={busy} onClick={remove}>
        {busy ? 'กำลังลบ…' : 'ลบรูป'}
      </button>
    </li>
  )
}

export default function PhotosPanel({ categories, photos, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [category, setCategory] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const upload = async (e: FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return
    setBusy(true)
    setMsg(null)
    const sb = getClient()
    const base = Math.max(0, ...photos.map((p) => p.sort_order))
    let done = 0
    try {
      for (const [i, file] of files.entries()) {
        setProgress(`กำลังอัปโหลด ${i + 1}/${files.length}: ${file.name}`)
        if (!ALLOWED.includes(file.type)) throw new Error(`${file.name}: รองรับเฉพาะ JPG, PNG, WebP`)
        if (file.size > MAX_SIZE) throw new Error(`${file.name}: ไฟล์ใหญ่เกิน 40 MB`)

        const { full, thumb } = await makeVariants(file)
        const id = crypto.randomUUID()
        const srcPath = `${id}.${full.ext}`
        const thumbPath = `thumbs/${id}.${thumb.ext}`
        const opts = (b: Blob) => ({ contentType: b.type, cacheControl: '31536000' })

        const up1 = await sb.storage.from(BUCKET).upload(srcPath, full.blob, opts(full.blob))
        if (up1.error) throw up1.error
        const up2 = await sb.storage.from(BUCKET).upload(thumbPath, thumb.blob, opts(thumb.blob))
        if (up2.error) {
          await sb.storage.from(BUCKET).remove([srcPath])
          throw up2.error
        }

        const ins = await sb
          .from('photos')
          .insert({ src_path: srcPath, thumb_path: thumbPath, caption: stripExt(file.name), category_id: category || null, sort_order: base + i + 1 })
          .select()
        if (ins.error || !ins.data?.length) {
          await sb.storage.from(BUCKET).remove([srcPath, thumbPath])
          throw ins.error ?? new Error('บันทึกไม่สำเร็จ (สิทธิ์ไม่พอ?)')
        }
        done++
      }
      setFiles([])
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setMsg(`${errorMessage(err)}${done ? ` (อัปโหลดสำเร็จแล้ว ${done} รูป)` : ''}`)
    } finally {
      setProgress('')
      setBusy(false)
      await onChange()
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={upload} className={`${card} flex flex-wrap items-end gap-3`}>
        <label className="min-w-56 flex-1 text-sm">
          <span className="mb-1 block text-muted">เลือกรูป (เลือกได้หลายไฟล์)</span>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ALLOWED.join(',')}
            onChange={(e) => setFiles([...(e.target.files ?? [])])}
            className={`${input} file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-fg`}
          />
        </label>
        <label className="min-w-48 text-sm">
          <span className="mb-1 block text-muted">หมวดหมู่</span>
          <CategorySelect categories={categories} label="หมวดหมู่ที่จะอัปโหลดเข้า" value={category} onChange={setCategory} />
        </label>
        <button type="submit" disabled={busy || files.length === 0} className={btnPrimary}>
          {busy ? 'กำลังอัปโหลด…' : `อัปโหลด${files.length ? ` ${files.length} รูป` : ''}`}
        </button>
        {progress && <p className="w-full text-sm text-muted">{progress}</p>}
        <p className="w-full text-xs text-muted">รูปจะถูกย่อในเบราว์เซอร์ (ด้านยาวสุด 2560px, WebP) เพื่อประหยัดพื้นที่ฟรี 1 GB — ต้นฉบับในเครื่องคุณไม่ถูกแก้ไข</p>
      </form>

      {msg && <p role="alert" className="text-sm text-red-300">{msg}</p>}

      {photos.length === 0 ? (
        <p className="py-8 text-center text-muted">ยังไม่มีรูป</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {photos.map((row) => (
            <PhotoItem key={row.id} row={row} categories={categories} onChange={onChange} setMsg={setMsg} />
          ))}
        </ul>
      )}
    </div>
  )
}
