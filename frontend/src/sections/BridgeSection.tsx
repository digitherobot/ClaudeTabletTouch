import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8765'

gsap.registerPlugin(ScrollTrigger)

export default function BridgeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [discordStatus, setDiscordStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Not ok')
        const data = await res.json()
        setDiscordStatus(data.discord_ready ? 'connected' : 'disconnected')
      } catch {
        setDiscordStatus('disconnected')
      }
    }
    checkHealth()
    const iv = setInterval(checkHealth, 10000)
    return () => clearInterval(iv)
  }, [])

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

  const statusConfig = {
    connected: {
      dot: '#44dd88',
      shadow: '0 0 0 0 rgba(68, 221, 136, 0.4)',
      label: 'Connected to Discord',
    },
    disconnected: {
      dot: '#ff4444',
      shadow: '0 0 0 0 rgba(255, 68, 68, 0.4)',
      label: 'Discord Disconnected',
    },
    loading: {
      dot: '#f0a500',
      shadow: '0 0 0 0 rgba(240, 165, 0, 0.4)',
      label: 'Checking Discord...',
    },
  }

  const currentStatus = statusConfig[discordStatus]

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
          <span
            className="w-3 h-3 rounded-full animate-pulse-dot"
            style={{
              backgroundColor: currentStatus.dot,
              boxShadow: `0 0 0 0 ${currentStatus.dot}66`,
            }}
          />
          <span className="text-sm text-paper-white font-medium">{currentStatus.label}</span>
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

        {/* Discord Community CTA */}
        <div className="mt-12 max-w-lg mx-auto">
          <a
            href="https://discord.gg/qFxU2JT9"
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative overflow-hidden rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 transition-all duration-300"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#5865F2]/20 rounded-full blur-2xl group-hover:bg-[#5865F2]/30 transition-all duration-500" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#5865F2]/10 rounded-full blur-2xl group-hover:bg-[#5865F2]/20 transition-all duration-500" />
            </div>
            <div className="relative flex items-center gap-5 px-8 py-6">
              <div className="shrink-0 w-12 h-12 rounded-full bg-[#5865F2]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#5865F2]">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-paper-white font-medium text-sm">Join the Discord Community</div>
                <div className="text-muted-ink text-xs mt-1">
                  See live touch outputs, share feedback, and hang out with ClaudeTabletTouch users.
                </div>
              </div>
              <div className="ml-auto shrink-0 text-[#5865F2] group-hover:translate-x-1 transition-transform duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
