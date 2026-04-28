import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { CONFIG } from '../config';
import axios from 'axios';

import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [serverMsg, setServerMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerMsg(null);
    
    try {
      const response = await axios.post(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.LOGIN}`, data);

      if (response.data.success) {
        setServerMsg({ type: 'success', text: response.data.message });
        
        // Show big loader for redirect
        setIsRedirecting(true);

        // Update global auth state
        const { session } = response.data;
        setAuth(session.user, session.access_token);
        
        // Redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again later.';
      setServerMsg({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isRedirecting && <PageLoader message="Accessing Your Dashboard" />}
      <div className="min-h-screen flex items-stretch bg-white">
      {/* Left side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&q=80&w=1200" 
          alt="Golf Course"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/60 to-transparent" />
        <div className="absolute bottom-20 left-20 z-10 max-w-md">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-8 shadow-xl shadow-secondary/20">
            <Trophy className="w-6 h-6 text-dark" strokeWidth={3} />
          </div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Welcome <br /> <span className="text-secondary">Back</span> Hero.
          </h2>
          <p className="text-slate-200 text-lg font-medium leading-relaxed">
            Continue tracking your performance and making a difference in the world.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-20 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-dark tracking-tighter mb-4">Member Login</h1>
            <p className="text-slate-500 font-medium">Access your Talon account.</p>
          </div>

          {/* Server Message Area */}
          {serverMsg && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              serverMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {serverMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <p className="text-sm font-bold">{serverMsg.text}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-secondary'}`} />
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="john@example.com"
                  className={`w-full bg-white border-2 rounded-xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-dark shadow-sm ${
                    errors.email ? 'border-red-100 focus:border-red-200' : 'border-slate-100 focus:border-secondary/30'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-tight">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-secondary hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-secondary'}`} />
                <input 
                  {...register('password')}
                  type="password" 
                  placeholder="••••••••"
                  className={`w-full bg-white border-2 rounded-xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-dark shadow-sm ${
                    errors.password ? 'border-red-100 focus:border-red-200' : 'border-slate-100 focus:border-secondary/30'
                  }`}
                />
              </div>
              {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-tight">{errors.password.message}</p>}
            </div>

            <button 
              disabled={isLoading}
              className={`w-full bg-dark text-white py-5 rounded-xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-dark/10 flex items-center justify-center gap-3 group mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Accessing...' : 'Access Dashboard'}
              {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>

            <p className="text-center text-slate-500 font-bold text-sm">
              New to Talon? <Link to="/signup" className="text-secondary hover:underline ml-1">Create Account</Link>
            </p>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;
