import React from 'react';
import { Play, Sparkles, Loader2, History, FileCheck, ExternalLink } from 'lucide-react';

interface DrawsTabProps {
  drawLogic: 'random' | 'algorithmic';
  setDrawLogic: (logic: 'random' | 'algorithmic') => void;
  executingDraw: boolean;
  onExecuteDraw: () => void;
  lastDrawResult: any;
  drawHistory: any[];
  onViewWinner: (winnerId: string) => void;
}

const DrawsTab: React.FC<DrawsTabProps> = ({ 
  drawLogic, setDrawLogic, 
  executingDraw, onExecuteDraw, lastDrawResult, drawHistory, onViewWinner 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6 sm:space-y-10">
        <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Play size={120} />
          </div>
          <h3 className="text-2xl font-black text-dark uppercase tracking-tighter mb-2">Draw Control Center</h3>
          <p className="text-slate-500 font-bold text-sm mb-10">Initialize the automated selection engine for the current month.</p>
          
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Selection Algorithm</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDrawLogic('random')}
                  className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                    drawLogic === 'random' ? 'bg-dark text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  Pure Random
                </button>
                <button 
                  onClick={() => setDrawLogic('algorithmic')}
                  className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                    drawLogic === 'algorithmic' ? 'bg-dark text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  Weighted Pro
                </button>
              </div>
            </div>

            <button 
              onClick={onExecuteDraw}
              disabled={executingDraw}
              className="w-full py-6 bg-secondary text-dark rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              {executingDraw ? (
                <><Loader2 className="animate-spin" /> Sequencing...</>
              ) : (
                <><Sparkles size={20} /> Execute Official Draw</>
              )}
            </button>
          </div>
        </div>

        {lastDrawResult && (
          <div className="bg-emerald-500 p-8 sm:p-10 rounded-[3rem] text-white animate-in zoom-in-95 duration-500 shadow-xl shadow-emerald-500/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Official Selection Result</p>
                <h4 className="text-3xl font-black tracking-tighter uppercase">{lastDrawResult.winner_name}</h4>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Prize Awarded</p>
                <p className="text-xl font-black">£{(lastDrawResult.jackpot_amount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Support Contribution</p>
                <p className="text-xl font-black">£{(lastDrawResult.charity_contribution || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-dark uppercase tracking-tight">Sequence History</h3>
          <History size={20} className="text-slate-300" />
        </div>
        <div className="space-y-4">
          {drawHistory.map((h) => (
            <div key={h.id} className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-emerald-500">
                  <FileCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-dark uppercase tracking-tight">{h.winner_name || 'Official Winner'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">£{(h.jackpot_amount || 0).toFixed(2)} · {new Date(h.draw_date).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => onViewWinner(h.winner_id)}
                className="p-3 bg-white text-slate-400 hover:text-dark rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          ))}
          {drawHistory.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">No historical sequences recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Re-import Trophy since it was used but not defined in props types
import { Trophy } from 'lucide-react';

export default React.memo(DrawsTab);
