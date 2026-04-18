import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const gestures = [
  {
    title: 'Tap',
    description: 'Quick, short contact. A brief moment of connection between stylus and surface — registered as a single point of intent.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="stroke-stroke-violet">
        <circle cx="40" cy="40" r="8" strokeWidth="2" />
        <circle cx="40" cy="40" r="20" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
      </svg>
    ),
  },
  {
    title: 'Press & Hold',
    description: 'Sustained pressure in one spot. A lingering presence that communicates weight, patience, and deliberate contact with the surface.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="stroke-stroke-violet">
        <circle cx="40" cy="30" r="6" strokeWidth="2" fill="rgba(123,111,222,0.2)" />
        <line x1="40" y1="36" x2="40" y2="55" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="55" x2="48" y2="55" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Stroke',
    description: 'Directional movement across the surface. The backbone of expression — pressure, speed, and direction all encoded in a single sweeping gesture.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="stroke-stroke-violet">
        <path d="M20 50 Q40 20, 60 40" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M20 50 Q40 20, 60 40" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" fill="none" />
      </svg>
    ),
  },
  {
    title: 'Circular Motion',
    description: 'Path that loops back to its starting point. A closed form that suggests completion, repetition, or rhythm in your expression.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="stroke-stroke-violet">
        <circle cx="40" cy="40" r="18" strokeWidth="2" strokeDasharray="80 10" strokeLinecap="round" />
        <circle cx="40" cy="40" r="28" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
      </svg>
    ),
  },
]

export default function GestureFlowSection() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const ctx = gsap.context(() => {
      // Set initial state — all blocks off screen to the right
      blockRefs.current.forEach((block) => {
        if (block) gsap.set(block, { xPercent: 100, opacity: 0 })
      })

      // Master timeline tied to scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      })

      // Each gesture: slide in from right, pause, slide out to left
      // Except last one: stays centered
      gestures.forEach((_, i) => {
        const block = blockRefs.current[i]
        if (!block) return
        const isLast = i === gestures.length - 1

        // Slide in
        tl.to(block, { xPercent: 0, opacity: 1, duration: 1, ease: 'power2.out' }, i * 3)
        // Hold
        tl.to(block, { xPercent: 0, opacity: 1, duration: 1.5 }, i * 3 + 1)
        // Slide out (except last)
        if (!isLast) {
          tl.to(block, { xPercent: -100, opacity: 0, duration: 1, ease: 'power2.in' }, i * 3 + 2.5)
        }
      })

      // Background color changes
      gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })
        .to(document.body, { backgroundColor: '#0d0d0f', duration: 1 })
        .to(document.body, { backgroundColor: '#1a1a22', duration: 1 })
        .to(document.body, { backgroundColor: '#0d0d0f', duration: 1 })
    }, wrapper)

    return () => ctx.revert()
  }, [])

  return (
    <section id="gesture-section" ref={wrapperRef} className="relative" style={{ height: '400vh' }}>
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden">

        {/* Background title */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center px-6">
            <h2
              className="font-display text-paper-white"
              style={{
                fontSize: 'clamp(36px, 5vw, 72px)',
                lineHeight: 1.0,
                letterSpacing: '-0.01em',
                fontWeight: 400,
              }}
            >
              Gesture Flow
            </h2>
            <p className="mt-4 text-muted-ink text-base max-w-lg mx-auto">
              Four fundamental ways to communicate through touch. Each gesture carries its own weight of meaning.
            </p>
          </div>
        </div>

        {/* Gesture cards */}
        {gestures.map((gesture, i) => (
          <div
            key={gesture.title}
            ref={(el) => { blockRefs.current[i] = el }}
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
            style={{ zIndex: 20 + i }}
          >
            <div className="bg-slate-panel/80 backdrop-blur-sm border border-grid-line rounded-lg p-8 md:p-12 max-w-lg mx-6">
              <div className="flex items-center gap-6 mb-6">
                {gesture.icon}
                <h3 className="font-display text-paper-white text-3xl md:text-4xl" style={{ fontWeight: 400 }}>
                  {gesture.title}
                </h3>
              </div>
              <p className="text-muted-ink text-base leading-relaxed">
                {gesture.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}