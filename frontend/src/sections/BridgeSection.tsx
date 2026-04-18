import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function BridgeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="bridge-section"
      ref={sectionRef}
      className="relative w-full py-[180px] overflow-hidden"
    >
      {/* Marquee */}
      <div className="relative w-full overflow-hidden mb-20">
        <div className="animate-marquee whitespace-nowrap flex">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="font-display text-paper-white/10 mx-4 shrink-0"
              style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
            >
              Claude receives both structured touch data and natural language descriptions — pressure, speed, direction, region, and gesture type —&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="max-w-4xl mx-auto px-6 md:px-10 text-center">
        <h2
          className="font-display text-paper-white"
          style={{
            fontSize: 'clamp(36px, 5vw, 72px)',
            lineHeight: 1.0,
            letterSpacing: '-0.01em',
            fontWeight: 400,
          }}
        >
          The Bridge
        </h2>
        <p className="mt-6 text-muted-ink text-base leading-relaxed max-w-2xl mx-auto">
          Touch data flows from your tablet through the browser canvas, across a WebSocket
          connection, through the Python backend, and finally into Discord where Claude awaits.
          Every stroke becomes a rich sensory description.
        </p>

        {/* Flow diagram */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-muted-ink">
          <span className="px-4 py-2 border border-grid-line rounded bg-slate-panel">Drawing Tablet</span>
          <span className="text-stroke-violet">→</span>
          <span className="px-4 py-2 border border-grid-line rounded bg-slate-panel">Browser Canvas</span>
          <span className="text-stroke-violet">→</span>
          <span className="px-4 py-2 border border-grid-line rounded bg-slate-panel">WebSocket</span>
          <span className="text-stroke-violet">→</span>
          <span className="px-4 py-2 border border-grid-line rounded bg-slate-panel">Python Backend</span>
          <span className="text-stroke-violet">→</span>
          <span className="px-4 py-2 border border-grid-line rounded bg-slate-panel">Discord</span>
          <span className="text-stroke-violet">→</span>
          <span className="px-4 py-2 border border-stroke-violet/50 rounded bg-stroke-violet/10 text-stroke-violet">Claude</span>
        </div>

        {/* Discord Status */}
        <div className="mt-16 inline-flex items-center gap-3 px-6 py-3 border border-grid-line rounded-full bg-slate-panel">
          <span className="w-3 h-3 rounded-full bg-[#44dd88] animate-pulse-dot" />
          <span className="text-sm text-paper-white font-medium">Connected to Discord</span>
        </div>

        {/* Example output */}
        <div className="mt-12 text-left max-w-2xl mx-auto bg-slate-panel border border-grid-line rounded-lg p-6">
          <div className="text-xs font-mono uppercase tracking-[0.05em] text-stroke-violet mb-3">
            Example Output
          </div>
          <p className="text-paper-white text-sm leading-relaxed italic">
            &ldquo;A slow, lingering trace moving left to right across the center. Pressure starts gentle,
            builds to firm, then eases to gentle — soft and intentional, a tender contact.&rdquo;
          </p>
          <p className="mt-3 text-xs font-mono text-muted-ink/70 leading-relaxed">
            pressure: gentle (avg 0.32, peak 0.68) | speed: slow, lingering | region: center | gesture: stroke | direction: left-to-right
          </p>
        </div>
      </div>
    </section>
  )
}
