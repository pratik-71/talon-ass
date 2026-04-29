import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Trophy, ArrowRight, Loader2, Bell } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';

const Messages: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { token, user } = useAuthStore();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetch winners specifically for this user
        const res = await axios.get(`${CONFIG.BACKEND_URL}/api/winners/my-winnings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter for pending verifications
        const pending = res.data.winners.filter((w: any) => w.payment_status === 'pending');
        setNotifications(pending);
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
               <div key={n.id} className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:border-secondary hover:shadow-lg transition-all shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-dark flex-shrink-0 shadow-lg shadow-secondary/20">
                           <Trophy size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-dark uppercase tracking-tight mb-2">Congratulations! You've Won!</h3>
                           <p className="text-slate-600 font-bold text-sm mb-4">
                             You have been selected as a winner for the <span className="text-secondary">{n.prize_tier}</span> prize tier. 
                             To claim your <span className="text-dark font-black">£{n.amount}</span>, please verify your scores.
                           </p>
                           <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-500">
                              System Notification • {new Date(n.created_at).toLocaleDateString()}
                           </div>
                        </div>
                     </div>
                     <Link 
                       to={`/verify-winner/${n.id}`}
                       className="flex items-center justify-center gap-3 px-8 py-4 bg-dark text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-dark/20 group-hover:-translate-y-1"
                     >
                       Verify Now <ArrowRight size={16} />
                     </Link>
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
