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
            href="https://x.com/claudetablet?s=21"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-ink hover:text-paper-white transition-colors duration-200"
            title="@claudetablet on X"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* Discord */}
          <a
            href="https://discord.gg/qFxU2JT9"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-ink hover:text-[#5865F2] transition-colors duration-200"
            title="Join our Discord"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
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
