import React from 'react';
import { ZoomIn, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface Winner {
  id: string;
  user_name: string;
  email: string;
  draw_date: string;
  prize_amount: number;
  status: string;
  proof_url?: string;
}

interface WinnersTabProps {
  winners: Winner[];
  onPreviewImage: (url: string) => void;
  onUpdateStatus: (id: string, status: 'paid' | 'rejected') => void;
}

const WinnersTab: React.FC<WinnersTabProps> = ({ winners, onPreviewImage, onUpdateStatus }) => {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div className="p-8 sm:p-12 border-b border-slate-100">
        <h3 className="text-2xl font-black text-dark uppercase tracking-tight mb-2">Winner Verification Desk</h3>
        <p className="text-slate-400 font-bold text-sm tracking-tight">Review official proof submissions and authorize prize payouts.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Winner Hero</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Draw Date</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Prize Amount</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Proof Evidence</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {winners.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-10 py-6">
                  <p className="text-sm font-black text-dark tracking-tight">{w.user_name}</p>
                  <p className="text-[10px] font-bold text-slate-400 lowercase leading-none">{w.email}</p>
                </td>
                <td className="px-10 py-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{new Date(w.draw_date).toLocaleDateString()}</p>
                </td>
                <td className="px-10 py-6">
                  <p className="text-sm font-black text-dark">£{w.prize_amount.toFixed(2)}</p>
                </td>
                <td className="px-10 py-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    w.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
                    w.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {w.status}
                  </span>
                </td>
                <td className="px-10 py-6">
                  {w.proof_url ? (
                    <button 
                      onClick={() => onPreviewImage(w.proof_url!)}
                      className="flex items-center gap-2 text-secondary hover:text-dark font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer group"
                    >
                      <ZoomIn size={14} className="group-hover:scale-110 transition-transform" /> View Proof
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Proof Uploaded</span>
                  )}
                </td>
                <td className="px-10 py-6 text-right">
                  {w.status === 'pending' && w.proof_url && (
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onUpdateStatus(w.id, 'paid')}
                        className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                        title="Verify & Pay"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(w.id, 'rejected')}
                        className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md shadow-red-500/10 cursor-pointer"
                        title="Reject Submission"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                  {w.status === 'paid' && (
                    <div className="flex items-center justify-end gap-2 text-emerald-500">
                      <Sparkles size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Authorized</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(WinnersTab);
