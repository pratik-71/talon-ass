import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Trophy, ArrowRight, Loader2, Bell, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';

const Messages: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { token, user } = useAuthStore();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetch all winners for this user
        const res = await axios.get(`${CONFIG.BACKEND_URL}/api/winners/my-winnings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setNotifications(res.data.winners || []);
      } catch (err) {
        console.error('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-secondary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-8 sm:mb-12">
           <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                 <MessageSquare size={24} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-dark uppercase tracking-tighter">Your Inbox</h1>
           </div>
           <p className="text-slate-500 font-bold max-w-xl text-sm sm:text-base">Stay updated with draw results, prize notifications, and community alerts.</p>
        </header>

        <div className="space-y-4">
           {notifications.length === 0 ? (
             <div className="bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] p-12 sm:p-20 text-center shadow-sm">
                <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-6" />
                <h3 className="text-lg sm:text-xl font-bold text-dark mb-2">Your inbox is empty</h3>
                <p className="text-slate-500 text-xs sm:text-sm">We'll notify you here if you win a prize or if there are platform updates.</p>
             </div>
           ) : (
             notifications.map((n) => (
                    <div key={n.id} className={`group relative bg-white border rounded-[2.5rem] p-8 transition-all shadow-sm ${
                      n.payment_status === 'paid' ? 'border-emerald-100 hover:border-emerald-500' :
                      n.payment_status?.startsWith('rejected') ? 'border-red-100 hover:border-red-500' :
                      'border-slate-200 hover:border-secondary'
                    }`}>
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-start gap-6">
                             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-dark flex-shrink-0 shadow-lg ${
                               n.payment_status === 'paid' ? 'bg-emerald-500 shadow-emerald-500/20' :
                               n.payment_status?.startsWith('rejected') ? 'bg-red-500 shadow-red-500/20' :
                               'bg-secondary shadow-secondary/20'
                             }`}>
                                {n.payment_status === 'paid' ? <CheckCircle2 size={32} strokeWidth={2.5} /> : 
                                 n.payment_status?.startsWith('rejected') ? <XCircle size={32} strokeWidth={2.5} /> :
                                 <Trophy size={32} strokeWidth={2.5} />}
                             </div>
                             <div>
                                <div className="flex items-center gap-3 mb-2">
                                   <h3 className="text-2xl font-black text-dark uppercase tracking-tight">
                                     {n.payment_status === 'paid' ? "Prize Authorized!" : 
                                      n.payment_status === 'pending_review' ? "Verification Under Review" :
                                      n.payment_status?.startsWith('rejected') ? "Submission Issue" : 
                                      "Congratulations! You've Won!"}
                                   </h3>
                                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                     n.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                     n.payment_status === 'pending_review' ? 'bg-blue-50 text-blue-600' :
                                     n.payment_status?.startsWith('rejected') ? 'bg-red-50 text-red-600' :
                                     'bg-slate-100 text-slate-500'
                                   }`}>
                                     {n.payment_status?.replace('_', ' ') || 'Pending'}
                                   </span>
                                </div>
                                <p className="text-slate-600 font-bold text-sm mb-4">
                                  {n.payment_status === 'paid' ? 
                                    `Your prize of £${n.amount} has been verified and authorized for payment. Check your email for next steps.` :
                                   n.payment_status === 'pending_review' ?
                                    `We have received your proof for the £${n.amount} prize. Our team is currently reviewing it. We'll notify you once authorized.` :
                                   n.payment_status?.startsWith('rejected') ? 
                                    `There was an issue with your proof submission for the £${n.amount} prize. Please re-upload your verification.` :
                                    `You have been selected as a winner for the ${n.prize_tier} prize tier. To claim your £${n.amount}, please verify your scores.`}
                                </p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-500">
                                   System Notification • {new Date(n.created_at).toLocaleDateString()}
                                </div>
                             </div>
                          </div>
                          {n.payment_status !== 'paid' && (
                            <Link 
                              to={n.payment_status === 'pending_review' ? '#' : `/verify-winner/${n.id}`}
                              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg group-hover:-translate-y-1 ${
                                n.payment_status === 'pending_review' ? 'bg-slate-100 text-slate-400 cursor-default' :
                                n.payment_status?.startsWith('rejected') ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' :
                                'bg-dark text-white shadow-dark/20 hover:bg-slate-800'
                              }`}
                            >
                              {n.payment_status === 'pending_review' ? 'Reviewing...' : 
                               n.payment_status?.startsWith('rejected') ? 'Re-upload Proof' : 'Verify Now'} 
                              {n.payment_status !== 'pending_review' && <ArrowRight size={16} />}
                            </Link>
                          )}
                       </div>
                    </div>
             ))
           )}
        </div>

      </div>
    </div>
  );
};

export default Messages;
