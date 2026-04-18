import { useEffect, useState } from 'react'
import { useLenis } from '@/hooks/useLenis'
import Navigation from '@/sections/Navigation'
import HeroSection from '@/sections/HeroSection'
import InterfaceSection from '@/sections/InterfaceSection'
import GestureFlowSection from '@/sections/GestureFlowSection'
import ShapeRecognitionSection from '@/sections/ShapeRecognitionSection'
import BridgeSection from '@/sections/BridgeSection'
import FooterSection from '@/sections/FooterSection'
import CustomCursor from '@/sections/CustomCursor'

export default function Home() {
  useLenis()

  const [heroActive, setHeroActive] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById('hero-section')
      if (!heroEl) return
      const rect = heroEl.getBoundingClientRect()
      setHeroActive(rect.bottom > 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative">
      <CustomCursor isActive={heroActive} />
      <Navigation />
      <main>
        <HeroSection />
        <InterfaceSection />
        <GestureFlowSection />
        <ShapeRecognitionSection />
        <BridgeSection />
        <FooterSection />
      </main>
    </div>
  )
}
