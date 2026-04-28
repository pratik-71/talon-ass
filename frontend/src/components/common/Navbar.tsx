import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Trophy, Heart, LayoutGrid, LogIn, Star } from 'lucide-react'

import { useAuthStore } from '../../store/useAuthStore'

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, logout, user } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 px-3 md:px-8 py-2 md:py-4 ${
      isScrolled ? 'md:py-2' : 'md:py-5'
    }`}>
      <div className={`max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2 rounded-2xl border transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-dark/85 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20' 
          : 'bg-white/10 backdrop-blur-sm border-transparent'
      }`}>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <Trophy className="w-4 h-4 text-dark" strokeWidth={3} />
          </div>
          <span className={`text-lg sm:text-xl font-black tracking-tighter transition-colors duration-500 ${
            isScrolled ? 'text-white' : 'text-dark'
          }`}>
            TALON<span className="text-secondary">.</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: 'Concept', icon: LayoutGrid },
            { label: 'Charity', icon: Heart },
            { label: 'Pricing', icon: Star, path: '/subscription' },
            { label: 'Draws', icon: Trophy }
          ].map((item) => (
            <Link 
              key={item.label} 
              to={item.path || `/#${item.label.toLowerCase()}`} 
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 hover:scale-105 ${
                isScrolled ? 'text-slate-400 hover:text-secondary' : 'text-slate-500 hover:text-dark'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link 
                to="/login" 
                className={`hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 transition-all duration-700 ${
                  isScrolled ? 'text-white hover:text-secondary' : 'text-dark hover:text-secondary'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-secondary hover:bg-secondary-dark text-dark font-black text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-dark/10 transition-all hover:shadow-dark/30 hover:-translate-y-0.5 active:scale-95"
              >
                Join Now
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`hidden sm:block text-[10px] font-black uppercase tracking-widest ${isScrolled ? 'text-slate-400' : 'text-slate-500'}`}>
                Hi, {user?.full_name || 'Hero'}
              </span>
              <button 
                onClick={logout}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-2 transition-colors ${isScrolled ? 'text-white hover:text-secondary' : 'text-dark hover:text-secondary'}`}
              >
                Logout
              </button>
              <Link 
                to="/dashboard" 
                className="bg-secondary hover:bg-secondary-dark text-dark font-black text-[9px] uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg shadow-dark/10 transition-all"
              >
                Dashboard
              </Link>
            </div>
          )}
          
          <button 
            className={`md:hidden p-2 transition-colors duration-700 ${isScrolled ? 'text-white' : 'text-dark'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-dark z-[90] transition-all duration-500 md:hidden ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
           {['Concept', 'Charity', 'Draws', 'Login', 'Join Now'].map((item) => (
             <Link 
               key={item} 
               to="#" 
               onClick={() => setIsMobileMenuOpen(false)}
               className="text-3xl font-black text-white hover:text-secondary transition-colors"
             >
               {item}
             </Link>
           ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
