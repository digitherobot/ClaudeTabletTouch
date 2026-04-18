import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function FooterSection() {
  const footerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const footer = footerRef.current
    const content = contentRef.current
    if (!footer || !content) return

    const ctx = gsap.context(() => {
      gsap.from(content, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    }, footer)

    return () => ctx.revert()
  }, [])

  return (
    <footer
      id="footer-section"
      ref={footerRef}
      className="relative w-full bg-slate-panel mt-[180px] overflow-hidden"
    >
      {/* Diagonal accent */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className="absolute w-[3px] h-[200%] bg-gradient-to-b from-transparent via-stroke-violet/30 to-transparent"
          style={{ top: '-50%', right: '20%', transform: 'rotate(35deg)' }}
        />
      </div>

      <div ref={contentRef} className="relative max-w-7xl mx-auto px-6 md:px-10 py-20" style={{ zIndex: 2 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About */}
          <div>
            <div className="font-mono text-sm tracking-[0.1em] text-paper-white uppercase mb-4">DIGI</div>
            <p className="text-muted-ink text-sm leading-relaxed">
              Building bridges between human creativity and artificial intelligence.
              Creator of ClaudeTabletTouch — a pressure-sensitive interface for communicating
              with AI through physical touch.
            </p>
            <div className="mt-4 text-xs font-mono text-muted-ink/50 break-all">
              0x0000000000000000000
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.05em] text-muted-ink mb-4">Resources</div>
            <ul className="space-y-3">
              <li>
                <a href="https://github.com/digitherobot/ClaudeTabletTouch" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-ink hover:text-paper-white transition-colors duration-200">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://github.com/digitherobot/ClaudeTabletTouch#setup" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-ink hover:text-paper-white transition-colors duration-200">
                  Setup Guide
                </a>
              </li>
              <li>
                <a href="https://github.com/digitherobot/ClaudeTabletTouch#shape-recognition" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-ink hover:text-paper-white transition-colors duration-200">
                  Shape Recognition Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.05em] text-muted-ink mb-4">Connect</div>
            <ul className="space-y-3">
              <li>
                <a href="https://x.com/digirobot" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-ink hover:text-paper-white transition-colors duration-200 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X — @digirobot
                </a>
              </li>
              <li>
                <a href="https://github.com/digitherobot" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-ink hover:text-paper-white transition-colors duration-200 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub — digitherobot
                </a>
              </li>
              <li>
                <a href="https://github.com/digitherobot/ClaudeTabletTouch/stargazers" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-ink hover:text-paper-white transition-colors duration-200 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                  </svg>
                  Star on GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-grid-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-ink/50 font-mono">
            Built by digitherobot. Open source under MIT license.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://x.com/digirobot" target="_blank" rel="noopener noreferrer"
              className="text-muted-ink/50 hover:text-muted-ink transition-colors duration-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://github.com/digitherobot" target="_blank" rel="noopener noreferrer"
              className="text-muted-ink/50 hover:text-muted-ink transition-colors duration-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <div className="text-xs text-muted-ink/50 font-mono">Tablet Touch — Claude Bridge</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
