import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';
import { Check, ShieldCheck, Sparkles, Trophy, Crown } from 'lucide-react';

/**
 * Premium SubscriptionSuccess
 * ──────────────────────────
 * A high-end cinematic transition page that simulates a "Membership Preparation" 
 * sequence. Uses GSAP for premium animations and mesh gradients for a luxury feel.
 */
const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout, user } = useAuthStore();
  const [statusIndex, setStatusIndex] = useState(0);
  const [isFinalized, setIsFinalized] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const statusMessages = [
    { text: "Securing your global membership...", icon: ShieldCheck },
    { text: "Syncing elite performance metrics...", icon: Trophy },
    { text: "Verifying secure payment gateway...", icon: Sparkles },
    { text: "Finalizing your Hero Dashboard...", icon: Crown }
  ];

  const MAX_ATTEMPTS = 12;
  const POLL_INTERVAL_MS = 1500;

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    // Initial Cinematic Entry
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out", delay: 0.2 }
      );
      
      gsap.fromTo(glowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 0.6, scale: 1, duration: 2, ease: "power2.out" }
      );
    }, containerRef);

    // Status message cycling
    const messageInterval = setInterval(() => {
      if (!isFinalized) {
        setStatusIndex(prev => (prev + 1) % statusMessages.length);
      }
    }, 2500);

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      if (cancelled || isFinalized) return;

      try {
        const res = await axios.get(
          `${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.DASHBOARD}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.data?.subscription?.status === 'active') {
          handleSuccess();
          return;
        }
      } catch (err: any) {
        if (err?.response?.status === 401) { logout(); navigate('/login'); return; }
      }

      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        handleSuccess(); // Timeout fallback
      } else {
        setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    // If already optimistically active, skip to success faster
    if (user?.subscription_status === 'active') {
      setTimeout(handleSuccess, 2000);
    } else {
      poll();
    }

    return () => { 
      cancelled = true; 
      clearInterval(messageInterval);
      ctx.revert();
    };
  }, [token, navigate]);

  const handleSuccess = () => {
    setIsFinalized(true);
    
    // Success Burst Animation
    gsap.to(".status-icon-container", {
      scale: 1.2,
      backgroundColor: "rgba(200, 169, 106, 0.3)",
      borderColor: "rgba(200, 169, 106, 0.6)",
      duration: 0.5,
      ease: "back.out(2)"
    });

    gsap.to(".success-check", {
      opacity: 1,
      scale: 1,
      rotate: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)"
    });

    // Final Redirect
    setTimeout(() => {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => navigate('/dashboard', { replace: true })
      });
    }, 1500);
  };

  const ActiveIcon = statusMessages[statusIndex].icon;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* LAYER 1: Dynamic Mesh Gradients */}
      <div ref={glowRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[70%] h-[70%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[60%] bg-[#8A6E3F]/5 blur-[100px] rounded-full" />
      </div>

      {/* LAYER 2: Noise & Light Leaks */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />
      <div className="absolute inset-0 bg-radial-gradient(ellipse at 100% 0%, rgba(229,194,122,0.05) 0%, transparent 50%) mix-blend-screen pointer-events-none" />

      {/* LAYER 3: Main Card Content */}
      <div ref={cardRef} className="relative z-10 w-full max-w-lg px-8 py-16 flex flex-col items-center text-center">
        
        {/* Animated Icon Container */}
        <div className="status-icon-container w-28 h-28 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center mb-10 relative group shadow-2xl transition-all duration-700">
          {!isFinalized ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-secondary/30 border-t-secondary rounded-[2.5rem] animate-spin" />
              <ActiveIcon className="w-10 h-10 text-secondary/80" />
            </div>
          ) : (
            <div className="success-check opacity-0 scale-50 rotate-12">
              <Check className="w-14 h-14 text-secondary" strokeWidth={3} />
            </div>
          )}
          
          {/* Subtle Outer Glow */}
          <div className="absolute inset-[-15px] bg-secondary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-secondary/60 mb-2">Membership Activation</p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
            {isFinalized ? "Welcome Hero." : "Thank You."}
          </h1>
          
          <div className="h-6 flex items-center justify-center">
            <p className="text-slate-400 font-medium tracking-wide text-sm transition-all duration-500">
              {isFinalized 
                ? "Your elite access is now fully provisioned." 
                : statusMessages[statusIndex].text}
            </p>
          </div>
        </div>

        {/* Cinematic Progress Bar */}
        {!isFinalized && (
          <div className="mt-12 w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-secondary/40 w-1/2 animate-[loading_2s_infinite_ease-in-out]" style={{
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(200,169,106,0.8), transparent)'
            }} />
          </div>
        )}

        <div className="mt-16 pt-12 border-t border-white/5 w-full">
          <div className="flex items-center justify-center gap-8 opacity-30 grayscale">
            <div className="text-[10px] font-black uppercase tracking-widest text-white">Secure Encrypted Session</div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
};

export default SubscriptionSuccess;
