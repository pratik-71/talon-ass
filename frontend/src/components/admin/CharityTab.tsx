import React from 'react';
import { Plus, Heart } from 'lucide-react';

interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  is_active: boolean;
}

interface CharityTabProps {
  charities: Charity[];
  onAddCharity: () => void;
  onEditCharity: (charity: Charity) => void;
  onDeleteCharity: (id: string) => void;
}

const CharityTab: React.FC<CharityTabProps> = ({ charities, onAddCharity, onEditCharity, onDeleteCharity }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-dark uppercase tracking-tighter">Charities</h3>
          <p className="text-slate-400 font-bold text-sm tracking-tight">Managing global partner relationships and contributions.</p>
        </div>
        <button 
          onClick={onAddCharity}
          className="px-8 py-5 bg-secondary text-dark rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-secondary/20 flex items-center gap-3 cursor-pointer"
        >
          <Plus size={18} strokeWidth={4} /> Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {charities.map((c) => (
          <div key={c.id} className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 group flex flex-col relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-2 h-full ${c.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-secondary mb-8 overflow-hidden group-hover:scale-105 transition-transform">
              {c.logo_url ? <img src={c.logo_url} className="w-full h-full object-cover" /> : <Heart size={32} />}
            </div>
            <h4 className="text-xl font-black text-dark uppercase tracking-tight mb-4">{c.name}</h4>
            <p className="text-slate-400 font-bold text-xs mb-8 flex-1 leading-relaxed line-clamp-3">{c.description}</p>
            <div className="flex gap-2 pt-8 border-t border-slate-50">
              <button onClick={() => onEditCharity(c)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all cursor-pointer">Edit</button>
              <button onClick={() => onDeleteCharity(c.id)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all cursor-pointer">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(CharityTab);
