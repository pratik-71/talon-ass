import React from 'react';
import { Search, BarChart3, Wallet, Trash2 } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  status: string;
  subscription_status?: string;
  plan_type?: string;
  charity_name?: string;
  charity_percentage?: number;
}

interface UsersTabProps {
  users: User[];
  onManageScores: (user: { id: string, name: string }) => void;
  onToggleSubscription: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, onManageScores, onToggleSubscription, onDeleteUser }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-black text-dark uppercase tracking-tight">Hero Registry</h3>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input type="text" placeholder="Search by name or email..." className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 ring-secondary/20 transition-all" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Hero Details</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Subscription</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Impact Partner</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                      {u.full_name?.split(' ').map((n: any) => n[0]).join('') || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-dark tracking-tight">{u.full_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 lowercase leading-none">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {u.status}
                  </span>
                </td>
                <td className="px-10 py-6">
                  <p className="text-xs font-black text-dark uppercase tracking-tight">{u.subscription_status || 'Free'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.plan_type || 'No Plan'}</p>
                </td>
                <td className="px-10 py-6">
                  <p className="text-xs font-black text-dark uppercase tracking-tight">{u.charity_name || 'Global Fund'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.charity_percentage || 0}% Share</p>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onManageScores({ id: u.id, name: u.full_name })}
                      title="Manage Scores"
                      className="p-2.5 text-slate-400 hover:text-secondary hover:bg-white rounded-xl transition-all shadow-sm shadow-transparent hover:shadow-slate-200 cursor-pointer"
                    >
                      <BarChart3 size={16} />
                    </button>
                    <button 
                      onClick={() => onToggleSubscription(u)}
                      title="Toggle Access"
                      className="p-2.5 text-slate-400 hover:text-secondary hover:bg-white rounded-xl transition-all shadow-sm shadow-transparent hover:shadow-slate-200 cursor-pointer"
                    >
                      <Wallet size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteUser(u.id)}
                      title="Purge User"
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm shadow-transparent hover:shadow-slate-200 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(UsersTab);
