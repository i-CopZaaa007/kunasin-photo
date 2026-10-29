import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { CategoryRow, PhotoRow } from '../data/types'
import { listCategories, listPhotoRows } from '../lib/gallery'
import { getClient, supabase } from '../lib/supabase'
import LoginForm from './LoginForm'
import PhotosPanel from './PhotosPanel'
import TagsPanel from './TagsPanel'
import { btn, card, errorMessage } from './ui'

function Dashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<'photos' | 'tags'>('photos')
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [photos, setPhotos] = useState<PhotoRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([listCategories(), listPhotoRows()])
      setCategories(c)
      setPhotos(p)
      setError(null)
    } catch (e) {
      setError(errorMessage(e))
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const tabBtn = (id: typeof tab, label: string) => (
    <button
      type="button"
      aria-pressed={tab === id}
      onClick={() => setTab(id)}
      className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        tab === id ? 'border-accent bg-accent text-white' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  )

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[rgba(18,20,28,0.75)] backdrop-blur-[16px]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="font-extrabold tracking-[0.25em]">
            KUNASIN PHOTO <span className="ml-2 text-xs font-medium tracking-normal text-muted">หลังบ้าน</span>
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">{session.user.email}</span>
            <a href="/" className={btn}>ดูหน้าเว็บ</a>
            <button type="button" className={btn} onClick={() => getClient().auth.signOut()}>ออกจากระบบ</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-8 sm:px-6">
        <nav className="flex gap-2" aria-label="เมนูหลังบ้าน">
          {tabBtn('photos', `รูปภาพ (${photos.length})`)}
          {tabBtn('tags', `Tag / เมนู navbar (${categories.length})`)}
        </nav>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        {tab === 'photos' ? (
          <PhotosPanel categories={categories} photos={photos} onChange={refresh} />
        ) : (
          <TagsPanel categories={categories} photos={photos} onChange={refresh} />
        )}
      </main>
    </>
  )
}

export default function Admin() {
  // undefined = กำลังเช็ก session, null = ยังไม่ล็อกอิน
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    document.title = 'Admin | Kunasin Photo'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.append(meta)
    return () => meta.remove()
  }, [])

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div className={`${card} space-y-2`}>
          <h1 className="text-lg font-bold">ยังไม่ได้ตั้งค่า Supabase</h1>
          <p className="text-sm text-muted">
            สร้างไฟล์ .env.local ตาม .env.example (VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY) แล้วรัน dev server ใหม่ ดูขั้นตอนใน README
          </p>
        </div>
      </div>
    )
  }

  if (session === undefined) return null
  return session ? <Dashboard session={session} /> : <LoginForm />
}
