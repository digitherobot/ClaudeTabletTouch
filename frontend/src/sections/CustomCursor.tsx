import { useRef, useEffect, useState } from 'react'

interface CustomCursorProps {
  isActive: boolean
}

export default function CustomCursor({ isActive }: CustomCursorProps) {
  const dotRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!isActive) return

    const handleMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX
      targetRef.current.y = e.clientY
    }

    window.addEventListener('pointermove', handleMove)

    const animate = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.15
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.15
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button, a, [data-cursor-hover]')) {
        setIsHovering(true)
      }
    }
    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button, a, [data-cursor-hover]')) {
        setIsHovering(false)
      }
    }

    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)

    return () => {
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div
      ref={dotRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: isHovering ? 40 : 12,
        height: isHovering ? 40 : 12,
        borderRadius: '50%',
        backgroundColor: '#7b6fde',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: isHovering ? 'difference' : 'normal',
        transition: 'width 0.2s ease, height 0.2s ease',
      }}
    />
  )
}
