import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trophy, Menu, X, LayoutDashboard, CreditCard, LogOut, User, ChevronDown, Heart, Zap, Target, MessageSquare } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  
  const guestLinks = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Charities', href: '/charities', icon: Heart },
    { label: 'Pricing', href: '/subscription', icon: Zap },
  ]

  const memberLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Charities', href: '/charities', icon: Heart },
    { label: 'Admin Panel', href: '/admin', icon: Target },
  ]

  const navLinks = isAuthenticated ? memberLinks : guestLinks;
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Determine if we're on a dark-bg page (dashboard)
  const isDarkPage = location.pathname === '/dashboard'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const isActive = (href: string) => location.pathname === href

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 px-3 md:px-6 py-2 md:py-3`}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-2xl border transition-all duration-300 ${
          scrolled || isDarkPage
            ? 'bg-slate-900/95 backdrop-blur-xl border-white/8 shadow-xl shadow-black/30'
            : 'bg-white/80 backdrop-blur-md border-slate-200/60 shadow-sm'
        }`}>

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20 group-hover:scale-110 transition-transform duration-200">
              <Trophy className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className={`text-lg font-extrabold tracking-tight transition-colors duration-300 ${
              scrolled || isDarkPage ? 'text-white' : 'text-slate-900'
            }`}>
              TALON<span className="text-secondary">.</span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.href}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-secondary/15 text-secondary'
                    : scrolled || isDarkPage
                    ? 'text-slate-300 hover:text-white hover:bg-white/8'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              /* ── Profile Dropdown ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  id="profile-menu-btn"
                  onClick={() => setDropdownOpen(p => !p)}
                  className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border transition-all duration-200 group ${
                    scrolled || isDarkPage
                      ? 'border-white/10 hover:border-white/20 hover:bg-white/8'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-emerald-600 flex items-center justify-center text-slate-900 text-xs font-extrabold shadow-md">
                    {initials}
                  </div>
                  <span className={`hidden sm:block text-sm font-semibold max-w-[100px] truncate transition-colors ${
                    scrolled || isDarkPage ? 'text-white' : 'text-slate-800'
                  }`}>
                    {user?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-all duration-200 ${dropdownOpen ? 'rotate-180' : ''} ${
                    scrolled || isDarkPage ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                </button>

                {/* Dropdown Panel */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-in">

                    {/* User Info */}
                    <div className="px-4 py-4 border-b border-white/8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-emerald-600 flex items-center justify-center text-slate-900 text-sm font-extrabold flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm truncate">{user?.full_name || 'Hero'}</p>
                          <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                        </div>
                      </div>
                      {/* Sub status badge */}
                      <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        user?.subscription_status === 'active'
                          ? 'bg-secondary/15 text-secondary'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user?.subscription_status === 'active' ? 'bg-secondary' : 'bg-red-400'}`} />
                        {user?.subscription_status === 'active' ? `Active · ${user?.plan_type === 'yearly' ? 'Yearly' : 'Monthly'}` : 'No Active Plan'}
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 text-sm font-semibold transition-all group"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500 group-hover:text-secondary transition-colors" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/subscription"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 text-sm font-semibold transition-all group"
                      >
                        <CreditCard className="w-4 h-4 text-slate-500 group-hover:text-secondary transition-colors" />
                        Manage Subscription
                      </Link>
                      
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 text-sm font-semibold transition-all group"
                      >
                        <User className="w-4 h-4 text-slate-500 group-hover:text-secondary transition-colors" />
                        My Profile & Identity
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-white/8">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-semibold transition-all group"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Guest Buttons ── */
              <>
                <Link
                  to="/login"
                  className={`hidden sm:block px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    scrolled
                      ? 'text-slate-300 hover:text-white hover:bg-white/8'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-secondary text-slate-900 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-secondary/20 hover:shadow-secondary/30 hover:-translate-y-px active:scale-95"
                >
                  Join Free
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className={`md:hidden p-2 rounded-xl transition-colors ${
                scrolled || isDarkPage ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => setMobileOpen(p => !p)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div className={`fixed inset-0 z-[90] md:hidden transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer */}
        <div className={`absolute right-0 top-0 h-full w-[280px] bg-slate-900 border-l border-white/10 shadow-2xl transition-transform duration-300 flex flex-col ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-slate-900" strokeWidth={2.5} />
              </div>
              <span className="text-white font-extrabold tracking-tight">TALON<span className="text-secondary">.</span></span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User block (if logged in) */}
          {isAuthenticated && (
            <div className="px-4 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-emerald-600 flex items-center justify-center text-slate-900 text-sm font-extrabold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{user?.full_name || 'Hero'}</p>
                  <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                </div>
              </div>
              <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                user?.subscription_status === 'active' ? 'bg-secondary/15 text-secondary' : 'bg-red-500/15 text-red-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${user?.subscription_status === 'active' ? 'bg-secondary' : 'bg-red-400'}`} />
                {user?.subscription_status === 'active' ? `Active · ${user?.plan_type === 'yearly' ? 'Yearly' : 'Monthly'}` : 'No Active Plan'}
              </div>
            </div>
          )}

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 text-sm font-semibold transition-all"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="h-px bg-white/8 my-2" />
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 text-sm font-semibold transition-all">
                  <LayoutDashboard className="w-4 h-4 text-slate-500" /> Dashboard
                </Link>
                <Link to="/subscription" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 text-sm font-semibold transition-all">
                  <CreditCard className="w-4 h-4 text-slate-500" /> Subscription
                </Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 text-sm font-semibold transition-all">
                  <User className="w-4 h-4 text-slate-500" /> My Profile
                </Link>
              </>
            )}
          </nav>

          {/* Bottom actions */}
          <div className="px-3 pb-6 pt-3 border-t border-white/8 space-y-2">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-all">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-3 text-slate-300 hover:text-white hover:bg-white/8 rounded-xl text-sm font-semibold transition-all">
                  Log In
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-3 bg-secondary text-slate-900 rounded-xl text-sm font-bold hover:brightness-110 transition-all">
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
