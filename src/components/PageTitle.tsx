import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/motion'

export default function PageTitle({ title }: { title: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  // เปลี่ยนชื่อหมวด -> fade-in นุ่มๆ
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 0, y: 14, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
    )
    return () => {
      tween.kill()
    }
  }, [title])

  return (
    <h1 ref={ref} className="py-10 text-center text-3xl font-bold tracking-tight sm:text-4xl">
      {title}
    </h1>
  )
}
