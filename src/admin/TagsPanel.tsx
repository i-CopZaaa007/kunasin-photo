import { useState, type FormEvent } from 'react'
import type { CategoryRow, PhotoRow } from '../data/types'
import { getClient } from '../lib/supabase'
import { btnDanger, btnPrimary, card, errorMessage, input } from './ui'

type Props = { categories: CategoryRow[]; photos: PhotoRow[]; onChange: () => Promise<void> }

// id ของ tag (slug) สร้างครั้งเดียวและไม่เปลี่ยนตอนแก้ชื่อ; ชื่อภาษาไทยใช้รหัสสุ่มแทน
function makeId(label: string, taken: Set<string>) {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  let id = base || `tag-${Math.random().toString(36).slice(2, 8)}`
  while (taken.has(id) || id === 'all') id = `${base || 'tag'}-${Math.random().toString(36).slice(2, 6)}`
  return id
}

function TagRow({ tag, photoCount, childCount, indent, onChange, setMsg }: {
  tag: CategoryRow
  photoCount: number
  childCount: number
  indent: boolean
  onChange: () => Promise<void>
  setMsg: (m: string | null) => void
}) {
  const [label, setLabel] = useState(tag.label)

  const rename = async () => {
    const next = label.trim()
    if (!next) return setLabel(tag.label)
    if (next === tag.label) return
    setMsg(null)
    const { data, error } = await getClient().from('categories').update({ label: next }).eq('id', tag.id).select()
    if (error || !data?.length) setMsg(error ? errorMessage(error) : 'แก้ไขไม่สำเร็จ (สิทธิ์ไม่พอ?)')
    await onChange()
  }

  const remove = async () => {
    if (childCount > 0) return setMsg(`"${tag.label}" ยังมีหมวดย่อย ${childCount} หมวด ลบหมวดย่อยก่อน`)
    if (photoCount > 0) return setMsg(`"${tag.label}" ยังมีรูป ${photoCount} รูป ย้ายรูปไปหมวดอื่นก่อน`)
    if (!confirm(`ลบ tag "${tag.label}" ?`)) return
    setMsg(null)
    const { data, error } = await getClient().from('categories').delete().eq('id', tag.id).select()
    if (error || !data?.length) setMsg(error ? errorMessage(error) : 'ลบไม่สำเร็จ (สิทธิ์ไม่พอ?)')
    await onChange()
  }

  return (
    <li className={`flex items-center gap-2 ${indent ? 'ml-8' : ''}`}>
      <input
        className={input}
        aria-label={`ชื่อ tag ${tag.label}`}
        value={label}
        maxLength={60}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={rename}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      <span className="w-16 shrink-0 text-right text-xs text-muted">{photoCount} รูป</span>
      <button type="button" className={btnDanger} onClick={remove}>ลบ</button>
    </li>
  )
}

export default function TagsPanel({ categories, photos, onChange }: Props) {
  const [label, setLabel] = useState('')
  const [parent, setParent] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const tops = categories.filter((c) => !c.parent_id)
  const photoCount = (id: string) => photos.filter((p) => p.category_id === id).length

  const add = async (e: FormEvent) => {
    e.preventDefault()
    const name = label.trim()
    if (!name) return
    setBusy(true)
    setMsg(null)
    const id = makeId(name, new Set(categories.map((c) => c.id)))
    const sort = Math.max(0, ...categories.map((c) => c.sort_order)) + 1
    const { data, error } = await getClient()
      .from('categories')
      .insert({ id, label: name, parent_id: parent || null, sort_order: sort })
      .select()
    if (error || !data?.length) setMsg(error ? errorMessage(error) : 'เพิ่มไม่สำเร็จ (สิทธิ์ไม่พอ?)')
    else setLabel('')
    await onChange()
    setBusy(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className={`${card} flex flex-wrap items-end gap-3`}>
        <label className="min-w-48 flex-1 text-sm">
          <span className="mb-1 block text-muted">ชื่อ tag ใหม่</span>
          <input className={input} value={label} maxLength={60} onChange={(e) => setLabel(e.target.value)} placeholder="เช่น Portrait" />
        </label>
        <label className="min-w-48 text-sm">
          <span className="mb-1 block text-muted">อยู่ภายใต้</span>
          <select className={input} value={parent} onChange={(e) => setParent(e.target.value)}>
            <option value="">— หมวดหลัก (แสดงบน navbar) —</option>
            {tops.map((t) => <option key={t.id} value={t.id}>{t.label} (เมนูย่อย)</option>)}
          </select>
        </label>
        <button type="submit" disabled={busy || !label.trim()} className={btnPrimary}>เพิ่ม tag</button>
      </form>

      {msg && <p role="alert" className="text-sm text-red-300">{msg}</p>}

      <ul className={`${card} space-y-2`}>
        {tops.length === 0 && <li className="text-sm text-muted">ยังไม่มี tag</li>}
        {tops.map((t) => {
          const kids = categories.filter((c) => c.parent_id === t.id)
          return (
            <li key={t.id} className="space-y-2">
              <ul className="space-y-2">
                <TagRow tag={t} photoCount={photoCount(t.id)} childCount={kids.length} indent={false} onChange={onChange} setMsg={setMsg} />
                {kids.map((k) => (
                  <TagRow key={k.id} tag={k} photoCount={photoCount(k.id)} childCount={0} indent onChange={onChange} setMsg={setMsg} />
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-muted">
        แก้ชื่อได้โดยพิมพ์ในช่องแล้วกด Enter หรือคลิกออก ลบได้เฉพาะ tag ที่ไม่มีรูปและไม่มีหมวดย่อย
      </p>
    </div>
  )
}
