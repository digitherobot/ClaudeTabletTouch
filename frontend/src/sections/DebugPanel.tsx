import { useEffect, useState } from 'react'

export default function DebugPanel() {
  const [data, setData] = useState({
    pressure: '—',
    tilt: '—',
    pos: '—',
    region: '—',
    speed: '—',
    pointer: '—',
    strokes: '0',
    shape: '—',
  })

  useEffect(() => {
    const regions = ['center', 'upper-left', 'upper', 'upper-right', 'left', 'right', 'lower-left', 'lower', 'lower-right']
    let frame = 0

    const interval = setInterval(() => {
      frame++
      if (frame % 3 !== 0) return

      const pressure = (Math.random() * 0.8 + 0.1).toFixed(3)
      const tiltX = (Math.random() * 60 - 30).toFixed(1)
      const tiltY = (Math.random() * 60 - 30).toFixed(1)
      const nx = (Math.random()).toFixed(2)
      const ny = (Math.random()).toFixed(2)
      const region = regions[Math.floor(Math.random() * regions.length)]
      const speed = (Math.random() * 0.008 + 0.001).toFixed(4)
      const pointerTypes = ['pen', 'pen', 'pen', 'mouse']
      const pointer = pointerTypes[Math.floor(Math.random() * pointerTypes.length)]

      setData({
        pressure,
        tilt: `${tiltX}, ${tiltY}`,
        pos: `${nx}, ${ny}`,
        region,
        speed: `${speed} u/ms`,
        pointer,
        strokes: String(Math.floor(Math.random() * 5)),
        shape: '—',
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  const rows = [
    { label: 'Pressure', key: 'pressure' },
    { label: 'Tilt X/Y', key: 'tilt' },
    { label: 'Position', key: 'pos' },
    { label: 'Region', key: 'region' },
    { label: 'Speed', key: 'speed' },
    { label: 'Pointer', key: 'pointer' },
    { label: 'Strokes', key: 'strokes' },
    { label: 'Shape', key: 'shape' },
  ] as const

  return (
    <div className="bg-[rgba(14,14,18,0.85)] border border-grid-line rounded-lg p-4 font-mono text-xs leading-relaxed min-w-[220px] select-none">
      {rows.map(({ label, key }) => (
        <div key={key}>
          <span className="text-stroke-violet">{label}: </span>
          <span className="text-paper-white">{data[key as keyof typeof data]}</span>
        </div>
      ))}
    </div>
  )
}
