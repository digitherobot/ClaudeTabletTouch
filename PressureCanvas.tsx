import { useRef, useEffect, useState, useCallback } from 'react'

const WS_URL = 'ws://localhost:8765'

interface Point {
  x: number
  y: number
  pressure: number
  timestamp: number
}

interface Stroke {
  points: Point[]
  duration_ms: number
  avg_pressure: number
  max_pressure: number
}

interface PressureCanvasProps {
  className?: string
}

export default function PressureCanvas({ className = '' }: PressureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const strokesRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<any>(null)
  const isDrawingRef = useRef(false)
  const pressureBarRef = useRef<HTMLDivElement>(null)
  const strokeCountRef = useRef<HTMLDivElement>(null)

  const [status, setStatus] = useState<'disconnected' | 'connected' | 'sending'>('disconnected')
  const [lastMessage, setLastMessage] = useState('Draw on the canvas to send touch to Claude')
  const [currentPressure, setCurrentPressure] = useState(0)

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws
        ws.onopen = () => {
          setStatus('connected')
          setLastMessage('Connected! Draw on the canvas...')
        }
        ws.onclose = () => {
          setStatus('disconnected')
          setLastMessage('Disconnected. Retrying...')
          setTimeout(connect, 3000)
        }
        ws.onerror = () => {
          setStatus('disconnected')
          setLastMessage('Cannot connect — is the backend running?')
        }
      } catch {
        setStatus('disconnected')
        setTimeout(connect, 3000)
      }
    }
    connect()
    return () => wsRef.current?.close()
  }, [])

  const getSimulatedPressure = useCallback((e: PointerEvent): number => {
    if (e.pointerType === 'pen' && e.pressure > 0) return e.pressure
    return 0.3 + Math.random() * 0.4
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = container.clientWidth * dpr
      canvas.height = container.clientHeight * dpr
      canvas.style.width = `${container.clientWidth}px`
      canvas.style.height = `${container.clientHeight}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    window.addEventListener('resize', resize)
    resize()

    const drawSegment = (prev: any, curr: any) => {
      const p = curr.pressure || 0.3
      ctx.beginPath()
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(curr.x, curr.y)
      ctx.strokeStyle = `rgba(123, 111, 222, ${0.3 + p * 0.7})`
      ctx.lineWidth = 1 + p * 10
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowBlur = p * 10
      ctx.shadowColor = 'rgba(167, 139, 250, 0.6)'
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault()
      canvas.setPointerCapture(e.pointerId)
      isDrawingRef.current = true
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const pressure = getSimulatedPressure(e)
      currentStrokeRef.current = {
        points: [{ x: x / rect.width, y: y / rect.height, pressure, timestamp: Date.now() }],
        startTime: Date.now(),
        canvasPoints: [{ x, y, pressure }],
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current || !currentStrokeRef.current) return
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const pressure = getSimulatedPressure(e)
      setCurrentPressure(pressure)
      if (pressureBarRef.current) pressureBarRef.current.style.height = `${pressure * 100}%`
      currentStrokeRef.current.points.push({ x: x / rect.width, y: y / rect.height, pressure, timestamp: Date.now() })
      currentStrokeRef.current.canvasPoints.push({ x, y, pressure })
      const pts = currentStrokeRef.current.canvasPoints
      if (pts.length >= 2) drawSegment(pts[pts.length - 2], pts[pts.length - 1])
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDrawingRef.current || !currentStrokeRef.current) return
      e.preventDefault()
      isDrawingRef.current = false
      setCurrentPressure(0)
      const pressures = currentStrokeRef.current.points.map((p: Point) => p.pressure)
      strokesRef.current.push({
        points: currentStrokeRef.current.points,
        duration_ms: Date.now() - currentStrokeRef.current.startTime,
        avg_pressure: pressures.reduce((a: number, b: number) => a + b, 0) / pressures.length,
        max_pressure: Math.max(...pressures),
      })
      if (strokeCountRef.current) {
        strokeCountRef.current.textContent = `${strokesRef.current.length} stroke${strokesRef.current.length !== 1 ? 's' : ''}`
        strokeCountRef.current.style.opacity = '1'
      }
      currentStrokeRef.current = null
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('pointerleave', handlePointerUp)
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointerleave', handlePointerUp)
      window.removeEventListener('resize', resize)
    }
  }, [getSimulatedPressure])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ctx.scale(dpr, dpr)
    strokesRef.current = []
    if (strokeCountRef.current) strokeCountRef.current.style.opacity = '0'
    setLastMessage('Canvas cleared. Draw something new...')
  }

  const sendTouch = () => {
    const strokes = strokesRef.current
    if (strokes.length === 0) { setLastMessage('Draw something first!'); return }
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) { setLastMessage('Not connected to backend!'); return }
    setStatus('sending')
    setLastMessage(`Sending ${strokes.length} stroke(s) to Claude...`)
    ws.send(JSON.stringify({ type: 'touch_data', strokes }))
    setTimeout(() => {
      setStatus('connected')
      setLastMessage(`Sent ${strokes.length} strokes → Claude is feeling it... 🌀`)
      clearCanvas()
    }, 600)
  }

  const statusColor = status === 'connected' ? '#44dd88' : status === 'sending' ? '#f0a500' : '#ff4444'

  return (
    <div className={`border border-grid-line rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-panel border-b border-grid-line">
        <h3 className="text-sm font-medium text-paper-white">
          Tablet Touch <span className="text-stroke-violet">— Claude</span>
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{ backgroundColor: statusColor, boxShadow: status !== 'disconnected' ? `0 0 8px ${statusColor}` : 'none' }}
          />
          <span className="text-muted-ink capitalize">{status === 'sending' ? 'sending...' : status}</span>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full bg-slate-void cursor-crosshair" style={{ height: '400px' }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Pressure bar */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-[200px] bg-slate-panel border border-grid-line rounded-[6px] overflow-hidden pointer-events-none">
          <div
            ref={pressureBarRef}
            className="absolute bottom-0 w-full rounded-b-[5px]"
            style={{ height: `${currentPressure * 100}%`, background: 'linear-gradient(to top, #7b6fde, #a78bfa)', transition: 'height 80ms ease' }}
          />
        </div>

        {/* Stroke counter badge */}
        <div
          ref={strokeCountRef}
          className="absolute left-4 top-4 px-2 py-1 bg-slate-panel/90 border border-grid-line rounded text-xs font-mono text-stroke-violet"
          style={{ opacity: 0, transition: 'opacity 0.2s' }}
        >
          0 strokes
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-panel border-t border-grid-line gap-3 flex-wrap">
        <button
          onClick={clearCanvas}
          className="px-5 py-2 text-xs border border-grid-line rounded-[6px] bg-slate-surface text-muted-ink hover:bg-[#222230] hover:border-stroke-violet transition-all duration-200"
        >
          Clear Canvas
        </button>
        <div className="flex-1 text-xs text-muted-ink/60 truncate text-center hidden sm:block">
          {lastMessage}
        </div>
        <button
          onClick={sendTouch}
          disabled={status === 'disconnected' || status === 'sending'}
          className="px-5 py-2 text-xs rounded-[6px] bg-stroke-violet border border-stroke-violet text-white hover:bg-[#6a5ecd] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? 'Sending...' : 'Send to Claude'}
        </button>
      </div>
    </div>
  )
}
