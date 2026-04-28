import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Homepage from './pages/Homepage'
import Lenis from 'lenis'
import gsap from 'gsap'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Subscription from './pages/Subscription'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Refund from './pages/Refund'
import Dashboard from './pages/Dashboard'
import SubscriptionSuccess from './pages/SubscriptionSuccess'
import PageLoader from './components/common/PageLoader'

import { useThemeStore } from './store/useThemeStore'

function App() {
  const [initialLoading, setInitialLoading] = React.useState(true)
  const { colors } = useThemeStore()
  const location = useLocation()

  useEffect(() => {
    // Artificial delay for premium loading feel
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Inject Theme Store colors into CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-dark', colors.dark);
    root.style.setProperty('--color-slate-500', colors.gray);
    root.style.setProperty('--color-slate-50', colors.lightGray);
  }, [colors])

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Optional: Sync ScrollTrigger with Lenis
    lenis.on('scroll', () => {
      // gsap.update() or ScrollTrigger.update() if needed
    })

    return () => {
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
    
    // Page transition animation
    gsap.fromTo('main', 
      { opacity: 0, y: 10 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-white font-sans antialiased selection:bg-secondary selection:text-dark">
      {initialLoading && <PageLoader message="Initializing Talon" />}
      <Navbar />
      <main className="relative">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
