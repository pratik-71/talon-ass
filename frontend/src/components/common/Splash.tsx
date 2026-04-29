import React, { useEffect, useRef } from 'react';
import { Trophy } from 'lucide-react';
import gsap from 'gsap';

interface SplashProps {
  onComplete?: () => void;
  message?: string;
}

const Splash: React.FC<SplashProps> = ({ onComplete, message = "Initializing Talon Ecosystem" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Initial State
    gsap.set(logoRef.current, { scale: 0.8, opacity: 0, y: 20 });
    gsap.set(textRef.current, { opacity: 0, y: 10 });
    gsap.set(progressRef.current, { scaleX: 0 });

    tl.to(logoRef.current, {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "expo.out"
    })
    .to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.6")
    .to(progressRef.current, {
      scaleX: 1,
      duration: 1.5,
      ease: "power2.inOut"
    }, "-=0.4")
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      delay: 0.2
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Cinematic Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo */}
        <div 
          ref={logoRef}
          className="w-24 h-24 bg-dark rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-8"
        >
          <Trophy className="w-12 h-12 text-secondary" strokeWidth={2.5} />
        </div>

        {/* Brand Name */}
        <div ref={textRef} className="text-center">
          <h1 className="text-4xl font-black text-dark tracking-tighter mb-2">
            TALON<span className="text-secondary">.</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            {message}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-48 h-[2px] bg-slate-100 rounded-full mt-10 overflow-hidden">
          <div 
            ref={progressRef}
            className="h-full bg-secondary origin-left shadow-[0_0_15px_rgba(28,217,98,0.3)]"
          />
        </div>
      </div>
      
      {/* Subtle Bottom Badge */}
      <div className="absolute bottom-12 text-slate-300 text-[9px] font-black uppercase tracking-widest">
        Professional Performance • Global Impact
      </div>
    </div>
  );
};

export default Splash;
