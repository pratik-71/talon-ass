import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, Trophy, Heart, ShieldCheck, BarChart3, Search, Trash2,
  Play, ExternalLink, Loader2, Plus, LogOut, CheckCircle2, XCircle, AlertCircle, Edit2, Wallet, FileCheck, Sparkles,  History, ZoomIn, ImageOff, RefreshCcw
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';

type TabType = 'analytics' | 'users' | 'draws' | 'charity' | 'winners';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'confirm' | 'reject';
  data?: any;
  onConfirm?: () => void;
}

import AnalyticsTab from '../components/admin/AnalyticsTab';
import UsersTab from '../components/admin/UsersTab';
import DrawsTab from '../components/admin/DrawsTab';
import CharityTab from '../components/admin/CharityTab';
import WinnersTab from '../components/admin/WinnersTab';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [drawHistory, setDrawHistory] = useState<any[]>([]);
  const [executingDraw, setExecutingDraw] = useState(false);
  const [lastDrawResult, setLastDrawResult] = useState<any | null>(null);
  const [drawLogic, setDrawLogic] = useState<'random' | 'algorithmic'>('random');
  const [processingWinnerId, setProcessingWinnerId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [modal, setModal] = useState<ModalState>({ isOpen: false, title: '', message: '', type: 'success' });
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userScores, setUserScores] = useState<any[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [editingScore, setEditingScore] = useState<any | null>(null);
  const [subscriptionModal, setSubscriptionModal] = useState<any | null>(null);
  const [charityModal, setCharityModal] = useState<{isOpen: boolean, data?: any}>({isOpen: false});
  const [selectedPlan, setSelectedPlan] = useState<'pro_monthly' | 'pro_yearly'>('pro_monthly');
  
  // Admin Entry Guard State
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, uRes, cRes, wRes, hRes] = await Promise.all([
        axios.get(`${CONFIG.BACKEND_URL}/api/admin/stats`, { headers }).catch(() => ({ data: { stats: null } })),
        axios.get(`${CONFIG.BACKEND_URL}/api/admin/users`, { headers }).catch(() => ({ data: { users: [] } })),
        axios.get(`${CONFIG.BACKEND_URL}/api/admin/charities`, { headers }).catch(() => ({ data: { charities: [] } })),
        axios.get(`${CONFIG.BACKEND_URL}/api/admin/winners`, { headers }).catch(() => ({ data: { winners: [] } })),
        axios.get(`${CONFIG.BACKEND_URL}/api/admin/draw/history`, { headers }).catch(() => ({ data: { history: [] } }))
      ]);

      setStatsData(sRes.data.stats);
      setUsers(uRes.data.users || []);
      setCharities(cRes.data.charities || []);
      setWinners(wRes.data.winners || []);
      setDrawHistory(hRes.data.history || []);
    } catch (err: any) {
      if (err?.response?.status === 401) { logout(); navigate('/login'); }
    } finally {
      setLoading(false);
    }
  }, [headers, logout, navigate]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    // Only fetch if verified via the guard
    if (isAdminAuth) {
      fetchData();
    }
  }, [token, isAdminAuth, fetchData, navigate]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@gmail.com' && adminPassword === 'admin123') {
      setIsAdminAuth(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleUpdateWinnerStatus = useCallback(async (winner: any, status: 'paid' | 'rejected') => {
    const executeUpdate = async () => {
      setProcessingWinnerId(winner.id);
      try {
        await axios.put(`${CONFIG.BACKEND_URL}/api/admin/winners/${winner.id}/status`, { status }, { headers });
        await fetchData();
        setModal({ isOpen: true, title: 'Success', message: `Winner status updated to ${status}.`, type: 'success' });
      } catch (err: any) {
        setModal({ isOpen: true, title: 'Error', message: 'Failed to update winner status.', type: 'error' });
      } finally {
        setProcessingWinnerId(null);
      }
    };

    if (status === 'paid' && !winner.proof_url) {
      setModal({
        isOpen: true,
        title: 'Authorize Payout?',
        message: 'This hero hasn\'t submitted proof yet. Are you sure you want to authorize payout?',
        type: 'confirm',
        onConfirm: executeUpdate
      });
    } else if (status === 'rejected') {
      setModal({
        isOpen: true,
        title: 'Reject Submission?',
        message: 'This will deny the current prize claim. Are you sure?',
        type: 'reject',
        onConfirm: executeUpdate
      });
    } else {
      executeUpdate();
    }
  }, [headers, fetchData]);

  const handleManageScores = useCallback((user: {id: string, name: string}) => {
    setSelectedUser(user);
    setLoadingScores(true);
    axios.get(`${CONFIG.BACKEND_URL}/api/admin/users/${user.id}/scores`, { headers })
      .then(res => setUserScores(res.data.scores || []))
      .catch(() => setModal({ isOpen: true, title: 'Error', message: 'Failed to fetch scores', type: 'error' }))
      .finally(() => setLoadingScores(false));
  }, [headers]);

  const handleDeleteUser = useCallback((id: string) => {
    setModal({
      isOpen: true,
      title: 'Delete User?',
      message: 'This action is permanent.',
      type: 'confirm',
      onConfirm: async () => {
        try {
          await axios.delete(`${CONFIG.BACKEND_URL}/api/admin/users/${id}`, { headers });
          setUsers(prev => prev.filter(u => u.id !== id));
          setModal({ isOpen: true, title: 'Success', message: 'User purged.', type: 'success' });
        } catch (err) {
          setModal({ isOpen: true, title: 'Error', message: 'Failed to delete user.', type: 'error' });
        }
      }
    });
  }, [headers]);

  const handleDeleteScore = useCallback((scoreId: string) => {
    setModal({
      isOpen: true,
      title: 'Delete Score?',
      message: 'This score record will be permanently removed.',
      type: 'confirm',
      onConfirm: async () => {
        try {
          await axios.delete(`${CONFIG.BACKEND_URL}/api/admin/scores/${scoreId}`, { headers });
          setUserScores(prev => prev.filter(s => s.id !== scoreId));
          setModal({ isOpen: true, title: 'Success', message: 'Score record deleted.', type: 'success' });
        } catch (err) {
          setModal({ isOpen: true, title: 'Error', message: 'Failed to delete score.', type: 'error' });
        }
      }
    });
  }, [headers]);

  const handleUpdateScore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingScore) return;
    const formData = new FormData(e.currentTarget);
    const score = Number(formData.get('score'));
    const date = formData.get('date') as string;

    try {
      await axios.put(`${CONFIG.BACKEND_URL}/api/admin/scores/${editingScore.id}`, { score, date }, { headers });
      setEditingScore(null);
      if (selectedUser) handleManageScores(selectedUser);
      setModal({ isOpen: true, title: 'Success', message: 'Score updated successfully.', type: 'success' });
    } catch (err: any) {
      setModal({ isOpen: true, title: 'Error', message: 'Failed to update score.', type: 'error' });
    }
  };

  const handleToggleSubscription = useCallback(async (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${CONFIG.BACKEND_URL}/api/admin/users/${user.id}/subscription`, { status: newStatus }, { headers });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      setModal({ isOpen: true, title: 'Success', message: `Subscription is now ${newStatus}.`, type: 'success' });
    } catch (err) {
      setModal({ isOpen: true, title: 'Error', message: 'Failed to update subscription.', type: 'error' });
    }
  }, [headers]);

  const handleSaveCharity = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const payload = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      logo_url: (form.elements.namedItem('logo_url') as HTMLInputElement).value,
      website_url: (form.elements.namedItem('website_url') as HTMLInputElement).value,
    };

    try {
      if (charityModal.data) {
        await axios.put(`${CONFIG.BACKEND_URL}/api/admin/charities/${charityModal.data.id}`, payload, { headers });
      } else {
        await axios.post(`${CONFIG.BACKEND_URL}/api/admin/charities`, payload, { headers });
      }
      setCharityModal({ isOpen: false });
      fetchData();
      setModal({ isOpen: true, title: 'Success', message: 'Charity saved.', type: 'success' });
    } catch (err) {
      setModal({ isOpen: true, title: 'Error', message: 'Failed to save charity.', type: 'error' });
    }
  }, [headers, charityModal.data, fetchData]);

  const handleDeleteCharity = useCallback((id: string) => {
    setModal({
      isOpen: true,
      title: 'Remove Partner?',
      message: 'Are you sure?',
      type: 'confirm',
      onConfirm: async () => {
        try {
          await axios.delete(`${CONFIG.BACKEND_URL}/api/admin/charities/${id}`, { headers });
          fetchData();
          setModal({ isOpen: true, title: 'Success', message: 'Charity removed.', type: 'success' });
        } catch (err) {
          setModal({ isOpen: true, title: 'Error', message: 'Failed to remove charity.', type: 'error' });
        }
      }
    });
  }, [headers, fetchData]);

  const handleExecuteDraw = async () => {
    setExecutingDraw(true);
    try {
      const res = await axios.post(`${CONFIG.BACKEND_URL}/api/admin/draw/execute`, { logic: drawLogic }, { headers });
      setLastDrawResult(res.data.summary);
      setDrawHistory(prev => [res.data.summary, ...prev]);
      setModal({ 
        isOpen: true, 
        title: 'Selection Success', 
        message: `Winner: ${res.data.summary.winner_name || 'Anonymous'}`, 
        type: 'success' 
      });
    } catch (err: any) {
      setModal({ isOpen: true, title: 'Error', message: err.response?.data?.error || 'Draw execution failed', type: 'error' });
    } finally {
      setExecutingDraw(false);
    }
  };

  const stats = useMemo(() => [
    { label: 'Total Users', value: statsData?.totalUsers || '0', trend: '+12%', icon: Users },
    { label: 'Prize Pool', value: `£${statsData?.prizePool || '0'}`, trend: '+£400', icon: Trophy },
    { label: 'Charity Giving', value: `£${statsData?.charityImpact?.toFixed(0) || '0'}`, trend: '+£1.2k', icon: Heart },
    { label: 'Verified Scores', value: statsData?.totalScores || '0', trend: '+5%', icon: ShieldCheck },
  ], [statsData]);

  if (!isAdminAuth) return (
    <div className="h-screen bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md animate-in zoom-in-95 duration-500 z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 sm:p-14 shadow-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-dark mb-6 shadow-lg shadow-secondary/20">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Admin Panel</h1>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Restricted Access Area</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Admin Email</label>
              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-secondary transition-colors" />
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 font-bold text-white focus:outline-none focus:border-secondary/50 focus:ring-4 ring-secondary/5 transition-all" 
                  placeholder="admin@gmail.com"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Admin Password</label>
              <div className="relative group">
                <LogOut className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-secondary transition-colors rotate-90" />
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 font-bold text-white focus:outline-none focus:border-secondary/50 focus:ring-4 ring-secondary/5 transition-all" 
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>

            {authError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest animate-in shake duration-300">
                <XCircle size={16} /> Invalid Credentials
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-5 bg-secondary text-dark rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-secondary/10 cursor-pointer"
            >
              Login to Admin Panel
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors cursor-pointer"
            >
              Abort & Return Home
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  if (loading && !statsData) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center p-6">
      <Loader2 className="w-10 h-10 text-secondary animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden relative">
      <aside className={`fixed lg:relative inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-white/5 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-dark"><ShieldCheck size={18} strokeWidth={3} /></div>
              <h1 className="text-xl font-black tracking-tighter uppercase">Admin Panel</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white"><XCircle size={24} /></button>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'draws', label: 'Draw Control', icon: Play },
              { id: 'charity', label: 'Impact Hub', icon: Heart },
              { id: 'winners', label: 'Winner Verification', icon: Trophy },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === item.id ? 'bg-secondary text-dark shadow-lg shadow-secondary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-white/5">
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all cursor-pointer">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="flex items-center justify-between px-6 sm:px-10 py-6 sm:py-8 bg-white border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-dark uppercase tracking-tight">{activeTab}</h2>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Management</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchData()} 
              disabled={loading}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
              Sync Data
            </button>
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-slate-50 rounded-lg text-slate-600"><BarChart3 size={20} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-10 scrollbar-hide relative">
          {loading && statsData && (
            <div className="absolute top-10 right-10 z-20 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-100 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <Loader2 className="w-4 h-4 text-secondary animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Refreshing...</span>
            </div>
          )}
          {activeTab === 'analytics' && <AnalyticsTab stats={stats} statsData={statsData} />}
          {activeTab === 'users' && <UsersTab users={users} onManageScores={handleManageScores} onToggleSubscription={setSubscriptionModal} onDeleteUser={handleDeleteUser} />}
          {activeTab === 'draws' && <DrawsTab drawLogic={drawLogic} setDrawLogic={setDrawLogic} executingDraw={executingDraw} onExecuteDraw={handleExecuteDraw} lastDrawResult={lastDrawResult} drawHistory={drawHistory} onViewWinner={(id) => navigate(`/verify-winner/${id}`)} />}
          {activeTab === 'charity' && <CharityTab charities={charities} onAddCharity={() => setCharityModal({ isOpen: true })} onEditCharity={(c) => setCharityModal({ isOpen: true, data: c })} onDeleteCharity={handleDeleteCharity} />}
          {activeTab === 'winners' && <WinnersTab winners={winners} onPreviewImage={setPreviewImage} onUpdateStatus={handleUpdateWinnerStatus} processingId={processingWinnerId} />}
        </div>
      </main>

      {/* Shared Modals */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-10 text-center">
                 <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 ${
                   modal.type === 'success' ? 'bg-green-50' : 
                   modal.type === 'error' || modal.type === 'reject' ? 'bg-red-50' : 
                   'bg-slate-50'
                 }`}>
                    {modal.type === 'success' && <CheckCircle2 className="w-10 h-10 text-green-500" />}
                    {(modal.type === 'error' || modal.type === 'reject') && <XCircle className="w-10 h-10 text-red-500" />}
                    {modal.type === 'confirm' && <AlertCircle className="w-10 h-10 text-orange-500" />}
                 </div>
                 <h3 className="text-2xl font-black text-dark uppercase tracking-tighter mb-2">{modal.title}</h3>
                 <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">{modal.message}</p>
                 
                 <div className="flex gap-3">
                    {modal.type === 'confirm' || modal.type === 'reject' ? (
                      <>
                        <button 
                          onClick={() => setModal({ ...modal, isOpen: false })}
                          className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => { modal.onConfirm?.(); setModal({ ...modal, isOpen: false }); }}
                          className={`flex-1 py-4 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-lg ${
                            modal.type === 'reject' ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' : 'bg-dark shadow-dark/20 hover:bg-slate-800'
                          }`}
                        >
                          Confirm
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setModal({ ...modal, isOpen: false })}
                        className="w-full py-4 bg-dark text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all cursor-pointer shadow-lg shadow-dark/20"
                      >
                        Dismiss
                      </button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {previewImage && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-12 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300 cursor-zoom-out"
          onClick={() => { setPreviewImage(null); setImageError(false); }}
        >
           <button className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
              <XCircle size={32} />
           </button>
           <div className="w-full max-w-5xl h-full flex items-center justify-center animate-in zoom-in-95 duration-500">
              {imageError ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center">
                   <ImageOff size={64} className="text-slate-500 mx-auto mb-6" />
                   <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Proof Image Offline</h3>
                   <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto">The link provided by this user is currently unreachable. Please verify with the user.</p>
                </div>
              ) : (
                <img 
                  src={previewImage.replace('via.placeholder.com', 'placehold.co')} 
                  alt="Winner Proof" 
                  onError={() => setImageError(true)}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10" 
                />
              )}
           </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[80vh] flex flex-col">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-dark uppercase tracking-tighter mb-1">{selectedUser.name}</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Score Management Portfolio</p>
                 </div>
                 <button onClick={() => setSelectedUser(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-dark transition-all cursor-pointer">
                    <XCircle size={24} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10">
                 {loadingScores ? (
                    <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto" /></div>
                 ) : (
                    <div className="space-y-4">
                       {userScores.map((s) => (
                          <div key={s.id} className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between group">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-xl font-black text-secondary">
                                   {s.score}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-dark uppercase tracking-tight">{new Date(s.date).toLocaleDateString()}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Stableford Point Entry</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setEditingScore(s)} 
                                  title="Edit Entry"
                                  className="p-3 bg-white text-slate-500 hover:text-dark border border-slate-100 rounded-xl transition-all cursor-pointer shadow-sm shadow-transparent hover:shadow-slate-200"
                                >
                                   <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteScore(s.id)}
                                  title="Remove Entry"
                                  className="p-3 bg-red-50 text-red-400 hover:text-red-600 border border-red-100 rounded-xl transition-all cursor-pointer"
                                >
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </div>
                       ))}
                       {userScores.length === 0 && <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">No scores recorded for this hero.</p>}
                    </div>
                 )}
              </div>
           </div>

           {editingScore && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                   <div className="p-10">
                      <h4 className="text-xl font-black text-dark uppercase tracking-tighter mb-8">Edit Score Data</h4>
                      <form onSubmit={handleUpdateScore} className="space-y-6">
                         <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Stableford Score</label>
                            <input name="score" type="number" defaultValue={editingScore.score} min="1" max="45" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-black text-dark focus:outline-none focus:border-secondary" required />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Round Date</label>
                            <input name="date" type="date" defaultValue={editingScore.date.split('T')[0]} max={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-black text-dark focus:outline-none focus:border-secondary" required />
                         </div>
                         <div className="flex gap-2 pt-4">
                            <button type="button" onClick={() => setEditingScore(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest cursor-pointer">Cancel</button>
                            <button type="submit" className="flex-1 py-4 bg-secondary text-dark rounded-xl font-black uppercase text-[10px] tracking-widest cursor-pointer">Save Changes</button>
                         </div>
                      </form>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {charityModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-10">
                 <h3 className="text-2xl font-black text-dark uppercase tracking-tighter mb-8">{charityModal.data ? 'Edit Charity' : 'Add Charity'}</h3>
                 <form onSubmit={handleSaveCharity} className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Partner Name</label>
                       <input name="name" defaultValue={charityModal.data?.name} className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold text-dark focus:ring-2 ring-secondary/20 transition-all" placeholder="e.g. Hope Alliance" required />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Global Mission Statement</label>
                       <textarea name="description" defaultValue={charityModal.data?.description} className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold text-dark focus:ring-2 ring-secondary/20 transition-all h-32" placeholder="Describe the charitable impact..." required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Logo Resource URL</label>
                          <input name="logo_url" defaultValue={charityModal.data?.logo_url} className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold text-dark focus:ring-2 ring-secondary/20 transition-all" placeholder="https://..." />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Official Website</label>
                          <input name="website_url" defaultValue={charityModal.data?.website_url} className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold text-dark focus:ring-2 ring-secondary/20 transition-all" placeholder="https://..." />
                       </div>
                    </div>
                    <div className="flex gap-3 pt-6">
                       <button type="button" onClick={() => setCharityModal({ isOpen: false })} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all cursor-pointer">Discard</button>
                       <button type="submit" className="flex-1 py-5 bg-secondary text-dark rounded-2xl font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all shadow-lg shadow-secondary/10 cursor-pointer">Save Partner</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {subscriptionModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-10">
                 {/* Header */}
                 <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 bg-dark rounded-2xl flex items-center justify-center text-secondary shrink-0">
                     <Wallet size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-dark uppercase tracking-tighter">{subscriptionModal.full_name}</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subscriptionModal.email}</p>
                   </div>
                 </div>

                 {/* Current Plan Info */}
                 <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Current Subscription</p>
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="font-black text-dark text-sm">{subscriptionModal.plan_type || 'No Plan'}</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-0.5">{subscriptionModal.subscription_status || 'Inactive'}</p>
                     </div>
                     <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                       subscriptionModal.status === 'active' 
                         ? 'bg-emerald-50 text-emerald-600' 
                         : 'bg-red-50 text-red-500'
                     }`}>
                       {subscriptionModal.status === 'active' ? '● Active' : '● Inactive'}
                     </span>
                   </div>
                 </div>

                 {/* Assign / Upgrade Plan */}
                 <div className="mb-6">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Assign Plan</p>
                   <div className="grid grid-cols-2 gap-3">
                     <button
                       onClick={() => setSelectedPlan('pro_monthly')}
                       className={`py-4 px-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                         selectedPlan === 'pro_monthly' 
                           ? 'border-secondary bg-secondary/5' 
                           : 'border-slate-100 hover:border-slate-200'
                       }`}
                     >
                       <p className="font-black text-dark text-xs uppercase tracking-tight">Monthly</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-0.5">Pro Monthly</p>
                     </button>
                     <button
                       onClick={() => setSelectedPlan('pro_yearly')}
                       className={`py-4 px-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                         selectedPlan === 'pro_yearly' 
                           ? 'border-secondary bg-secondary/5' 
                           : 'border-slate-100 hover:border-slate-200'
                       }`}
                     >
                       <p className="font-black text-dark text-xs uppercase tracking-tight">Yearly</p>
                       <p className="text-[10px] font-bold text-emerald-500 mt-0.5">Best Value</p>
                     </button>
                   </div>
                 </div>

                 <div className="space-y-3">
                   {/* Assign / Upgrade */}
                   <button
                     onClick={async () => {
                       try {
                         await axios.put(`${CONFIG.BACKEND_URL}/api/admin/users/${subscriptionModal.id}/subscription`, 
                           { status: 'active', plan_id: selectedPlan }, 
                           { headers }
                         );
                         setUsers(prev => prev.map(u => u.id === subscriptionModal.id ? { ...u, status: 'active', subscription_status: 'Active', plan_type: selectedPlan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly' } : u));
                         setSubscriptionModal(null);
                         setModal({ isOpen: true, title: 'Success', message: `Plan assigned: ${selectedPlan === 'pro_monthly' ? 'Monthly' : 'Yearly'}.`, type: 'success' });
                       } catch { setModal({ isOpen: true, title: 'Error', message: 'Failed to assign plan.', type: 'error' }); }
                     }}
                     className="w-full py-4 bg-secondary text-dark rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-3"
                   >
                     <CheckCircle2 size={18} />
                     {subscriptionModal.status === 'active' ? 'Upgrade Plan' : 'Assign & Activate'}
                   </button>

                   {/* Deactivate */}
                   {subscriptionModal.status === 'active' && (
                     <button
                       onClick={() => { handleToggleSubscription(subscriptionModal); setSubscriptionModal(null); }}
                       className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all cursor-pointer flex items-center justify-center gap-3"
                     >
                       <XCircle size={18} /> Deactivate Account
                     </button>
                   )}

                   {/* Delete User */}
                   <button
                     onClick={() => { setSubscriptionModal(null); handleDeleteUser(subscriptionModal.id); }}
                     className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-3"
                   >
                     <Trash2 size={18} /> Delete User
                   </button>

                   {/* Cancel */}
                   <button
                     onClick={() => setSubscriptionModal(null)}
                     className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all cursor-pointer"
                   >
                     Cancel
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
