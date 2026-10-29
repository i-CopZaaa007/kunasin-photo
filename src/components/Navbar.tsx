import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Category } from '../data/types'
import { prefersReducedMotion } from '../lib/motion'

type Props = {
  categories: Category[]
  filter: string
  counts: Record<string, number>
  onSelect: (id: string) => void
}

const pillBase =
  'inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200'
const pillIdle = 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
const pillActive = 'border-accent bg-accent text-white'

export default function Navbar({ categories, filter, counts, onSelect }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  // ปิด dropdown เมื่อคลิกข้างนอกหรือกด Esc
  useEffect(() => {
    if (!openId) return
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenId(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenId(null)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openId])

  useEffect(() => {
    if (!openId || !menuRef.current || prefersReducedMotion()) return
    const tween = gsap.fromTo(
      menuRef.current,
      { opacity: 0, y: -8, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: 'power2.out' },
    )
    return () => {
      tween.kill()
    }
  }, [openId])

  const select = (id: string) => {
    onSelect(id)
    setOpenId(null)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[rgba(18,20,28,0.75)] backdrop-blur-[16px]">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => select('all')}
          className="cursor-pointer text-lg font-extrabold tracking-[0.28em] text-fg"
        >
          KUNASIN PHOTO
        </button>

        <nav ref={navRef} aria-label="หมวดหมู่รูปภาพ" className="flex flex-wrap items-center gap-2">
          {categories.map((c) => {
            if (!c.children) {
              const active = filter === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => select(c.id)}
                  className={`${pillBase} ${active ? pillActive : pillIdle}`}
                >
                  {c.label}
                  <span className={active ? 'text-white/70' : 'text-muted'}>{counts[c.id] ?? 0}</span>
                </button>
              )
            }

            const isOpen = openId === c.id
            const childActive = filter === c.id || c.children.some((ch) => ch.id === filter)
            return (
              <div key={c.id} className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : c.id)}
                  className={`${pillBase} ${childActive ? pillActive : pillIdle}`}
                >
                  {c.label}
                  <span className={childActive ? 'text-white/70' : 'text-muted'}>{counts[c.id] ?? 0}</span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className={`size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
                  </svg>
                </button>

                {isOpen && (
                  <ul
                    ref={menuRef}
                    role="menu"
                    className="absolute right-0 top-full z-10 mt-2 min-w-56 overflow-hidden rounded-xl border border-white/10 bg-panel p-1 shadow-2xl shadow-black/50"
                  >
                    {c.children.map((ch) => {
                      const active = filter === ch.id
                      return (
                        <li key={ch.id} role="none">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => select(ch.id)}
                            className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              active ? 'bg-accent text-white' : 'text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            {ch.label}
                            <span className={active ? 'text-white/70' : 'text-muted'}>{counts[ch.id] ?? 0}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
