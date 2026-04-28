import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';
import { CheckCircle, Loader2 } from 'lucide-react';

/**
 * SubscriptionSuccess
 * ──────────────────
 * Shown immediately after Paddle checkout completes.
 * Polls the /api/dashboard endpoint up to 10 times (every 2 s) waiting
 * for the Paddle webhook to activate the subscription, then redirects
 * to the dashboard automatically.
 */
const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState('Confirming your subscription…');

  const MAX_ATTEMPTS = 10;
  const POLL_INTERVAL_MS = 2000;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;

      try {
        const res = await axios.get(
          `${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.DASHBOARD}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const status = res.data?.data?.subscription?.status;

        if (status === 'active') {
          setMessage('Subscription confirmed! Taking you to your dashboard…');
          setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
          return;
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          logout();
          navigate('/login');
          return;
        }
      }

      setAttempt((prev) => {
        const next = prev + 1;
        if (next >= MAX_ATTEMPTS) {
          // Webhook took too long — send them to dashboard anyway and let it handle it
          navigate('/dashboard', { replace: true });
        } else {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
        return next;
      });
    };

    poll();

    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6 text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-secondary/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6 max-w-sm">
        <div className="w-20 h-20 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center">
          {attempt < MAX_ATTEMPTS ? (
            <Loader2 className="w-9 h-9 text-secondary animate-spin" />
          ) : (
            <CheckCircle className="w-9 h-9 text-secondary" />
          )}
        </div>

        <h1 className="text-3xl font-black tracking-tighter">
          Thank you! 🎉
        </h1>

        <p className="text-slate-400 font-medium leading-relaxed">{message}</p>

        {attempt > 0 && attempt < MAX_ATTEMPTS && (
          <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
            Checking… ({attempt}/{MAX_ATTEMPTS})
          </p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
