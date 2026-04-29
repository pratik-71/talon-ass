import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Mail, Lock, User, ArrowRight, Heart, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { CONFIG } from '../config';
import axios from 'axios';

import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  charityId: z.string().min(1, 'Please select a charity to support'),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface Charity {
  id: string;
  name: string;
  description: string;
}

const Signup: React.FC = () => {
  const [donation, setDonation] = useState<number>(25);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [serverMsg, setServerMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      charityId: '',
    }
  });

  // Fetch charities on mount
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await axios.get(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.CHARITIES || '/api/charities'}`);
        if (response.data.success) {
          setCharities(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch charities:', err);
      }
    };
    fetchCharities();
  }, []);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setServerMsg(null);
    
    try {
      const response = await axios.post(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.REGISTER}`, {
        ...data,
        donation
      });

      if (response.data.success) {
        setServerMsg({ type: 'success', text: 'Account created successfully! Preparing your performance dashboard...' });
        
        // Show big loader for redirect
        setIsRedirecting(true);
        
        // Redirect to login page after a brief delay
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Registration failed. Please try again later.';
      setServerMsg({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isRedirecting && <PageLoader message="Finalizing Your Profile" />}
      <div className="min-h-screen flex items-stretch bg-white">
      {/* Left side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200" 
          alt="Premium Golf"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/60 to-transparent" />
        <div className="absolute bottom-16 left-16 z-10 max-w-sm">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mb-6 shadow-xl shadow-secondary/20">
            <Trophy className="w-5 h-5 text-dark" strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Join the Next <br /> <span className="text-secondary">Generation</span> of Golf.
          </h2>
          <p className="text-slate-200 text-base font-medium leading-relaxed">
            Merge your passion for the game with global social impact.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="mb-6 sm:mb-8 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tighter mb-2">Create Account</h1>
            <p className="text-slate-500 font-bold text-sm">Join the next generation of heroes.</p>
          </div>

          {/* Server Message Area */}
          {serverMsg && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              serverMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {serverMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <p className="text-xs font-bold">{serverMsg.text}</p>
            </div>
          )}

          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Split row for Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative group">
                  <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${errors.fullName ? 'text-red-400' : 'text-slate-400 group-focus-within:text-secondary'}`} />
                  <input 
                    {...register('fullName')}
                    type="text" 
                    placeholder="John Doe" 
                    className={`w-full bg-white border-2 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all font-bold text-dark text-sm shadow-sm ${
                      errors.fullName ? 'border-red-100 focus:border-red-200' : 'border-slate-100 focus:border-secondary/30'
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-tight">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-secondary'}`} />
                  <input 
                    {...register('email')}
                    type="email" 
                    placeholder="john@example.com" 
                    className={`w-full bg-white border-2 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all font-bold text-dark text-sm shadow-sm ${
                      errors.email ? 'border-red-100 focus:border-red-200' : 'border-slate-100 focus:border-secondary/30'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-tight">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-secondary'}`} />
                <input 
                  {...register('password')}
                  type="password" 
                  placeholder="••••••••" 
                  className={`w-full bg-white border-2 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all font-bold text-dark text-sm shadow-sm ${
                    errors.password ? 'border-red-100 focus:border-red-200' : 'border-slate-100 focus:border-secondary/30'
                  }`}
                />
              </div>
              {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-tight">{errors.password.message}</p>}
            </div>

            {/* Charity Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Support Charity</label>
              <div className="relative group">
                <Heart className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${errors.charityId ? 'text-red-400' : 'text-slate-400 group-focus-within:text-secondary'}`} />
                <select 
                  {...register('charityId')}
                  className={`w-full bg-white border-2 rounded-xl py-3.5 pl-11 pr-10 outline-none transition-all font-bold text-dark text-sm shadow-sm appearance-none cursor-pointer ${
                    errors.charityId ? 'border-red-100 focus:border-red-200' : 'border-slate-100 focus:border-secondary/30'
                  }`}
                >
                  <option value="" disabled>Select a charity</option>
                  {charities.map(charity => (
                    <option key={charity.id} value={charity.id}>{charity.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                </div>
              </div>
              {errors.charityId && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-tight">{errors.charityId.message}</p>}
            </div>

            {/* Redesigned Percentage-based Charity Selection - Compact */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    Impact <Heart className="w-2.5 h-2.5 text-secondary fill-secondary" />
                  </label>
                  <div className="text-2xl font-black text-dark tracking-tighter">
                    {donation}<span className="text-secondary text-sm">%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Level</div>
                  <div className="bg-dark text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                    {donation >= 80 ? 'Visionary' : donation >= 50 ? 'Leader' : donation >= 25 ? 'Hero' : 'Supporter'}
                  </div>
                </div>
              </div>

              <div className="relative h-8 flex items-center">
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="1"
                  value={donation}
                  onChange={(e) => setDonation(parseInt(e.target.value))}
                  className="absolute w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-secondary z-20"
                  style={{
                    background: `linear-gradient(to right, #22C55E 0%, #22C55E ${(donation - 10) / 90 * 100}%, #E2E8F0 ${(donation - 10) / 90 * 100}%, #E2E8F0 100%)`
                  }}
                />
              </div>

              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mt-3 opacity-80">
                Min 10% contribution required.
              </p>
            </div>

            <button 
              disabled={isLoading}
              className={`w-full bg-dark text-white py-4 sm:py-5 rounded-xl font-black text-base sm:text-lg hover:bg-slate-800 transition-all shadow-xl shadow-dark/10 flex items-center justify-center gap-3 group mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
              {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>

            <p className="text-center text-slate-500 font-bold text-xs sm:text-sm pt-2">
              Already a member? <Link to="/login" className="text-secondary hover:underline ml-1">Log in</Link>
            </p>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default Signup;
