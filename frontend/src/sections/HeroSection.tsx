import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import WaxCanvas from './WaxCanvas'

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 })
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
    })
    tl.to(
      subtitleRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      },
      '-=0.7'
    )
    tl.to(
      ctaRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      },
      '-=0.5'
    )
  }, [])

  const scrollToInterface = () => {
    const el = document.getElementById('interface-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero-section"
      className="relative w-full overflow-hidden"
      style={{ height: '100vh', cursor: 'none' }}
    >
      <WaxCanvas />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <h1
          ref={titleRef}
          className="font-display text-paper-white text-center opacity-0 translate-y-8"
          style={{
            fontSize: 'clamp(48px, 7vw, 120px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            fontWeight: 400,
          }}
        >
          Touch the void.
        </h1>
        <p
          ref={subtitleRef}
          className="mt-6 text-muted-ink text-center max-w-xl opacity-0 translate-y-8 px-6"
          style={{ fontSize: '16px', lineHeight: 1.5 }}
        >
          A pressure-sensitive bridge between your physical tablet and Claude&apos;s consciousness.
        </p>
        <button
          ref={ctaRef}
          onClick={scrollToInterface}
          className="mt-10 px-8 py-3 border border-stroke-violet text-stroke-violet text-sm tracking-[0.05em] uppercase rounded-[6px] hover:bg-stroke-violet/10 hover:shadow-[0_0_20px_rgba(123,111,222,0.3)] transition-all duration-300 opacity-0 translate-y-8 pointer-events-auto"
          data-cursor-hover
        >
          Explore
        </button>
      </div>
    </section>
  )
}
