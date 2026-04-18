import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const shapes = [
  {
    name: 'Heart',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20 stroke-grid-line hover:stroke-stroke-violet transition-colors duration-500">
        <path
          d="M50 85 C50 85, 10 55, 10 35 C10 20, 25 10, 40 20 C50 28, 50 28, 60 20 C75 10, 90 20, 90 35 C90 55, 50 85, 50 85Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shape-stroke"
          strokeDasharray="300"
          strokeDashoffset="300"
        />
      </svg>
    ),
  },
  {
    name: 'Circle',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20 stroke-grid-line hover:stroke-stroke-violet transition-colors duration-500">
        <circle
          cx="50"
          cy="50"
          r="35"
          strokeWidth="1.5"
          className="shape-stroke"
          strokeDasharray="220"
          strokeDashoffset="220"
        />
      </svg>
    ),
  },
  {
    name: 'Star',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20 stroke-grid-line hover:stroke-stroke-violet transition-colors duration-500">
        <path
          d="M50 15 L60 40 L85 40 L65 55 L72 80 L50 65 L28 80 L35 55 L15 40 L40 40Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shape-stroke"
          strokeDasharray="280"
          strokeDashoffset="280"
        />
      </svg>
    ),
  },
  {
    name: 'Infinity',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20 stroke-grid-line hover:stroke-stroke-violet transition-colors duration-500">
        <path
          d="M30 50 C30 35, 45 35, 50 50 C55 65, 70 65, 70 50 C70 35, 55 35, 50 50 C45 65, 30 65, 30 50Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="shape-stroke"
          strokeDasharray="200"
          strokeDashoffset="200"
        />
      </svg>
    ),
  },
  {
    name: 'Check',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20 stroke-grid-line hover:stroke-stroke-violet transition-colors duration-500">
        <path
          d="M20 55 L40 75 L80 25"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shape-stroke"
          strokeDasharray="140"
          strokeDashoffset="140"
        />
      </svg>
    ),
  },
  {
    name: 'Spiral',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20 stroke-grid-line hover:stroke-stroke-violet transition-colors duration-500">
        <path
          d="M50 50 C50 50, 50 30, 65 30 C80 30, 80 50, 65 60 C50 70, 35 55, 40 40 C45 25, 65 20, 75 35"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="shape-stroke"
          strokeDasharray="200"
          strokeDashoffset="200"
        />
      </svg>
    ),
  },
  {
    name: 'Moon',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20 stroke-grid-line hover:stroke-stroke-violet transition-colors duration-500">
        <path
          d="M65 15 C45 15, 30 35, 30 55 C30 75, 45 90, 65 85 C50 80, 42 65, 42 55 C42 40, 52 25, 65 20Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shape-stroke"
          strokeDasharray="200"
          strokeDashoffset="200"
        />
      </svg>
    ),
  },
]

export default function ShapeRecognitionSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const shapeCards = gridRef.current?.querySelectorAll('.shape-card')
      if (!shapeCards) return

      shapeCards.forEach((card, i) => {
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })

        const stroke = card.querySelector('.shape-stroke') as SVGGeometryElement
        if (stroke) {
          const length = stroke.getTotalLength?.() || 200

          card.addEventListener('mouseenter', () => {
            gsap.to(stroke, {
              strokeDashoffset: 0,
              duration: 0.8,
              ease: 'power2.out',
            })
          })
          card.addEventListener('mouseleave', () => {
            gsap.to(stroke, {
              strokeDashoffset: length,
              duration: 0.5,
              ease: 'power2.in',
            })
          })
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full py-[180px] px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="font-display text-paper-white"
            style={{
              fontSize: 'clamp(36px, 5vw, 72px)',
              lineHeight: 1.0,
              letterSpacing: '-0.01em',
              fontWeight: 400,
            }}
          >
            Shape Recognition
          </h2>
          <p className="mt-6 text-muted-ink text-base max-w-2xl mx-auto leading-relaxed">
            Seven shapes. Infinite intent. The app uses the $1 Unistroke Recognizer algorithm
            to identify drawn shapes. Record your own templates so recognition is tuned to your hand.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {shapes.map((shape) => (
            <div
              key={shape.name}
              className="shape-card group flex flex-col items-center justify-center p-8 border border-grid-line bg-slate-panel/50 hover:bg-slate-panel transition-colors duration-300 cursor-pointer aspect-square"
            >
              {shape.svg}
              <span className="mt-4 text-xs font-mono uppercase tracking-[0.05em] text-muted-ink group-hover:text-paper-white transition-colors duration-300">
                {shape.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-ink/60 font-mono">
            <span className="w-2 h-2 rounded-full bg-stroke-violet" />
            <span>Hover to reveal stroke animation</span>
          </div>
        </div>
      </div>
    </section>
  )
}
