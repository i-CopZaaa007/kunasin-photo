import { useCallback, useEffect, useRef, useState } from 'react'

export function useLightbox(count: number) {
  const [index, setIndex] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)

  const open = useCallback((i: number) => setIndex(i), [])
  const close = useCallback(() => setIndex(null), [])
  const next = useCallback(
    () => setIndex((i) => (i === null || count === 0 ? i : (i + 1) % count)),
    [count],
  )
  const prev = useCallback(
    () => setIndex((i) => (i === null || count === 0 ? i : (i - 1 + count) % count)),
    [count],
  )

  const isOpen = index !== null

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, close, next, prev])

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStartX.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      touchStartX.current = null
      if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
    },
  }

  return { index, open, close, next, prev, swipe }
}
