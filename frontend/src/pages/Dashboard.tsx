import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Heart, Trophy, LogOut, Loader2, Check, Trash2, Plus, Edit2, X, AlertCircle, TrendingUp, Calendar, Hash
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Score { id: string; score: number; date: string; }
interface Charity { name: string; description: string; logo_url?: string; }
interface DashData {
  subscription: { status: string; };
  scores: Score[];
  charity: Charity | null;
  donation_percentage: number;
  full_name: string;
  total_won: number;
}

import ScoreModal from '../components/ScoreModal';
import DeleteModal from '../components/DeleteModal';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// --- Memoized Components ---
const ScoreCard = React.memo(({ s, onEdit, onDelete }: { s: Score, onEdit: (s: Score) => void, onDelete: (id: string) => void }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-800 border-l-4 sm:border-l-8 border-l-secondary shadow-lg hover:bg-black transition-all group gap-4 sm:gap-0">
      <div className="flex items-center gap-4 sm:gap-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl font-black text-secondary shrink-0">
          {s.score}
        </div>
        <div className="min-w-0">
          <p className="text-base sm:text-lg font-black text-white tracking-tight uppercase leading-none mb-1 sm:mb-2 truncate">{fmtDate(s.date)}</p>
          <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Round</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end border-t border-white/5 pt-3 sm:pt-0 sm:border-t-0">
        <button onClick={() => onEdit(s)} className="flex-1 sm:flex-none p-3 sm:p-4 text-slate-600 hover:text-white hover:bg-white/5 rounded-xl sm:rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2">
          <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="sm:hidden text-[10px] font-black uppercase">Edit</span>
        </button>
        <button onClick={() => onDelete(s.id)} className="flex-1 sm:flex-none p-3 sm:p-4 text-slate-600 hover:text-red-500 hover:bg-white/5 rounded-xl sm:rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2">
          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="sm:hidden text-[10px] font-black uppercase">Delete</span>
        </button>
      </div>
    </div>
  );
});

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();

  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [activeScoreId, setActiveScoreId] = useState<string | null>(null);

  // Form State
  const [scoreVal, setScoreVal] = useState('');
  const [dateVal, setDateVal] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await axios.get(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.DASHBOARD}`, { headers });
      
      const isSubscribed = res.data.data.subscription?.status === 'active' || user?.subscription_status === 'active';

      if (!isSubscribed) {
        try {
          await axios.get(`${CONFIG.BACKEND_URL}/api/subscription/force-update-subscription`, { headers });
          const retryRes = await axios.get(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.DASHBOARD}`, { headers });
          setData(retryRes.data.data);
          const stillNotSubscribed = retryRes.data.data.subscription?.status !== 'active' && user?.subscription_status !== 'active';
          if (stillNotSubscribed) { navigate('/subscription', { replace: true }); return; }
        } catch { navigate('/subscription', { replace: true }); return; }
      } else {
        setData(res.data.data);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) { logout(); navigate('/login'); }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, navigate, logout, headers]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchDashboard();
  }, [token, fetchDashboard]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  
  const openAddModal = useCallback(() => {
    setModalMode('add');
    setScoreVal('');
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setDateVal(localToday);
    setErrorMsg('');
    setShowScoreModal(true);
  }, []);

  const openEditModal = useCallback((s: Score) => {
    setModalMode('edit');
    setActiveScoreId(s.id);
    setScoreVal(s.score.toString());
    setDateVal(s.date.split('T')[0]);
    setErrorMsg('');
    setShowScoreModal(true);
  }, []);

  const closeScoreModal = useCallback(() => setShowScoreModal(false), []);
  const closeDeleteModal = useCallback(() => setShowDeleteModal(null), []);
  const openDeleteModal = useCallback((id: string) => setShowDeleteModal(id), []);

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const num = Number(scoreVal);
    if (!scoreVal || isNaN(num) || num < 1 || num > 45 || !dateVal) {
      setErrorMsg('Score must be between 1 and 45.');
      return;
    }

    setActionLoading(true);
    try {
      if (modalMode === 'add') {
        await axios.post(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.SCORES}`, { score: num, date: dateVal }, { headers });
      } else {
        await axios.put(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.SCORES}/${activeScoreId}`, { score: num, date: dateVal }, { headers });
      }
      setShowScoreModal(false);
      await fetchDashboard(true);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteScore = async () => {
    if (!showDeleteModal) return;
    setActionLoading(true);
    try {
      await axios.delete(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.SCORES}/${showDeleteModal}`, { headers });
      setShowDeleteModal(null);
      await fetchDashboard(true);
    } catch {
      alert('Delete failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-secondary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
        
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="w-full md:w-auto">
            <p className="text-secondary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-2">Authenticated Hero</p>
            <h2 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase leading-none break-words">
              {data?.full_name && !data.full_name.includes('@') 
                ? data.full_name.split(' ')[0] 
                : (user?.full_name || 'Member Hero')}
            </h2>
          </div>
          <div className="w-full md:w-auto bg-dark p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] text-white min-w-full md:min-w-[280px] shadow-2xl shadow-dark/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
              <Trophy size={60} className="sm:w-20 sm:h-20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Winnings</p>
            <p className="text-3xl sm:text-4xl font-black tracking-tighter">£{data?.total_won.toFixed(2)}</p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-secondary mb-4 sm:mb-6">
              <Activity size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Rolling Scores</p>
            <p className="text-2xl sm:text-3xl font-black text-dark">{data?.scores.length} <span className="text-slate-200">/ 5</span></p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm sm:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
            <div className="w-full md:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-secondary mb-4">
                <Heart size={20} className="sm:w-6 sm:h-6" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Impact Partner</p>
              <p className="text-xl sm:text-2xl font-black text-dark truncate uppercase">{data?.charity?.name || 'Community Fund'}</p>
            </div>
            <button 
              onClick={openAddModal} 
              className="w-full md:w-auto px-6 sm:px-8 py-4 sm:py-5 bg-secondary text-dark rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xl shadow-secondary/20 group/btn"
            >
              <Plus size={18} strokeWidth={4} />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Add Score</span>
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center px-2 sm:px-4 mb-2 sm:mb-4">
             <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Score History</h3>
          </div>

          {data?.scores.length === 0 ? (
            <div className="bg-white p-12 sm:p-20 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">No rounds recorded. Start your journey.</p>
            </div>
          ) : (
            data?.scores.map((s) => (
              <ScoreCard key={s.id} s={s} onEdit={openEditModal} onDelete={openDeleteModal} />
            ))
          )}
        </div>
      </div>

      {/* ─── MODALS (Rendered via Portals) ─── */}
      <ScoreModal 
        isOpen={showScoreModal}
        onClose={closeScoreModal}
        mode={modalMode}
        scoreVal={scoreVal}
        dateVal={dateVal}
        setScoreVal={setScoreVal}
        setDateVal={setDateVal}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        actionLoading={actionLoading}
        onSubmit={handleScoreSubmit}
      />

      <DeleteModal 
        isOpen={!!showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteScore}
        actionLoading={actionLoading}
      />

    </div>
  );
};

export default Dashboard;
