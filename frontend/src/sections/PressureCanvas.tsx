import { useRef, useEffect, useState, useCallback } from 'react'
import { Maximize2, Minimize2, Eraser, Pencil } from 'lucide-react'

const WS_URL = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8765'

interface Point { x: number; y: number; pressure: number; timestamp: number; tiltX?: number; tiltY?: number }
interface Stroke { points: Point[]; duration_ms: number; avg_pressure: number; max_pressure: number }
interface PressureCanvasProps { className?: string }

function getRegion(nx: number, ny: number): string {
  const v = ny < 0.33 ? 'upper' : ny < 0.66 ? 'center' : 'lower'
  const h = nx < 0.33 ? 'left' : nx < 0.66 ? 'center' : 'right'
  if (v === 'center' && h === 'center') return 'center'
  if (v === 'center') return h
  if (h === 'center') return v
  return `${v}-${h}`
}

const COLORS = [
  { label: 'Violet', value: '#7b6fde' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Green', value: '#22c55e' },
  { label: 'White', value: '#e0e0e8' },
]

export default function PressureCanvas({ className = '' }: PressureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const strokesRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<any>(null)
  const isDrawingRef = useRef(false)
  const pressureBarRef = useRef<HTMLDivElement>(null)
  const strokeCountRef = useRef<HTMLDivElement>(null)
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Drawing tool refs (high freq, avoid stale closures)
  const toolRef = useRef<'pen' | 'eraser'>('pen')
  const colorRef = useRef('#7b6fde')
  const brushSizeRef = useRef(3)

  // Debug refs
  const dbgPressureRef = useRef<HTMLSpanElement>(null)
  const dbgTiltRef = useRef<HTMLSpanElement>(null)
  const dbgPosRef = useRef<HTMLSpanElement>(null)
  const dbgRegionRef = useRef<HTMLSpanElement>(null)
  const dbgSpeedRef = useRef<HTMLSpanElement>(null)
  const dbgPointerRef = useRef<HTMLSpanElement>(null)
  const dbgStrokesRef = useRef<HTMLSpanElement>(null)
  const dbgShapeRef = useRef<HTMLSpanElement>(null)

  const [status, setStatus] = useState<'disconnected' | 'connected' | 'sending'>('disconnected')
  const [lastMessage, setLastMessage] = useState('Draw on the canvas to send touch to Claude')
  const [, setCurrentPressure] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen')
  const [activeColor, setActiveColor] = useState('#7b6fde')
  const [brushSize, setBrushSize] = useState(3)

  // Sync refs with state
  useEffect(() => { toolRef.current = activeTool }, [activeTool])
  useEffect(() => { colorRef.current = activeColor }, [activeColor])
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize])

  // WebSocket + keepalive ping
  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws

        ws.onopen = () => {
          setStatus('connected')
          setLastMessage('Connected! Draw on the canvas...')
          pingRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }))
            }
          }, 25000)
        }

        ws.onclose = () => {
          setStatus('disconnected')
          setLastMessage('Disconnected. Retrying...')
          if (pingRef.current) clearInterval(pingRef.current)
          retryRef.current = setTimeout(connect, 3000)
        }

        ws.onerror = () => {
          setStatus('disconnected')
          setLastMessage('Cannot connect to backend')
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'ack') {
              if (data.success) {
                setStatus('connected')
                setLastMessage(`Sent! ${(data.natural || '').slice(0, 80)}...`)
                const gesture = data.structured?.gesture || data.structured?.[0]?.gesture || '—'
                const shapeNames = ['heart', 'circle', 'star', 'infinity', 'check', 'spiral', 'moon']
                if (dbgShapeRef.current) {
                  if (shapeNames.includes(gesture)) {
                    dbgShapeRef.current.textContent = gesture
                    dbgShapeRef.current.style.color = '#7b6fde'
                  } else {
                    dbgShapeRef.current.textContent = '—'
                    dbgShapeRef.current.style.color = ''
                  }
                }
                // NOTE: canvas is NOT cleared automatically anymore
              } else {
                setStatus('connected')
                setLastMessage(`Failed: ${data.error || 'Discord send failed'}`)
              }
            } else if (data.type === 'pong') {
              // keepalive received
            }
          } catch {
            // ignore non-JSON messages
          }
        }
      } catch {
        setStatus('disconnected')
        retryRef.current = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (pingRef.current) clearInterval(pingRef.current)
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [])

  // Fullscreen
  useEffect(() => {
    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!wrapperRef.current) return
    if (!document.fullscreenElement) {
      await wrapperRef.current.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const getSimulatedPressure = useCallback((e: PointerEvent): number => {
    if (e.pointerType === 'pen' && e.pressure > 0) return e.pressure
    if (e.pointerType === 'pen') return 0.5
    return 0.3 + Math.random() * 0.4
  }, [])

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(container)
    resize()

    const drawSegment = (prev: any, curr: any) => {
      const isEraser = toolRef.current === 'eraser'
      const p = curr.pressure || 0.3
      const baseWidth = brushSizeRef.current

      ctx.beginPath()
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(curr.x, curr.y)

      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.strokeStyle = 'rgba(0,0,0,1)'
        ctx.lineWidth = baseWidth * 3 * (1 + p * 0.5)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.shadowBlur = 0
      } else {
        const color = colorRef.current
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = color
        ctx.lineWidth = baseWidth * (1 + p * 1.5)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.shadowBlur = p * 8
        ctx.shadowColor = color + '80'
      }

      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.globalCompositeOperation = 'source-over'
    }

    const updateDebug = (e: PointerEvent, nx: number, ny: number) => {
      if (dbgPressureRef.current) dbgPressureRef.current.textContent = e.pressure.toFixed(3)
      if (dbgTiltRef.current) dbgTiltRef.current.textContent = `${e.tiltX || 0}, ${e.tiltY || 0}`
      if (dbgPosRef.current) dbgPosRef.current.textContent = `${nx.toFixed(2)}, ${ny.toFixed(2)}`
      if (dbgRegionRef.current) dbgRegionRef.current.textContent = getRegion(nx, ny)
      if (dbgPointerRef.current) dbgPointerRef.current.textContent = e.pointerType || 'unknown'

      if (currentStrokeRef.current && currentStrokeRef.current.points.length >= 2) {
        const pts = currentStrokeRef.current.points
        const p1 = pts[pts.length - 2]
        const p2 = pts[pts.length - 1]
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dt = p2.timestamp - p1.timestamp
        const speed = dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0
        if (dbgSpeedRef.current) dbgSpeedRef.current.textContent = speed.toFixed(4) + ' u/ms'
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault()
      canvas.setPointerCapture(e.pointerId)
      isDrawingRef.current = true
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const nx = x / rect.width
      const ny = y / rect.height
      const pressure = getSimulatedPressure(e)
      currentStrokeRef.current = {
        points: [{ x: nx, y: ny, pressure, tiltX: e.tiltX || 0, tiltY: e.tiltY || 0, timestamp: Date.now() }],
        startTime: Date.now(),
        canvasPoints: [{ x, y, pressure }],
      }
      updateDebug(e, nx, ny)
    }

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]
      const lastEvt = events[events.length - 1]
      const lastX = lastEvt.clientX - rect.left
      const lastY = lastEvt.clientY - rect.top
      updateDebug(lastEvt, lastX / rect.width, lastY / rect.height)

      const p = lastEvt.pressure || 0.3
      setCurrentPressure(p)
      if (pressureBarRef.current) pressureBarRef.current.style.height = `${p * 100}%`

      if (!isDrawingRef.current || !currentStrokeRef.current) return
      e.preventDefault()

      for (const ce of events) {
        const x = ce.clientX - rect.left
        const y = ce.clientY - rect.top
        const nx = x / rect.width
        const ny = y / rect.height
        const pressure = ce.pressure || 0.3

        const point = {
          x: nx, y: ny, pressure,
          tiltX: ce.tiltX || 0, tiltY: ce.tiltY || 0,
          timestamp: Date.now(),
        }
        currentStrokeRef.current.points.push(point)
        currentStrokeRef.current.canvasPoints.push({ x, y, pressure })

        const pts = currentStrokeRef.current.canvasPoints
        if (pts.length >= 2) {
          drawSegment(pts[pts.length - 2], pts[pts.length - 1])
        }
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDrawingRef.current || !currentStrokeRef.current) return
      e.preventDefault()
      isDrawingRef.current = false
      setCurrentPressure(0)
      if (pressureBarRef.current) pressureBarRef.current.style.height = '0%'
      const duration = Date.now() - currentStrokeRef.current.startTime
      const pressures = currentStrokeRef.current.points.map((p: Point) => p.pressure)
      strokesRef.current.push({
        points: currentStrokeRef.current.points,
        duration_ms: duration,
        avg_pressure: pressures.reduce((a: number, b: number) => a + b, 0) / pressures.length,
        max_pressure: Math.max(...pressures),
      })
      if (strokeCountRef.current) {
        strokeCountRef.current.textContent = `${strokesRef.current.length} stroke${strokesRef.current.length !== 1 ? 's' : ''}`
        strokeCountRef.current.style.opacity = '1'
      }
      if (dbgStrokesRef.current) dbgStrokesRef.current.textContent = String(strokesRef.current.length)
      currentStrokeRef.current = null
      if (dbgSpeedRef.current) dbgSpeedRef.current.textContent = '—'
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('pointerleave', handlePointerUp)

    const preventTouch = (e: TouchEvent) => e.preventDefault()
    canvas.addEventListener('touchstart', preventTouch, { passive: false })
    canvas.addEventListener('touchmove', preventTouch, { passive: false })

    return () => {
      ro.disconnect()
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointerleave', handlePointerUp)
      canvas.removeEventListener('touchstart', preventTouch)
      canvas.removeEventListener('touchmove', preventTouch)
    }
  }, [getSimulatedPressure])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ctx.scale(dpr, dpr)
    strokesRef.current = []
    if (strokeCountRef.current) strokeCountRef.current.style.opacity = '0'
    if (dbgStrokesRef.current) dbgStrokesRef.current.textContent = '0'
    if (dbgShapeRef.current) {
      dbgShapeRef.current.textContent = '—'
      dbgShapeRef.current.style.color = ''
    }
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
  }

  const statusColor = status === 'connected' ? '#44dd88' : status === 'sending' ? '#f0a500' : '#ff4444'

  return (
    <div
      ref={wrapperRef}
      className={`border border-grid-line rounded-lg overflow-hidden flex flex-col bg-slate-void ${
        isFullscreen ? 'fixed inset-0 z-[9999] rounded-none border-0' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-panel border-b border-grid-line shrink-0">
        <h3 className="text-sm font-medium text-paper-white">
          Tablet Touch <span className="text-stroke-violet">— Claude</span>
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: statusColor,
                boxShadow: status !== 'disconnected' ? `0 0 8px ${statusColor}` : 'none',
                transition: 'background-color 0.3s, box-shadow 0.3s',
              }}
            />
            <span className="text-muted-ink capitalize">
              {status === 'sending' ? 'sending...' : status}
            </span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 border border-grid-line rounded text-muted-ink hover:border-stroke-violet hover:text-stroke-violet transition-all duration-200"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Drawing Toolbar */}
      <div className="flex items-center gap-3 px-5 py-2 bg-[#1a1a22] border-b border-grid-line shrink-0 flex-wrap">
        {/* Tool toggle */}
        <div className="flex items-center gap-1 bg-[#141418] rounded border border-grid-line p-0.5">
          <button
            onClick={() => setActiveTool('pen')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded transition-all ${
              activeTool === 'pen'
                ? 'bg-stroke-violet text-white'
                : 'text-muted-ink hover:text-paper-white'
            }`}
            title="Pen"
          >
            <Pencil size={12} /> Pen
          </button>
          <button
            onClick={() => setActiveTool('eraser')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded transition-all ${
              activeTool === 'eraser'
                ? 'bg-stroke-violet text-white'
                : 'text-muted-ink hover:text-paper-white'
            }`}
            title="Eraser"
          >
            <Eraser size={12} /> Eraser
          </button>
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveColor(c.value)}
              className={`w-5 h-5 rounded-full border transition-all ${
                activeColor === c.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>

        {/* Brush size */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-ink">Size</span>
          <input
            type="range"
            min={1}
            max={15}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 h-1 accent-stroke-violet cursor-pointer"
          />
          <span className="text-[11px] text-muted-ink w-4">{brushSize}</span>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full bg-slate-void cursor-crosshair"
        style={{ height: isFullscreen ? 'calc(100vh - 160px)' : '420px' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ touchAction: 'none' }}
        />

        {/* Debug overlay */}
        <div className="absolute top-3 left-3 bg-[#0e0e12]/85 border border-grid-line rounded-lg px-3.5 py-2.5 text-xs font-mono leading-relaxed pointer-events-none min-w-[220px] backdrop-blur-sm">
          <div><span className="text-stroke-violet">Pressure: </span><span ref={dbgPressureRef} className="text-paper-white">—</span></div>
          <div><span className="text-stroke-violet">Tilt X/Y: </span><span ref={dbgTiltRef} className="text-paper-white">—</span></div>
          <div><span className="text-stroke-violet">Position: </span><span ref={dbgPosRef} className="text-paper-white">—</span></div>
          <div><span className="text-stroke-violet">Region: </span><span ref={dbgRegionRef} className="text-paper-white">—</span></div>
          <div><span className="text-stroke-violet">Speed: </span><span ref={dbgSpeedRef} className="text-paper-white">—</span></div>
          <div><span className="text-stroke-violet">Pointer: </span><span ref={dbgPointerRef} className="text-paper-white">—</span></div>
          <div><span className="text-stroke-violet">Strokes: </span><span ref={dbgStrokesRef} className="text-paper-white">0</span></div>
          <div><span className="text-stroke-violet">Shape: </span><span ref={dbgShapeRef} className="text-paper-white">—</span></div>
        </div>

        {/* Pressure bar */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-[200px] bg-slate-panel border border-grid-line rounded-[6px] overflow-hidden pointer-events-none">
          <div
            ref={pressureBarRef}
            className="absolute bottom-0 w-full rounded-b-[5px]"
            style={{
              height: '0%',
              background: 'linear-gradient(to top, #7b6fde, #a78bfa)',
              transition: 'height 80ms ease',
            }}
          />
        </div>

        {/* Stroke counter */}
        <div
          ref={strokeCountRef}
          className="absolute left-4 top-[180px] px-2 py-1 bg-slate-panel/90 border border-grid-line rounded text-xs font-mono text-stroke-violet"
          style={{ opacity: 0, transition: 'opacity 0.2s' }}
        >
          0 strokes
        </div>

        {isFullscreen && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-ink/20 font-mono pointer-events-none">
            Press Esc to exit fullscreen
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-panel border-t border-grid-line gap-3 flex-wrap shrink-0">
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
