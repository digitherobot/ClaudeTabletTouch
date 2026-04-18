import { useRef, useEffect } from 'react'

export default function InkSurface() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isDrawing = false

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = container.clientWidth * dpr
      canvas.height = container.clientHeight * dpr
      canvas.style.width = `${container.clientWidth}px`
      canvas.style.height = `${container.clientHeight}px`
      ctx.scale(dpr, dpr)
    }

    window.addEventListener('resize', resize)
    resize()

    const startDraw = (e: PointerEvent) => {
      isDrawing = true
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#7b6fde'
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.shadowColor = '#a78bfa'
    }

    const draw = (e: PointerEvent) => {
      if (!isDrawing) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    const stopDraw = () => {
      isDrawing = false
      ctx.closePath()
    }

    canvas.addEventListener('pointerdown', startDraw)
    canvas.addEventListener('pointermove', draw)
    canvas.addEventListener('pointerup', stopDraw)
    canvas.addEventListener('pointerleave', stopDraw)

    return () => {
      canvas.removeEventListener('pointerdown', startDraw)
      canvas.removeEventListener('pointermove', draw)
      canvas.removeEventListener('pointerup', stopDraw)
      canvas.removeEventListener('pointerleave', stopDraw)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-96 border border-grid-line bg-slate-void overflow-hidden cursor-crosshair"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-3 right-3 text-xs text-muted-ink/50 font-mono">
        Click & drag to draw
      </div>
    </div>
  )
}
