import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Photo } from '../data/types'
import { prefersReducedMotion } from '../lib/motion'
import PhotoCard from './PhotoCard'

gsap.registerPlugin(ScrollTrigger)

type Props = {
  photos: Photo[]
  labelOf: (id: string | null) => string
  onOpen: (index: number) => void
}

export default function Gallery({ photos, labelOf, onOpen }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const refreshTimer = useRef<gsap.core.Tween | null>(null)

  // fade-in ตอน scroll (แทน IntersectionObserver เดิม)
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]')
      gsap.set(cards, { opacity: 0, y: 24 })
      ScrollTrigger.batch(cards, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08, overwrite: true }),
      })
    }, root)
    return () => ctx.revert()
  }, [photos])

  // รูป lazy โหลดแล้วความสูง masonry เปลี่ยน -> คำนวณตำแหน่ง trigger ใหม่
  const refreshSoon = () => {
    refreshTimer.current?.kill()
    refreshTimer.current = gsap.delayedCall(0.15, () => ScrollTrigger.refresh())
  }
  useEffect(() => () => void refreshTimer.current?.kill(), [])

  if (photos.length === 0) {
    return <p className="py-12 text-center text-muted">ยังไม่มีรูปในหมวดนี้</p>
  }

  return (
    <section
      ref={rootRef}
      aria-label="แกลเลอรีรูปภาพ"
      onLoadCapture={refreshSoon}
      className="columns-1 gap-4 px-4 pb-8 min-[480px]:columns-2 md:columns-3 xl:columns-4 min-[1700px]:columns-5 sm:px-6"
    >
      {photos.map((photo, i) => (
        <PhotoCard key={photo.id} photo={photo} categoryName={labelOf(photo.category)} onOpen={() => onOpen(i)} />
      ))}
    </section>
  )
}
