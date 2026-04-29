import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Zap, 
  Trophy, 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  ChevronRight,
  Globe,
  Sparkles
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HowItWorks: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.from('.reveal', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: '.reveal',
          start: 'top 85%',
        }
      });

      gsap.utils.toArray<HTMLElement>('.step-card').forEach((el, i) => {
        gsap.from(el as any, {
          opacity: 0,
          x: i % 2 === 0 ? -40 : 40,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el as any,
            start: 'top 80%',
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-white min-h-screen pt-32 pb-20 overflow-x-hidden">
      {/* --- HERO HEADER --- */}
      <section className="max-w-7xl mx-auto px-6 mb-24 text-center">
        <div className="reveal inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full mb-6">
          <Sparkles size={14} className="text-secondary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">The Ecosystem Explained</span>
        </div>
        <h1 className="reveal text-5xl sm:text-7xl md:text-8xl font-black text-dark tracking-tighter uppercase leading-[0.85] mb-8">
          The <span className="text-secondary">Hero</span> <br /> Blueprint.
        </h1>
        <p className="reveal text-lg sm:text-xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed">
          TALON isn't just a platform; it's a performance-driven revolution. We've engineered a cycle of growth where your personal milestones directly fuel global charitable impact.
        </p>
      </section>

      {/* --- CORE STEPS --- */}
      <section className="max-w-7xl mx-auto px-6 space-y-12 sm:space-y-32 mb-32">
        {/* Step 1: Track */}
        <div className="step-card grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
             <div className="w-16 h-16 bg-dark text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                <Target size={32} />
             </div>
             <h2 className="text-3xl sm:text-5xl font-black text-dark uppercase tracking-tight mb-6">01. Log Your <span className="text-secondary">Performance.</span></h2>
             <p className="text-slate-500 font-bold text-lg leading-relaxed mb-8">
                Start by tracking your daily growth. Our performance engine allows you to log scores, metrics, and achievements that matter to you. Whether it's fitness, business, or personal development, every step forward counts.
             </p>
             <ul className="space-y-4">
                {[
                  'Daily metric tracking',
                  'Performance visualization',
                  'Milestone verification'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-black text-xs uppercase tracking-widest text-dark">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                      <ChevronRight size={14} strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
             </ul>
          </div>
          <div className="order-1 lg:order-2 bg-slate-50 rounded-[3rem] p-8 sm:p-12 border border-slate-100 shadow-inner">
             <div className="bg-white rounded-[2rem] p-8 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                   <div className="font-black text-xs uppercase text-slate-400">Monthly Velocity</div>
                   <TrendingUp className="text-emerald-500" />
                </div>
                <div className="h-48 flex items-end gap-2">
                   {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                     <div key={i} className="flex-1 bg-secondary/20 rounded-t-lg" style={{ height: `${h}%` }} />
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Step 2: Join */}
        <div className="step-card grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-dark rounded-[3rem] p-8 sm:p-12 relative overflow-hidden text-white">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap size={120} />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="inline-block px-4 py-2 bg-secondary rounded-lg text-dark font-black text-[10px] uppercase tracking-widest">Premium Hero</div>
                <div className="text-4xl font-black tracking-tighter">JOIN THE ELITE CIRCLE</div>
                <p className="text-slate-400 font-bold text-sm">Become a subscriber to unlock the full potential of the ecosystem and enter the official prize draws.</p>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                      <ShieldCheck className="text-secondary" size={16} /> Monthly Prize Draw Entry
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                      <ShieldCheck className="text-secondary" size={16} /> Dedicated Charity Contribution
                   </div>
                </div>
             </div>
          </div>
          <div className="lg:pl-12">
             <div className="w-16 h-16 bg-secondary text-dark rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-secondary/20">
                <Zap size={32} />
             </div>
             <h2 className="text-3xl sm:text-5xl font-black text-dark uppercase tracking-tight mb-6">02. Secure Your <span className="text-secondary">Subscription.</span></h2>
             <p className="text-slate-500 font-bold text-lg leading-relaxed mb-8">
                Your subscription is the catalyst. It transforms your individual pursuit of excellence into collective power. A significant portion of your membership fee is automatically allocated to your chosen charity partner.
             </p>
             <Link to="/subscription" className="inline-flex items-center gap-3 px-8 py-4 bg-dark text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">
                View Plans <ArrowRight size={16} />
             </Link>
          </div>
        </div>

        {/* Step 3: Win */}
        <div className="step-card grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
             <div className="w-16 h-16 bg-slate-900 text-secondary rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                <Trophy size={32} />
             </div>
             <h2 className="text-3xl sm:text-5xl font-black text-dark uppercase tracking-tight mb-6">03. Monthly <span className="text-secondary">Draws.</span></h2>
             <p className="text-slate-500 font-bold text-lg leading-relaxed mb-8">
                Every month, our selection engine chooses a Hero. If you've logged your metrics and have an active subscription, you're in the running. When a Hero is selected, they win a prize pool, and their impact partner receives a massive boost.
             </p>
             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-6">
                <div className="text-center">
                   <div className="text-2xl font-black text-dark tracking-tighter">40%</div>
                   <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Jackpot</div>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-center">
                   <div className="text-2xl font-black text-dark tracking-tighter">10%</div>
                   <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Charity</div>
                </div>
             </div>
          </div>
          <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 sm:p-12 shadow-2xl relative">
             <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-dark font-black rotate-12 shadow-lg">
                WINNER
             </div>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black">JD</div>
                   <div>
                      <div className="font-black text-dark uppercase">Last Month's Hero</div>
                      <div className="text-xs font-bold text-slate-500">Verified Winner</div>
                   </div>
                </div>
                <div className="text-4xl font-black text-secondary tracking-tighter">£4,250.00</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awarded on Oct 24, 2024</p>
             </div>
          </div>
        </div>

        {/* Step 4: Impact */}
        <div className="step-card grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-slate-900 rounded-[3rem] aspect-[4/5] overflow-hidden relative group">
             <img 
               src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200" 
               className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
               alt="Impact" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent p-12 flex flex-col justify-end">
                <div className="text-5xl font-black text-white tracking-tighter mb-4">$2.4M</div>
                <div className="text-xs font-bold text-secondary uppercase tracking-widest">Total Community Giving</div>
             </div>
          </div>
          <div className="lg:pl-12">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-red-500/10">
                <Heart size={32} />
             </div>
             <h2 className="text-3xl sm:text-5xl font-black text-dark uppercase tracking-tight mb-6">04. Global <span className="text-red-500">Impact.</span></h2>
             <p className="text-slate-500 font-bold text-lg leading-relaxed mb-8">
                The ultimate goal. We've vetted 50+ global charities across medical research, youth sports, and environmental protection. Every hero chose their partner, ensuring that your growth is always tied to something bigger than yourself.
             </p>
             <Link to="/charities" className="inline-flex items-center gap-3 text-dark font-black text-sm uppercase tracking-widest hover:text-secondary transition-all group">
                Browse our partners <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="max-w-4xl mx-auto px-6 text-center">
         <div className="bg-slate-50 rounded-[3rem] p-12 sm:p-24 border border-slate-100">
            <h2 className="text-4xl sm:text-6xl font-black text-dark tracking-tighter uppercase mb-8">Ready to <br /> Begin?</h2>
            <p className="text-slate-500 font-bold mb-12">Join 12,000+ heroes and start your performance journey today.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link to="/signup" className="w-full sm:w-auto px-10 py-5 bg-dark text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-dark/20">
                  Join Free
               </Link>
               <Link to="/subscription" className="w-full sm:w-auto px-10 py-5 bg-secondary text-dark rounded-xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-xl shadow-secondary/20">
                  Get Premium
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
};

export default HowItWorks;
