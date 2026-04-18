import { useEffect, useRef, useState } from 'react'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#141418]/90 backdrop-blur-[12px] border-b border-grid-line'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-10 py-3">
        <div className="font-mono text-sm tracking-[0.1em] text-paper-white uppercase">
          DIGI
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo('interface-section')}
            className="text-sm text-muted-ink hover:text-paper-white transition-colors duration-200"
          >
            Interface
          </button>
          <button
            onClick={() => scrollTo('gesture-section')}
            className="text-sm text-muted-ink hover:text-paper-white transition-colors duration-200"
          >
            Gestures
          </button>
          <button
            onClick={() => scrollTo('bridge-section')}
            className="text-sm text-muted-ink hover:text-paper-white transition-colors duration-200"
          >
            Bridge
          </button>
          <button
            onClick={() => scrollTo('footer-section')}
            className="text-sm text-muted-ink hover:text-paper-white transition-colors duration-200"
          >
            Profile
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* X / Twitter */}
          <a
            href="https://x.com/digirobot"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-ink hover:text-paper-white transition-colors duration-200"
            title="@digirobot on X"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* Try It */}
          <button
            onClick={() => scrollTo('interface-section')}
            className="px-5 py-2 text-xs font-medium tracking-[0.05em] uppercase border border-stroke-violet/50 rounded-[6px] bg-stroke-violet/10 text-stroke-violet hover:bg-stroke-violet/20 hover:border-stroke-violet transition-all duration-200"
          >
            Try It
          </button>
        </div>
      </div>
    </nav>
  )
}
