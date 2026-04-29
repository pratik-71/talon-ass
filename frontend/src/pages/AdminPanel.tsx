import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, Trophy, Heart, ShieldCheck, BarChart3, Search, Trash2,
  Play, ExternalLink, Loader2, Plus, LogOut, CheckCircle2, XCircle, AlertCircle, Edit2, Wallet, FileCheck, Sparkles,  History, ZoomIn, ImageOff
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
  const [isSimulation, setIsSimulation] = useState(false);
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
    fetchData();
  }, [token, fetchData, navigate]);

  const handleUpdateWinnerStatus = useCallback((id: string, status: 'paid' | 'rejected') => {
    setModal({
      isOpen: true,
      title: status === 'paid' ? 'Confirm Approval?' : 'Confirm Rejection?',
      message: status === 'paid' ? 'Release prize payment.' : 'Notify user to re-upload.',
      type: status === 'paid' ? 'confirm' : 'reject',
      onConfirm: async () => {
        try {
          await axios.put(`${CONFIG.BACKEND_URL}/api/admin/winners/${id}/status`, { status }, { headers });
          fetchData();
          setModal({ isOpen: true, title: 'Success', message: 'Winner status updated.', type: 'success' });
        } catch (err: any) {
          setModal({ isOpen: true, title: 'Error', message: err.response?.data?.error, type: 'error' });
        }
      }
    });
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
      title: 'Purge Hero?',
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

  const handleExecuteDraw = useCallback(async () => {
    setExecutingDraw(true);
    setLastDrawResult(null);
    try {
      const res = await axios.post(`${CONFIG.BACKEND_URL}/api/admin/draw/execute`, { logic: drawLogic, simulation: isSimulation }, { headers });
      setLastDrawResult(res.data.summary);
      if (!isSimulation) fetchData();
      setModal({ isOpen: true, title: 'Success', message: 'Draw executed.', type: 'success' });
    } catch (err: any) {
      setModal({ isOpen: true, title: 'Error', message: err.response?.data?.error, type: 'error' });
    } finally {
      setExecutingDraw(false);
    }
  }, [headers, drawLogic, isSimulation, fetchData]);

  const stats = useMemo(() => [
    { label: 'Total Users', value: statsData?.totalUsers || '0', trend: '+12%', icon: Users },
    { label: 'Prize Pool', value: `£${statsData?.prizePool || '0'}`, trend: '+£400', icon: Trophy },
    { label: 'Charity Giving', value: `£${statsData?.charityImpact?.toFixed(0) || '0'}`, trend: '+£1.2k', icon: Heart },
    { label: 'Verified Scores', value: statsData?.totalScores || '0', trend: '+5%', icon: ShieldCheck },
  ], [statsData]);

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
              <h1 className="text-xl font-black tracking-tighter uppercase">Admin HQ</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white"><XCircle size={24} /></button>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'users', label: 'User Registry', icon: Users },
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
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Management HQ</p>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-slate-50 rounded-lg text-slate-600"><BarChart3 size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-10 scrollbar-hide">
          {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}
          {activeTab === 'users' && <UsersTab users={users} onManageScores={handleManageScores} onToggleSubscription={handleToggleSubscription} onDeleteUser={handleDeleteUser} />}
          {activeTab === 'draws' && <DrawsTab drawLogic={drawLogic} setDrawLogic={setDrawLogic} isSimulation={isSimulation} setIsSimulation={setIsSimulation} executingDraw={executingDraw} onExecuteDraw={handleExecuteDraw} lastDrawResult={lastDrawResult} drawHistory={drawHistory} onViewWinner={(id) => navigate(`/verify-winner/${id}`)} />}
          {activeTab === 'charity' && <CharityTab charities={charities} onAddCharity={() => setCharityModal({ isOpen: true })} onEditCharity={(c) => setCharityModal({ isOpen: true, data: c })} onDeleteCharity={handleDeleteCharity} />}
          {activeTab === 'winners' && <WinnersTab winners={winners} onPreviewImage={setPreviewImage} onUpdateStatus={handleUpdateWinnerStatus} />}
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
                   <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto">The link provided by the Hero is currently unreachable. Please verify with the user.</p>
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
                             <button onClick={() => setEditingScore(s)} className="p-3 text-slate-300 hover:text-secondary hover:bg-white rounded-xl transition-all cursor-pointer shadow-sm shadow-transparent hover:shadow-slate-200">
                                <Edit2 size={18} />
                             </button>
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
                            <input name="date" type="date" defaultValue={editingScore.date.split('T')[0]} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-black text-dark focus:outline-none focus:border-secondary" required />
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
                 <h3 className="text-2xl font-black text-dark uppercase tracking-tighter mb-8">{charityModal.data ? 'Edit Impact Partner' : 'New Impact Partner'}</h3>
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
           <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-10">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-secondary mb-8">
                    <Wallet size={28} />
                 </div>
                 <h3 className="text-2xl font-black text-dark uppercase tracking-tighter mb-2">Access Control</h3>
                 <p className="text-slate-500 font-bold text-sm mb-10 leading-relaxed">Manually override Hero status or subscription visibility for <b>{subscriptionModal.full_name}</b>.</p>
                 
                 <div className="space-y-3">
                    <button 
                      onClick={() => handleToggleSubscription(subscriptionModal.id, subscriptionModal.status)}
                      className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 ${
                        subscriptionModal.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                    >
                       {subscriptionModal.status === 'active' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                       {subscriptionModal.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                    </button>
                    <button onClick={() => setSubscriptionModal(null)} className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all cursor-pointer">
                       Cancel Action
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
