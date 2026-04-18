import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import InkSurface from './InkSurface'
import PressureCanvas from './PressureCanvas'
import DebugPanel from './DebugPanel'

gsap.registerPlugin(ScrollTrigger)

export default function InterfaceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(leftRef.current, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })
      gsap.from(rightRef.current, {
        x: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })
      gsap.from(canvasRef.current, {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: canvasRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="interface-section"
      ref={sectionRef}
      className="relative w-full py-[180px] px-6 md:px-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top section: Text + Ink Surface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          <div ref={leftRef}>
            <h2
              className="font-display text-paper-white"
              style={{
                fontSize: 'clamp(36px, 5vw, 72px)',
                lineHeight: 1.0,
                letterSpacing: '-0.01em',
                fontWeight: 400,
              }}
            >
              The Interface
            </h2>
            <p className="mt-6 text-muted-ink text-base leading-relaxed max-w-md">
              A browser-based canvas captures pen input via the Pointer Events API.
              Pressure, tilt, position, and speed are all read in real-time through
              the browser&apos;s native pointer events — no plugins required.
            </p>
            <p className="mt-4 text-muted-ink text-base leading-relaxed max-w-md">
              Built for Huion drawing tablets with Windows Ink support, but works
              with any tablet that exposes pressure data to the browser. The canvas
              uses coalesced events for higher-fidelity input capture.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] border border-grid-line rounded text-muted-ink">
                Pressure
              </span>
              <span className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] border border-grid-line rounded text-muted-ink">
                Tilt X/Y
              </span>
              <span className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] border border-grid-line rounded text-muted-ink">
                Speed
              </span>
              <span className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] border border-grid-line rounded text-muted-ink">
                Region
              </span>
            </div>
            <div className="mt-8">
              <DebugPanel />
            </div>
          </div>
          <div ref={rightRef}>
            <InkSurface />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-ink/50 font-mono">Live ink surface</span>
              <span className="text-xs text-muted-ink/50 font-mono">Pointer Events API</span>
            </div>
          </div>
        </div>

        {/* Full-width Tablet Touch Demo */}
        <div ref={canvasRef} className="mt-12">
          <div className="text-center mb-8">
            <h3 className="font-display text-paper-white text-2xl md:text-3xl" style={{ fontWeight: 400 }}>
              Try the Tablet Interface
            </h3>
            <p className="mt-2 text-muted-ink text-sm">
              Draw on the canvas below to experience the pressure-sensitive interface.
            </p>
          </div>
          <PressureCanvas />
        </div>
      </div>
    </section>
  )
}
