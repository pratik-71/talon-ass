import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Lenis from 'lenis'
import gsap from 'gsap'

// Lazy loaded pages
const Homepage = lazy(() => import('./pages/Homepage'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Subscription = lazy(() => import('./pages/Subscription'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Refund = lazy(() => import('./pages/Refund'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const Messages = lazy(() => import('./pages/Messages'))
const WinnerVerification = lazy(() => import('./pages/WinnerVerification'))
const CharityDirectory = lazy(() => import('./pages/CharityDirectoryPage'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const Profile = lazy(() => import('./pages/Profile'))

import Splash from './components/common/Splash'
import PageLoader from './components/common/PageLoader'

import { useThemeStore } from './store/useThemeStore'
import { useAuthStore } from './store/useAuthStore'

function App() {
  const [initialLoading, setInitialLoading] = React.useState(true)
  const { colors } = useThemeStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const isAdminPage = location.pathname.startsWith('/admin')

  // Global Security Interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout()
          navigate('/login')
        }
        return Promise.reject(error)
      }
    )
    return () => axios.interceptors.response.eject(interceptor)
  }, [logout, navigate])

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-dark', colors.dark);
    root.style.setProperty('--color-slate-500', colors.gray);
    root.style.setProperty('--color-slate-50', colors.lightGray);
  }, [colors])

  const lenisRef = React.useRef<any>(null);

  useEffect(() => {
    if (isAdminPage) return;
    
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })
    
    lenisRef.current = lenis;
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    }
  }, [isAdminPage])

    // Robust Scroll-to-Top on Route Change
    useEffect(() => {
      window.scrollTo(0, 0);
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
      
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }, 50);

      gsap.fromTo('main', 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'all' }
      );

      return () => clearTimeout(timer);
    }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white font-sans antialiased selection:bg-secondary selection:text-dark">
      {initialLoading && <Splash onComplete={() => setInitialLoading(false)} />}
      
      {!isAdminPage && <Navbar />}
      
      <main className="relative">
        <Suspense fallback={<PageLoader message="Loading Module..." />}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/terms-and-conditions" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/charities" element={<CharityDirectory />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/verify-winner/:winnerId" element={<WinnerVerification />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminPage && <Footer />}
    </div>
  )
}

export default App
