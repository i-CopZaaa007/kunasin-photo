import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type { Photo } from '../data/types'
import { prefersReducedMotion } from '../lib/motion'

type Props = {
  photo: Photo
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  swipe: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
  }
}

const btn =
  'absolute cursor-pointer rounded-full border border-white/10 bg-white/5 text-fg backdrop-blur transition-colors hover:bg-white/15'

export default function Lightbox({ photo, onClose, onPrev, onNext, swipe }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const captionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!backdropRef.current || prefersReducedMotion()) return
    // ใช้ fromTo (ไม่ใช่ from): StrictMode รัน effect 2 รอบ และ from จะอ่านค่า 0 ที่ค้างจากรอบแรกเป็นปลายทาง
    const tween = gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power1.out' },
    )
    return () => {
      tween.kill()
    }
  }, [])

  // เปิดรูป/เปลี่ยนรูป
  useEffect(() => {
    if (!imgRef.current || prefersReducedMotion()) return
    const tween = gsap.fromTo(
      [imgRef.current, captionRef.current],
      { opacity: 0, scale: 0.97 },
      { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' },
    )
    return () => {
      tween.kill()
    }
  }, [photo.id])

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onContextMenu={(e) => e.preventDefault()}
      {...swipe}
      className="fixed inset-0 z-[100] flex touch-pan-y items-center justify-center bg-[rgba(0,0,0,0.92)]"
    >
      <button
        type="button"
        aria-label="ปิด"
        onClick={onClose}
        autoFocus
        className={`${btn} right-4 top-4 flex size-11 items-center justify-center text-2xl leading-none`}
      >
        &times;
      </button>
      <button
        type="button"
        aria-label="รูปก่อนหน้า"
        onClick={onPrev}
        className={`${btn} left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-xl sm:left-6`}
      >
        &lsaquo;
      </button>

      <figure
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className="flex h-full w-full flex-col items-center justify-center px-16 pb-6 pt-16 sm:px-24"
      >
        <img
          ref={imgRef}
          src={photo.src}
          alt={photo.caption}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          // pointer-events-none: กันลาก/กดค้างเพื่อเซฟรูป
          className="pointer-events-none max-h-[80vh] max-w-full rounded-[8px] border border-white/[0.08] object-contain"
        />
        <figcaption ref={captionRef} className="mt-4 text-center text-sm text-gray-300">
          {photo.caption}
        </figcaption>
      </figure>

      <button
        type="button"
        aria-label="รูปถัดไป"
        onClick={onNext}
        className={`${btn} right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-xl sm:right-6`}
      >
        &rsaquo;
      </button>
    </div>
  )
}
