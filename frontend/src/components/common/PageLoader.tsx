import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Trophy } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading Excellence' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pulse animation for the logo
      gsap.to(logoRef.current, {
        scale: 1.1,
        opacity: 0.8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Subtle bar animation
      gsap.to(barRef.current, {
        width: '100%',
        duration: 3,
        ease: 'power1.inOut',
        repeat: -1
      });

      // Staggered text reveal
      gsap.from(textRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.8,
        ease: 'power3.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div 
          ref={logoRef}
          className="w-20 h-20 bg-dark rounded-[2rem] flex items-center justify-center shadow-2xl shadow-dark/10 mb-8"
        >
          <Trophy className="w-10 h-10 text-secondary" strokeWidth={2.5} />
        </div>

        {/* Brand Name */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-dark font-black text-2xl tracking-tighter uppercase">Talon</span>
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
        </div>

        {/* Loading Message */}
        <div 
          ref={textRef}
          className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mb-8 ml-[0.4em]"
        >
          {message}
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-48 h-[2px] bg-slate-100 rounded-full overflow-hidden relative">
          <div 
            ref={barRef}
            className="absolute left-0 top-0 h-full w-0 bg-gradient-to-r from-transparent via-secondary to-transparent"
          />
        </div>
      </div>

      {/* Background Subliminal Text */}
      <div className="absolute bottom-10 left-10 text-[100px] font-black text-slate-100 select-none pointer-events-none tracking-tighter">
        PERFORMANCE
      </div>
      <div className="absolute top-10 right-10 text-[100px] font-black text-slate-100 select-none pointer-events-none tracking-tighter">
        IMPACT
      </div>
    </div>
  );
};

export default PageLoader;
