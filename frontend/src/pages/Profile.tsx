import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Heart, 
  Trophy, 
  Settings, 
  Save, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck,
  Mail,
  Zap,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { token, user: authUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [charities, setCharities] = useState<any[]>([]);
  const [winnings, setWinnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [charityId, setCharityId] = useState('');
  const [donation, setDonation] = useState(10);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean, title: string, message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        const profRes = await axios.get(`${CONFIG.BACKEND_URL}/api/user/profile`, { headers });
        const p = profRes.data.profile;
        if (p) {
          setProfile(p);
          setFullName(p.full_name || '');
          setCharityId(p.charity_id || '');
          setDonation(p.donation_percentage || 10);
        }
      } catch (err) {
        console.error('Profile fetch failed:', err);
      }

      try {
        const charRes = await axios.get(`${CONFIG.BACKEND_URL}/api/charities`);
        setCharities(charRes.data.data || []);
      } catch (err) {
        console.error('Charities fetch failed:', err);
      }

      try {
        const winRes = await axios.get(`${CONFIG.BACKEND_URL}/api/winners/my-winnings`, { headers });
        setWinnings(winRes.data.winners || []);
      } catch (err) {
        console.error('Winnings fetch failed:', err);
      }

      setLoading(false);
    };
    fetchData();
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${CONFIG.BACKEND_URL}/api/user/profile`, {
        fullName,
        charityId,
        donationPercentage: donation
      }, { headers });
      
      updateUser({ full_name: fullName });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const totalWon = winnings.reduce((sum, w) => sum + Number(w.amount), 0);
  const charityLifetime = totalWon * (donation / 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="profile-root">
      <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          
          <header className="mb-12">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-dark rounded-[2rem] flex items-center justify-center text-secondary shadow-2xl">
                      <User size={32} />
                   </div>
                   <div>
                      <h1 className="text-4xl font-black text-dark uppercase tracking-tighter">Identity & Impact</h1>
                      <p className="text-slate-500 font-bold text-sm">Manage your profile, charity preferences, and view your legacy.</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                      <ShieldCheck size={14} /> Verified Member
                   </div>
                   <div className="px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-secondary/20">
                      <Zap size={14} /> {authUser?.plan_type || 'Monthly'} Plan
                   </div>
                   {authUser?.subscription_status === 'active' && (
                    <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200">
                       Renewal: {new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                   )}
                </div>
             </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Settings size={120} />
                   </div>
                   
                   <h3 className="text-2xl font-black text-dark uppercase tracking-tight mb-8 flex items-center gap-3">
                      <Settings className="text-secondary" /> Personal Preferences
                   </h3>
                   
                   <form onSubmit={handleUpdateProfile} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Legal Name</label>
                            <input 
                              type="text" 
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-dark focus:outline-none focus:border-secondary transition-all"
                              placeholder="Your Name"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                            <div className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-400 flex items-center gap-3 cursor-not-allowed">
                               <Mail size={16} /> {profile?.email}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8 pt-8 border-t border-slate-100">
                         <div className="flex items-center justify-between">
                            <h4 className="text-lg font-black text-dark uppercase tracking-tight">Charity Allocation</h4>
                            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-[10px] font-black uppercase tracking-widest">Global Impact</span>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Active Partner</label>
                               <select 
                                 value={charityId}
                                 onChange={(e) => setCharityId(e.target.value)}
                                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-dark focus:outline-none focus:border-secondary transition-all cursor-pointer appearance-none"
                               >
                                 <option value="">Select a Charity</option>
                                 {charities.map(c => (
                                   <option key={c.id} value={c.id}>{c.name}</option>
                                 ))}
                               </select>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Donation Contribution</label>
                               <div className="flex items-center gap-4">
                                  <input 
                                    type="range" 
                                    min="5" 
                                    max="50" 
                                    step="5"
                                    value={donation}
                                    onChange={(e) => setDonation(Number(e.target.value))}
                                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-secondary"
                                  />
                                  <div className="w-16 h-12 bg-dark text-white rounded-xl flex items-center justify-center font-black text-sm">
                                     {donation}%
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
                         <button 
                           type="submit" 
                           disabled={saving}
                           className="w-full sm:w-auto px-10 py-5 bg-dark text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-dark/20"
                         >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                         </button>
                         {successMsg && (
                           <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest animate-in fade-in">
                              <CheckCircle2 size={18} /> {successMsg}
                           </div>
                         )}
                      </div>
                   </form>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-black/20">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-dark">
                         <CreditCard size={24} />
                      </div>
                      <div>
                         <p className="text-sm font-black uppercase tracking-widest">Subscription Control</p>
                         <p className="text-xs font-bold text-slate-400">Handle payments, invoices, and plan upgrades.</p>
                      </div>
                   </div>
                   <button 
                    onClick={async () => {
                      try {
                        setSaving(true);
                        const res = await axios.get(`${CONFIG.BACKEND_URL}/api/subscriptions/manage`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.data.url) {
                          window.open(res.data.url, '_blank');
                        }
                      } catch (err: any) {
                        const isSubscribed = authUser?.subscription_status === 'active';
                        if (err.response?.status === 404 && !isSubscribed) {
                          navigate('/subscription');
                        } else if (err.response?.status === 404 && isSubscribed) {
                          setInfoModal({
                            isOpen: true,
                            title: "Hero Status: Active",
                            message: "Your Hero membership is active! However, no Paddle billing record was found for this account. This typically happens in Test/Development mode or with manual activations."
                          });
                        } else {
                          setInfoModal({
                            isOpen: true,
                            title: "Portal Error",
                            message: err.response?.data?.error || "Failed to open billing portal."
                          });
                        }
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="px-10 py-4 bg-secondary text-dark hover:brightness-110 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-secondary/10 cursor-pointer disabled:opacity-50"
                   >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Manage Subscription'}
                   </button>
                </div>
             </div>

             <div className="space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                   <h3 className="text-xl font-black text-dark uppercase tracking-tight mb-2 flex items-center gap-3">
                      <Trophy className="text-secondary" /> Win Registry
                   </h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Lifetime Earnings: £{totalWon.toFixed(2)}</p>
                   
                   <div className="space-y-4 max-h-[480px] overflow-y-auto pr-3 custom-scrollbar">
                      {winnings.length === 0 ? (
                        <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                           <Trophy size={40} className="text-slate-200 mx-auto mb-4" />
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No prizes awarded yet</p>
                        </div>
                      ) : (
                        winnings.map((w) => (
                          <div key={w.id} className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-secondary hover:bg-white transition-all shadow-sm">
                             <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  {new Date(w.created_at).toLocaleDateString()}
                                </span>
                                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                  w.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 
                                  'bg-secondary/20 text-dark'
                                }`}>
                                  {w.payment_status}
                                </div>
                             </div>
                             <div className="flex items-center justify-between gap-4">
                                <h4 className="text-xs sm:text-sm font-black text-dark uppercase tracking-tight leading-tight flex-1">{w.prize_tier}</h4>
                                <p className="text-lg sm:text-xl font-black text-secondary tracking-tighter">£{w.amount}</p>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                <div className="bg-secondary rounded-[2.5rem] p-8 text-dark shadow-xl shadow-secondary/20">
                   <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                      <Heart className="fill-dark" /> Social Impact
                   </h3>
                   <p className="text-xs font-bold leading-relaxed mb-6">
                      Your current settings ensure that <span className="font-black">{donation}%</span> of your subscription goes directly to humanitarian causes.
                   </p>
                   <div className="p-4 bg-dark/5 rounded-2xl border border-dark/10">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">Lifetime Contribution</p>
                      <p className="text-3xl font-black tracking-tighter text-dark">£{charityLifetime.toFixed(2)}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

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

      <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}</style>
    </div>
  );
};

export default Profile;
