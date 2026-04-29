import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import axios from 'axios';
import gsap from 'gsap';
import { Check, Crown, ShieldCheck, Zap, ArrowRight, Star, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';

const PADDLE_PRICES = {
  monthly: import.meta.env.VITE_PADDLE_PRICE_MONTHLY,
  yearly: import.meta.env.VITE_PADDLE_PRICE_YEARLY
};

const Subscription: React.FC = () => {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [prices, setPrices] = useState({ monthly: '$9.99', yearly: '$39.99' });
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean, title: string, message: string } | null>(null);
  
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Check user status
  const isSubscribed = user?.subscription_status === 'active';
  const currentPlan = user?.plan_type || 'none';

  useEffect(() => {
    initializePaddle({ 
      environment: import.meta.env.VITE_PADDLE_ENV as any || 'sandbox', 
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
      eventCallback: (event: any) => {
        if (event.name === 'checkout.completed') handleCheckoutSuccess(event.data);
      }
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
        paddleInstance.PricePreview({
          items: [
            { priceId: PADDLE_PRICES.monthly, quantity: 1 },
            { priceId: PADDLE_PRICES.yearly, quantity: 1 }
          ]
        }).then((result) => {
          const lineItems = result.data.details.lineItems;
          const newPrices = { ...prices };
          lineItems.forEach((item: any) => {
            if (item.price.id === PADDLE_PRICES.monthly) newPrices.monthly = item.formattedTotals.total;
            if (item.price.id === PADDLE_PRICES.yearly) newPrices.yearly = item.formattedTotals.total;
          });
          setPrices(newPrices);
        });
      }
    });

    gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 });
  }, []);

  const handleCheckoutSuccess = async (data: any) => {
    console.log('🏆 [PAYMENT SUCCESS] Data:', data);
    
    // 1. Triple-Close Strategy for maximum reliability
    const forceClose = () => {
      console.log('[Paddle] Attempting Overlay Close...');
      if (paddle) paddle.Checkout.close();
      if ((window as any).Paddle) (window as any).Paddle.Checkout.close();
    };

    forceClose(); // Immediate
    setTimeout(forceClose, 1000); // After 1s
    setTimeout(forceClose, 2500); // After 2.5s
    
    setIsFinalizing(true);

    try {
      const currentToken = useAuthStore.getState().token;
      const headers = { Authorization: `Bearer ${currentToken}` };
      
      // 2. Call the NEW Instant Unlock route (GET)
      await axios.get(`${CONFIG.BACKEND_URL}/api/subscription/force-update-subscription`, { headers });

      // 3. Sync Local State
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setAuth({ 
          ...currentUser, 
          subscription_status: 'active' 
        }, currentToken || '');
      }

      console.log('✅ [Instant Unlock] Success. Redirecting...');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error('❌ [Instant Unlock] Failed:', error);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  const handleSubscribe = (planId: 'monthly' | 'yearly') => {
    if (!user) { navigate('/login'); return; }
    if (!paddle) return;
    
    setProcessingPlan(planId);
    
    paddle.Checkout.open({
      items: [{ priceId: PADDLE_PRICES[planId], quantity: 1 }],
      customData: { user_id: user.id },
      settings: { displayMode: 'overlay', theme: 'light' }
    });

    setTimeout(() => setProcessingPlan(null), 2500);
  };

  return (
    <>
      <div ref={containerRef} className="min-h-screen bg-[#F8FAFC] text-slate-900">
        
        {/* Loading Screen */}
        {isFinalizing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
            <div className="text-center px-6">
              <div className="w-24 h-24 mx-auto mb-8 relative flex items-center justify-center">
                <div className="absolute inset-0 border-[3px] border-secondary/10 border-t-secondary rounded-full animate-spin" />
                <Crown className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-4xl font-black mb-2 text-dark uppercase">You are now a Hero!</h2>
              <p className="text-slate-500 font-bold mb-8">Setting up your private dashboard...</p>
              <div className="w-64 h-1 bg-slate-100 mx-auto rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-full origin-left animate-[progress_4s_linear]" />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-24">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-block px-4 py-1 bg-secondary/10 rounded-full mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Join The Elite</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 text-dark uppercase leading-tight">
              Unlock <span className="text-secondary">Premium</span>
            </h1>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-500 font-bold px-4">
              Get more features, support local charities, and show off your Hero status to the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Monthly Card */}
            <div className={`p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border transition-all ${
              currentPlan === 'monthly' ? 'border-secondary bg-secondary/5' : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between mb-8">
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-secondary flex items-center justify-center">
                  <Zap />
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-dark">{prices.monthly}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Monthly</div>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-6 uppercase tracking-tight">Basic Hero</h3>
              <div className="space-y-3 mb-10">
                {["Full App Access", "Leaderboard Entry", "Basic Support"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-600 font-bold text-xs sm:text-sm">
                    <Check className="w-4 h-4 text-secondary" strokeWidth={3} /> {f}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => handleSubscribe('monthly')}
                disabled={(isSubscribed && currentPlan === 'monthly') || processingPlan === 'monthly'}
                className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 transition-all ${
                  (isSubscribed && currentPlan === 'monthly')
                    ? 'bg-slate-100 text-slate-400 cursor-default' 
                    : 'bg-dark text-white hover:bg-slate-800 cursor-pointer shadow-lg shadow-dark/10'
                }`}
              >
                {(isSubscribed && currentPlan === 'monthly') ? "Current Plan" : "Get Monthly"}
              </button>
            </div>

            {/* Yearly Card */}
            <div className={`p-8 sm:p-10 pt-16 rounded-[2rem] sm:rounded-[2.5rem] relative transition-all ${
              currentPlan === 'yearly' ? 'bg-secondary/10 border-2 border-secondary' : 'bg-dark text-white'
            }`}>
              <div className="absolute top-6 left-8 sm:left-10 bg-secondary text-dark text-[9px] sm:text-[10px] font-black px-3 sm:px-4 py-2 rounded-lg uppercase tracking-widest shadow-lg z-20">
                67% OFF • Yearly
              </div>
              <div className="flex justify-between mb-8">
                <div className="w-12 h-12 rounded-xl bg-white/10 text-secondary flex items-center justify-center">
                  <Crown />
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-white">{prices.yearly}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Yearly</div>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-6 uppercase tracking-tight">Super Hero</h3>
              <div className="space-y-3 mb-10">
                {["Elite Profile Badge", "Priority Support", "2 Months Free", "Advanced Tools"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-400 font-bold text-xs sm:text-sm">
                    <Check className="w-4 h-4 text-secondary" strokeWidth={3} /> {f}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSubscribe('yearly')}
                disabled={(isSubscribed && currentPlan === 'yearly') || processingPlan === 'yearly'}
                className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                  (isSubscribed && currentPlan === 'yearly')
                    ? 'bg-white/10 text-slate-500 cursor-default shadow-none'
                    : 'bg-secondary text-dark hover:brightness-110 shadow-secondary/20'
                }`}
              >
                {(isSubscribed && currentPlan === 'yearly') 
                  ? "Current Plan" 
                  : (isSubscribed ? "Upgrade to Yearly" : "Get Yearly")}
              </button>
            </div>
          </div>
          
          {/* Manage Subscription Section for Active Members */}
          {isSubscribed && (
            <div className="mt-16 sm:mt-24 max-w-4xl mx-auto">
               <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 border-2 border-secondary/20 shadow-2xl shadow-secondary/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
                  <div className="flex items-center gap-6 relative z-10">
                     <div className="w-16 h-16 bg-secondary text-dark rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20">
                        <ShieldCheck size={32} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-dark uppercase tracking-tight">Active Membership</h2>
                        <p className="text-slate-500 font-bold text-sm">You are currently on the <span className="text-secondary uppercase">{currentPlan}</span> plan.</p>
                     </div>
                  </div>
                  <button 
                    onClick={async () => {
                      const currentToken = useAuthStore.getState().token;
                      const headers = { Authorization: `Bearer ${currentToken}` };
                      try {
                        const res = await axios.get(`${CONFIG.BACKEND_URL}/api/subscriptions/manage`, { headers });
                        if (res.data.url) {
                          window.open(res.data.url, '_blank');
                        }
                      } catch (err: any) {
                        console.error('Portal failed:', err);
                        if (err.response?.status === 404) {
                          setInfoModal({
                            isOpen: true,
                            title: "Hero Status: Active",
                            message: "Your Hero membership is active! However, no Paddle billing record was found for this account. This typically happens in Test/Development mode or with manual activations."
                          });
                        } else {
                          setInfoModal({
                            isOpen: true,
                            title: "Portal Error",
                            message: "Failed to open billing portal. Please try again later."
                          });
                        }
                      }
                    }}
                    className="w-full md:w-auto px-10 py-5 bg-dark text-white hover:bg-slate-800 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-dark/10 cursor-pointer relative z-10"
                  >
                    Manage Billing & Cancel
                  </button>
               </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes progress { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
        `}</style>

      </div>
      
      {/* Info Modal - Outside main container */}
      {infoModal?.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-10 text-center">
                 <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <ShieldCheck className="w-10 h-10 text-secondary" />
                 </div>
                 <h3 className="text-2xl font-black text-dark uppercase tracking-tighter mb-2">{infoModal.title}</h3>
                 <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">{infoModal.message}</p>
                 
                 <button 
                    onClick={() => setInfoModal(null)}
                    className="w-full py-5 bg-dark text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all cursor-pointer shadow-lg shadow-dark/20"
                 >
                    Understood
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Subscription;
