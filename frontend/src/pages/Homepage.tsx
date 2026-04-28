import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  ArrowUpRight,
  Users,
  Globe
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Homepage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Snappier Hero Stagger
      const tl = gsap.timeline()
      tl.from('.hero-animate', {
        opacity: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power4.out',
        delay: 0.1
      })
      .from('.hero-image-wrap', {
        opacity: 0,
        x: 40,
        scale: 0.98,
        duration: 0.8,
        ease: 'expo.out'
      }, '-=0.4')

      // Scroll Reveal Animations
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          y: 20,
          duration: 0.7,
          ease: 'power3.out'
        })
      })

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="bg-white overflow-x-hidden">
      {/* --- PREMIUM HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex items-center pt-16 pb-16 px-6 lg:px-16 overflow-hidden">
        {/* Cinematic Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[80%] bg-secondary/5 blur-[140px] rounded-full pointer-events-none animate-pulse duration-[8s]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-dark/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-8xl mx-auto mt-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Content Column */}
          <div className="lg:col-span-7 z-10">
            <div className="hero-animate inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full mb-6">
              <div className="w-2 h-2 bg-secondary rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">The Future of Performance</span>
            </div>
            
            <h1 className="hero-animate text-5xl sm:text-6xl md:text-7xl lg:text-[82px] font-black text-dark leading-[0.88] tracking-[-0.04em] mb-8">
              Master the <span className="text-secondary">Game</span>. <br />
              Change the <span className="gradient-text">World</span>.
            </h1>
            
            <p className="hero-animate text-base sm:text-lg text-slate-500 max-w-lg mb-8 leading-relaxed font-medium">
              TALON is an elite subscription ecosystem where <span className="text-dark font-bold">professional golf metrics</span> meet <span className="text-secondary font-bold">global social impact</span>. Compete in monthly draws, track your progress, and support world-class charities.
            </p>
            
            <div className="hero-animate flex flex-col sm:flex-row items-center gap-4 mb-12">
              <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="w-full sm:w-auto px-10 py-5 bg-dark text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-all shadow-2xl shadow-dark/30 flex items-center justify-center gap-3 group">
                {isAuthenticated ? 'Go to Dashboard' : 'Begin Your Journey'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link to="/#concept" className="w-full sm:w-auto px-10 py-5 border-2 border-slate-200 text-dark text-sm font-black rounded-xl hover:bg-slate-50 hover:border-dark transition-all text-center">
                Explore the Concept
              </Link>
            </div>

            {/* Trust Bar / Stats */}
            <div className="hero-animate flex flex-wrap items-center gap-8 opacity-60">
              <div className="flex flex-col">
                <span className="text-xl font-black text-dark tracking-tighter">190+</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Countries</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-xl font-black text-dark tracking-tighter">$2.4M</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Impact</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-xl font-black text-dark tracking-tighter">50+</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Charities</span>
              </div>
            </div>
          </div>

          {/* Visual Column */}
          <div className="lg:col-span-5 hero-image-wrap relative">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.25)] border-[10px] border-white ring-1 ring-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200" 
                alt="Modern Golf"
                className="w-full aspect-[4/4] object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/10 to-transparent" />
              
              {/* Glassmorphism Prize Card */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-2xl p-6 rounded-[1.5rem] border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="px-2.5 py-1 bg-secondary rounded-full">
                    <span className="text-[8px] font-black text-dark uppercase tracking-widest">Active Pool</span>
                  </div>
                  <Trophy className="w-4 h-4 text-secondary" />
                </div>
                <div className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em] mb-1">Current Monthly Rewards</div>
                <div className="text-4xl font-black text-white tracking-tighter">$12,450.00</div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-dark bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-white/50 tracking-wider">+420 Participated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="concept" className="py-20 sm:py-32 bg-slate-50 relative overflow-hidden px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto">
          <div className="max-w-2xl mb-16 sm:mb-24 text-center sm:text-left">
            <h2 className="reveal text-3xl sm:text-4xl md:text-6xl font-black text-dark tracking-tighter mb-4 sm:mb-6 leading-tight">A Professional <br /> <span className="text-secondary">Subscription Engine.</span></h2>
            <p className="reveal text-slate-500 text-base sm:text-lg font-medium leading-relaxed">Built with standard Stableford formatting and automated reward distribution logic.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Target, title: 'Score Entry', desc: 'Enter your last 5 Stableford scores (1-45 range). Automated rolling replacement logic.' },
              { icon: Zap, title: 'Subscription', desc: 'Secure Stripe-powered monthly or yearly plans with instant access control.' },
              { icon: Trophy, title: 'Draw Engine', desc: 'Monthly draws using random or weighted algorithms for fair reward distribution.' },
              { icon: ShieldCheck, title: 'Verification', desc: 'Transparent proof-upload system for winner verification and admin review.' }
            ].map((item, i) => (
              <div key={i} className="group p-8 sm:p-10 bg-white rounded-[2rem] border-2 border-slate-100/80 hover:border-secondary/20 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-secondary mb-8 group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-inner">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-4 text-dark group-hover:text-secondary transition-colors duration-500">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- PRIZE POOL LOGIC --- */}
      <section className="py-20 sm:py-32 bg-dark text-white relative px-4 sm:px-6 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent)] pointer-events-none" />
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="reveal">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 sm:mb-10 leading-tight">
                Automated <br /> <span className="text-secondary">Reward Logic.</span>
              </h2>
              <div className="space-y-4 sm:space-y-6 mb-10 sm:mb-12">
                {[
                  { match: '5-Number Match', share: '40%', rollover: 'Jackpot Rollover' },
                  { match: '4-Number Match', share: '35%', rollover: 'Standard Share' },
                  { match: '3-Number Match', share: '25%', rollover: 'Standard Share' }
                ].map((tier, i) => (
                  <div key={i} className="flex items-center justify-between p-5 sm:p-6 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-lg sm:rounded-xl flex items-center justify-center text-dark font-black text-xs sm:text-sm group-hover:rotate-12 transition-transform">
                        {3+i}
                      </div>
                      <span className="text-base sm:text-lg font-bold text-slate-200">{tier.match}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-black text-secondary tracking-tighter">{tier.share}</div>
                      <div className="text-[8px] sm:text-[10px] font-bold uppercase text-slate-500 tracking-widest">{tier.rollover}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="reveal flex items-center justify-center">
               <div className="relative w-full max-w-[280px] sm:max-w-md aspect-square">
                  <div className="absolute inset-0 bg-slate-200/10 rounded-full blur-[80px] sm:blur-[120px]" />
                  <div className="relative z-10 w-full h-full border border-white/10 rounded-full flex flex-col items-center justify-center text-center p-8 sm:p-12">
                     <TrendingUp className="w-12 h-12 sm:w-20 sm:h-20 text-secondary mb-4 sm:mb-8" />
                     <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 sm:mb-4">Subscriber Growth</div>
                     <div className="text-5xl sm:text-7xl font-black text-white tracking-tighter mb-4 sm:mb-6">+245%</div>
                     <div className="text-[10px] sm:text-xs font-medium text-slate-400 max-w-[240px] leading-relaxed">Pool tiers auto-calculated based on active subscriber count</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CHARITY FOCUS --- */}
      <section id="charity" className="py-20 sm:py-32 bg-white px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
            <div className="reveal flex-1 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl">
                <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Charity 1" />
              </div>
              <div className="rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl mt-8 sm:mt-12">
                <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Charity 2" />
              </div>
            </div>
            
            <div className="reveal flex-1 text-center lg:text-left">
              <span className="text-secondary font-black uppercase tracking-widest text-[9px] sm:text-[10px] mb-4 sm:mb-6 block">Impact Focused</span>
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-dark tracking-tighter leading-[0.95] mb-8 sm:mb-10">
                Supporting 50+ <br /> Verified <span className="gradient-text">Charities.</span>
              </h2>
              <p className="text-base sm:text-xl text-slate-500 mb-10 sm:mb-12 leading-relaxed font-medium">
                We lead with charitable impact. A <span className="text-dark font-bold">minimum 10%</span> of every subscription is donated.
              </p>
              
              <div className="grid grid-cols-2 gap-8 sm:gap-12 pb-10 sm:pb-12 border-b border-slate-100 mb-10 sm:mb-12">
                <div>
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-secondary mb-4 mx-auto lg:mx-0" />
                  <div className="text-3xl sm:text-4xl font-black text-dark tracking-tighter">12.5k</div>
                  <div className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Members</div>
                </div>
                <div>
                  <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-secondary mb-4 mx-auto lg:mx-0" />
                  <div className="text-3xl sm:text-4xl font-black text-dark tracking-tighter">$2.4M</div>
                  <div className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest">Donated Total</div>
                </div>
              </div>
              
              <Link to="/charities" className="inline-flex items-center gap-3 sm:gap-4 text-dark font-black text-lg sm:text-xl hover:text-secondary transition-all group">
                Browse charity directory
                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[2.5rem] sm:rounded-[4rem] p-12 sm:p-24 lg:p-32 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.1),transparent)] pointer-events-none" />
          <h2 className="reveal text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tighter mb-10 sm:mb-12 relative z-10">
            Professional Performance. <br /> <span className="text-secondary">Emotional Impact.</span>
          </h2>
          <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative z-10">
            {isAuthenticated ? (
              <Link to="/dashboard" className="w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 bg-secondary text-dark text-base sm:text-lg font-black rounded-xl sm:rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-dark/20">
                Go to My Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 bg-secondary text-dark text-base sm:text-lg font-black rounded-xl sm:rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-dark/20">
                  Start Your Subscription
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 bg-white/10 text-white text-base sm:text-lg font-black rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                  Member Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Homepage
