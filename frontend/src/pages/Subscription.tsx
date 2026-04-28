import React, { useState, useEffect } from 'react';
import { Check, Zap, Shield, Crown, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

// Map local plan IDs to Paddle Price IDs provided by the user
const PADDLE_PRICES = {
  monthly: import.meta.env.VITE_PADDLE_PRICE_MONTHLY,
  yearly: import.meta.env.VITE_PADDLE_PRICE_YEARLY
};

import { useAuthStore } from '../store/useAuthStore';

const Subscription: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [prices, setPrices] = useState({ monthly: '$...', yearly: '$...' });
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    initializePaddle({ 
      environment: import.meta.env.VITE_PADDLE_ENV || 'sandbox', 
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN 
    }).then(
      (paddleInstance: Paddle | undefined) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);
          
          // Fetch real prices dynamically
          paddleInstance.PricePreview({
            items: [
              { priceId: PADDLE_PRICES.monthly, quantity: 1 },
              { priceId: PADDLE_PRICES.yearly, quantity: 1 }
            ]
          }).then((result) => {
            const lineItems = result.data.details.lineItems;
            const fetchedPrices = { monthly: '$29', yearly: '$290' };
            
            lineItems.forEach((item: any) => {
              if (item.price.id === PADDLE_PRICES.monthly) {
                fetchedPrices.monthly = item.formattedTotals.total;
              } else if (item.price.id === PADDLE_PRICES.yearly) {
                fetchedPrices.yearly = item.formattedTotals.total;
              }
            });
            
            setPrices(fetchedPrices);
          }).catch((err) => {
            console.error('Failed to fetch dynamic prices:', err);
            // Fallback to defaults
            setPrices({ monthly: '$29', yearly: '$290' });
          });
        }
      },
    );
  }, []);

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: prices.monthly,
      period: 'per month',
      description: 'Flexible access to all premium features.',
      features: [
        'Full Core Feature Access',
        'Automated Score Tracking',
        'Monthly Draw Entries',
        'Verified Proof Uploads',
        'Basic Charity Impact (10%)'
      ],
      icon: Zap,
      recommended: false
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      price: prices.yearly,
      period: 'per year',
      description: 'The ultimate commitment. Get 2 months free.',
      features: [
        'Full Core Feature Access',
        'Automated Score Tracking',
        'Monthly Draw Entries',
        'Verified Proof Uploads',
        'Advanced Analytics Dashboard',
        'Elite Hero Badge'
      ],
      icon: Crown,
      recommended: true
    }
  ];

  const handleSubscribe = async (planId: 'monthly' | 'yearly') => {
    if (!user) {
      alert("Please log in first to subscribe.");
      navigate('/login');
      return;
    }

    if (!paddle) {
      alert("Payment system is still loading. Please try again in a few seconds.");
      return;
    }

    setIsProcessing(true);
    
    try {
      paddle.Checkout.open({
        items: [{ priceId: PADDLE_PRICES[planId], quantity: 1 }],
        customData: {
          user_id: user.id
        },
        settings: {
          successUrl: window.location.origin + '/dashboard', // Replace with a success page or dashboard later
        }
      });
      // The loader will stop once the Paddle iframe opens, but we'll stop it just before
      setIsProcessing(false);
    } catch (error) {
      console.error('Paddle Checkout Error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isProcessing && <PageLoader message="Initializing Secure Checkout" />}
      <div className="min-h-screen bg-white pt-24 pb-20 px-6 lg:px-16 overflow-hidden relative">
        {/* Cinematic Background */}
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[80%] bg-secondary/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-dark/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full mb-6">
              <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Premium Access Required</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-dark tracking-tighter mb-6 leading-tight">
              Unlock Your <span className="text-secondary">Performance</span>.<br />
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto mb-10">
              {user?.subscription_status === 'active' 
                ? "Manage your active plan below. Thank you for your continued support and for making a difference."
                : "Core features are reserved for active members. Choose your billing cycle below. Every subscription directly supports verified global charities."}
            </p>
          </div>

          {user?.subscription_status === 'active' ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-dark rounded-[3rem] p-10 md:p-14 text-white text-center shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-8 border border-secondary/30 shadow-xl shadow-secondary/10">
                    <Crown className="w-10 h-10 text-secondary" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">Active Subscription</h2>
                  <p className="text-slate-400 text-lg mb-10 max-w-md font-medium leading-relaxed">
                    You are currently on the <span className="text-secondary font-black uppercase tracking-widest">{user.plan_type || 'Unknown'}</span> plan. 
                  </p>
                  
                  <button 
                    onClick={() => alert("Manage subscription functionality will be implemented via Paddle Customer Portal integration.")}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all flex items-center gap-2 group border border-white/5"
                  >
                    Manage Subscription
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {user.plan_type === 'monthly' && (
                <div className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-100 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full pointer-events-none" />
                  <div className="flex-1 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full mb-4">
                      <Zap className="w-3.5 h-3.5 text-secondary fill-secondary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Upgrade Available</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-dark mb-3 tracking-tighter">Upgrade to Yearly</h3>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-lg">
                      Save 16% annually and unlock the Elite Hero Badge. Get 2 months free by switching to the yearly commitment today.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleSubscribe('yearly')}
                    className="w-full md:w-auto px-10 py-5 bg-secondary text-dark rounded-2xl font-black shadow-lg shadow-secondary/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 group whitespace-nowrap relative z-10"
                  >
                    Upgrade Now
                    <Crown className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative group p-10 rounded-[3rem] border-2 transition-all duration-500 ${
                    plan.recommended 
                      ? 'bg-dark border-dark shadow-2xl shadow-dark/20' 
                      : 'bg-white border-slate-100 hover:border-secondary/20 shadow-xl shadow-slate-200/50'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-dark text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl whitespace-nowrap z-20">
                      Save 16% Annually
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      plan.recommended ? 'bg-white/10 text-secondary' : 'bg-slate-50 text-secondary group-hover:bg-secondary group-hover:text-white'
                    }`}>
                      <plan.icon className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-black tracking-tighter ${plan.recommended ? 'text-white' : 'text-dark'}`}>
                        {plan.price}
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${plan.recommended ? 'text-slate-400' : 'text-slate-400'}`}>
                        {plan.period}
                      </div>
                    </div>
                  </div>

                  <h3 className={`text-2xl font-black mb-4 relative z-10 ${plan.recommended ? 'text-white' : 'text-dark'}`}>{plan.name}</h3>
                  <p className={`text-sm font-medium mb-10 leading-relaxed relative z-10 ${plan.recommended ? 'text-slate-400' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>

                  <div className="space-y-4 mb-10 relative z-10">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.recommended ? 'bg-secondary/20 text-secondary' : 'bg-green-50 text-secondary'
                        }`}>
                          <Check className="w-3 h-3" strokeWidth={4} />
                        </div>
                        <span className={`text-sm font-bold ${plan.recommended ? 'text-slate-300' : 'text-slate-600'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleSubscribe(plan.id as 'monthly' | 'yearly')}
                    className={`w-full py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 group shadow-xl relative z-10 ${
                      plan.recommended 
                        ? 'bg-secondary text-dark hover:brightness-110 shadow-secondary/10' 
                        : 'bg-dark text-white hover:bg-slate-800 shadow-dark/10'
                    }`}
                  >
                    {plan.id === 'monthly' ? 'Pay Monthly' : 'Pay Yearly'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-20 flex flex-col items-center">
            <div className="flex items-center gap-8 opacity-40 mb-8 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
              <Shield className="w-6 h-6 text-dark" />
              <div className="h-6 w-px bg-slate-200" />
              <div className="font-black text-xs uppercase tracking-widest text-dark">Secure Paddle Payment Gateway</div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center max-w-sm leading-relaxed">
              Subscriptions auto-renew. Cancel anytime from your account settings with one click.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subscription;
