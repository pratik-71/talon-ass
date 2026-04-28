import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Crown, Activity, Heart, Trophy, Upload, LogOut, Plus, Pencil,
  Trash2, X, Check, Loader2, Calendar, TrendingUp, Star, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Score { id: string; score: number; date: string; }
interface Charity { name: string; description: string; logo_url?: string; }
interface DrawEntry { id: string; draw_id: string; prize_tier?: string; created_at: string; }
interface Winner { id: string; amount: number; prize_tier: string; payment_status: string; proof_url?: string; }
interface Subscription { status: string; plan_id?: string; current_period_end?: string; }
interface DashData {
  subscription: Subscription;
  scores: Score[];
  charity: Charity | null;
  donation_percentage: number;
  full_name: string;
  draws: DrawEntry[];
  winnings: Winner[];
  total_won: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const api = (path: string) => `${CONFIG.BACKEND_URL}${path}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const badge = (status: string) => {
  const map: Record<string, string> = { active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', inactive: 'bg-red-500/20 text-red-400 border-red-500/30', past_due: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  return map[status] || map['inactive'];
};

// ─── Card shell ──────────────────────────────────────────────────────────────

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
  <div className={`bg-slate-800/60 border border-white/5 rounded-3xl p-6 backdrop-blur-sm ${className}`}>
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">{icon}</div>
      <h2 className="font-black text-white text-base tracking-tight">{title}</h2>
    </div>
    {children}
  </div>
);

// ─── Dashboard ───────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();

  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Score form
  const [scoreVal, setScoreVal] = useState('');
  const [dateVal, setDateVal] = useState('');
  const [scoreErr, setScoreErr] = useState('');
  const [scoreLoading, setScoreLoading] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);

  // Proof upload
  const [proofWinnerId, setProofWinnerId] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofErr, setProofErr] = useState('');
  const [proofLoading, setProofLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(api(CONFIG.API_ENDPOINTS.DASHBOARD), { headers });
      const dashData: DashData = res.data.data;

      // ── Subscription gate ──────────────────────────────────────
      // Only 'active' subscribers may access the dashboard.
      if (dashData.subscription?.status !== 'active') {
        navigate('/subscription', { replace: true });
        return;
      }

      setData(dashData);
    } catch (err: any) {
      // Session expired — clear auth and send to login
      if (err?.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError('Failed to load dashboard. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token) { navigate('/login'); return; }
    fetchDashboard();
  }, [user, token]);

  const handleLogout = () => { logout(); navigate('/'); };

  // ── Score submit ──────────────────────────────────────────────────────────

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoreErr('');
    const num = Number(scoreVal);
    if (!scoreVal || isNaN(num) || num < 1 || num > 45) { setScoreErr('Score must be 1–45 (Stableford).'); return; }
    if (!dateVal) { setScoreErr('Please pick a date.'); return; }
    setScoreLoading(true);
    try {
      if (editingScore) {
        await axios.put(api(`${CONFIG.API_ENDPOINTS.SCORES}/${editingScore.id}`), { score: num, date: dateVal }, { headers });
        setEditingScore(null);
      } else {
        await axios.post(api(CONFIG.API_ENDPOINTS.SCORES), { score: num, date: dateVal }, { headers });
      }
      setScoreVal(''); setDateVal('');
      await fetchDashboard();
    } catch (err: any) {
      setScoreErr(err?.response?.data?.error || 'Failed to save score.');
    } finally {
      setScoreLoading(false);
    }
  };

  const handleEditScore = (s: Score) => { setEditingScore(s); setScoreVal(String(s.score)); setDateVal(s.date); };
  const cancelEdit = () => { setEditingScore(null); setScoreVal(''); setDateVal(''); setScoreErr(''); };

  const handleDeleteScore = async (id: string) => {
    if (!window.confirm('Delete this score?')) return;
    try {
      await axios.delete(api(`${CONFIG.API_ENDPOINTS.SCORES}/${id}`), { headers });
      await fetchDashboard();
    } catch { alert('Failed to delete score.'); }
  };

  // ── Proof upload ──────────────────────────────────────────────────────────

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProofErr('');
    if (!proofWinnerId || !proofUrl) { setProofErr('Select a winner entry and enter a proof URL.'); return; }
    setProofLoading(true);
    try {
      await axios.post(api(CONFIG.API_ENDPOINTS.UPLOAD_PROOF), { winner_id: proofWinnerId, proof_url: proofUrl }, { headers });
      setProofUrl(''); setProofWinnerId('');
      await fetchDashboard();
    } catch (err: any) {
      setProofErr(err?.response?.data?.error || 'Failed to submit proof.');
    } finally {
      setProofLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-secondary animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-white">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="text-slate-400">{error}</p>
      <button onClick={fetchDashboard} className="px-6 py-3 bg-secondary text-dark rounded-xl font-black">Retry</button>
    </div>
  );

  const sub = data!.subscription;
  const scores = data!.scores;
  const winnings = data!.winnings;
  const isActive = sub.status === 'active';
  const hasWinnings = winnings.length > 0;
  const pendingWinners = winnings.filter(w => !w.proof_url);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[55%] h-[55%] bg-secondary/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-1">Member Dashboard</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              Welcome, <span className="text-secondary">{data!.full_name.split(' ')[0]}</span>
            </h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-sm text-slate-300 transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── 1. Subscription Status ── */}
          <Card title="Subscription" icon={<Crown className="w-5 h-5" />}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest mb-4 ${badge(sub.status)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {sub.status}
            </div>
            {sub.plan_id && <p className="text-slate-400 text-sm mb-1">Plan: <span className="text-white font-bold">{sub.plan_id.includes('yearly') ? 'Yearly' : 'Monthly'}</span></p>}
            {sub.current_period_end && <p className="text-slate-400 text-sm">Renews: <span className="text-white font-bold">{fmtDate(sub.current_period_end)}</span></p>}
            {!isActive && (
              <button onClick={() => navigate('/subscription')} className="mt-4 w-full py-3 bg-secondary text-dark rounded-xl font-black text-sm hover:brightness-110 transition-all">
                Subscribe Now
              </button>
            )}
          </Card>

          {/* ── 2. Charity Info ── */}
          <Card title="Your Charity" icon={<Heart className="w-5 h-5" />}>
            {data!.charity ? (
              <>
                <p className="text-white font-bold text-lg mb-1">{data!.charity.name}</p>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">{data!.charity.description}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${data!.donation_percentage}%` }} />
                  </div>
                  <span className="text-secondary font-black text-sm">{data!.donation_percentage}%</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">of your subscription donated</p>
              </>
            ) : (
              <p className="text-slate-500 text-sm">No charity selected.</p>
            )}
          </Card>

          {/* ── 3. Draw Participation ── */}
          <Card title="Draw Participation" icon={<Activity className="w-5 h-5" />}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-secondary">{data!.draws.length}</p>
                <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider">Draws Entered</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-white">{scores.length}</p>
                <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider">Scores Active</p>
              </div>
            </div>
            <div className={`text-xs font-bold px-3 py-2 rounded-xl text-center ${scores.length > 0 && isActive ? 'bg-secondary/10 text-secondary' : 'bg-white/5 text-slate-400'}`}>
              {scores.length > 0 && isActive ? '✓ Eligible for next draw' : 'Add scores to enter draws'}
            </div>
          </Card>

          {/* ── 4. Score Entry Form + Score List ── */}
          <Card title="Golf Scores" icon={<TrendingUp className="w-5 h-5" />} className="lg:col-span-2">
            {/* Form */}
            <form onSubmit={handleScoreSubmit} className="bg-white/5 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="number" min={1} max={45}
                  value={scoreVal} onChange={e => setScoreVal(e.target.value)}
                  placeholder="Score (1–45)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-slate-500 focus:outline-none focus:border-secondary/50 transition-colors"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date" value={dateVal} onChange={e => setDateVal(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-secondary/50 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={scoreLoading} className="flex items-center gap-2 px-5 py-3 bg-secondary text-dark rounded-xl font-black text-sm hover:brightness-110 transition-all disabled:opacity-60">
                  {scoreLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingScore ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingScore ? 'Save' : 'Add'}
                </button>
                {editingScore && (
                  <button type="button" onClick={cancelEdit} className="px-3 py-3 bg-white/10 rounded-xl text-slate-300 hover:bg-white/20 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
            {scoreErr && <p className="text-red-400 text-sm mb-3 font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" />{scoreErr}</p>}

            {/* Score list */}
            {scores.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No scores yet. Add your first Stableford score above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Last {scores.length} score{scores.length !== 1 ? 's' : ''} (most recent first)</p>
                {scores.map((s, i) => (
                  <div key={s.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${editingScore?.id === s.id ? 'bg-secondary/10 border-secondary/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-secondary/20 text-secondary' : 'bg-white/10 text-white'}`}>{s.score}</div>
                      <div>
                        <p className="text-white font-bold text-sm">{fmtDate(s.date)}</p>
                        <p className="text-slate-500 text-xs font-medium">Stableford</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditScore(s)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-secondary/20 hover:text-secondary flex items-center justify-center text-slate-400 transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteScore(s.id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-slate-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {scores.length === 5 && (
                  <p className="text-xs text-slate-500 text-center pt-1 font-medium">Maximum 5 scores stored — next entry replaces the oldest.</p>
                )}
              </div>
            )}
          </Card>

          {/* ── 5. Winnings Overview ── */}
          <Card title="Winnings" icon={<Trophy className="w-5 h-5" />}>
            <div className="bg-gradient-to-br from-secondary/10 to-transparent rounded-2xl p-5 mb-4 text-center">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Won</p>
              <p className="text-4xl font-black text-secondary">£{data!.total_won.toFixed(2)}</p>
            </div>
            {winnings.length === 0 ? (
              <p className="text-slate-500 text-sm text-center">No winnings yet. Keep playing!</p>
            ) : (
              <div className="space-y-2">
                {winnings.slice(0, 3).map(w => (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-bold text-sm capitalize">{w.prize_tier?.replace('_', ' ')}</p>
                      <p className="text-slate-500 text-xs">£{w.amount?.toFixed(2)}</p>
                    </div>
                    <span className={`text-xs font-black px-2 py-1 rounded-lg uppercase tracking-wider ${w.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {w.payment_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── 6. Upload Proof (winners only) ── */}
          {hasWinnings && pendingWinners.length > 0 && (
            <Card title="Upload Proof" icon={<Upload className="w-5 h-5" />} className="lg:col-span-2">
              <p className="text-slate-400 text-sm mb-4">You have a winning entry awaiting verification. Upload a screenshot of your scores from the golf platform.</p>
              <form onSubmit={handleProofSubmit} className="space-y-3">
                <select
                  value={proofWinnerId} onChange={e => setProofWinnerId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary/50 transition-colors"
                >
                  <option value="">Select your winning entry…</option>
                  {pendingWinners.map(w => (
                    <option key={w.id} value={w.id}>{w.prize_tier?.replace('_', ' ')} — £{w.amount?.toFixed(2)}</option>
                  ))}
                </select>
                <input
                  type="url" value={proofUrl} onChange={e => setProofUrl(e.target.value)}
                  placeholder="https://your-screenshot-url.com/proof.png"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-secondary/50 transition-colors"
                />
                {proofErr && <p className="text-red-400 text-sm font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" />{proofErr}</p>}
                <button type="submit" disabled={proofLoading} className="flex items-center gap-2 px-6 py-3 bg-secondary text-dark rounded-xl font-black text-sm hover:brightness-110 transition-all disabled:opacity-60">
                  {proofLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Submit Proof for Review
                </button>
              </form>
            </Card>
          )}

          {/* ── Recent Draw History ── */}
          {data!.draws.length > 0 && (
            <Card title="Recent Draws" icon={<Calendar className="w-5 h-5" />} className="lg:col-span-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data!.draws.slice(0, 6).map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <Star className="w-4 h-4 text-secondary flex-shrink-0" />
                    <div>
                      <p className="text-white font-bold text-sm">Draw #{d.draw_id?.slice(0, 8)}</p>
                      <p className="text-slate-500 text-xs">{fmtDate(d.created_at)}{d.prize_tier ? ` · ${d.prize_tier}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
