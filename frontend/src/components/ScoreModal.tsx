import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, Hash, Calendar, Loader2, Check } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  scoreVal: string;
  dateVal: string;
  setScoreVal: (val: string) => void;
  setDateVal: (val: string) => void;
  errorMsg: string;
  setErrorMsg: (val: string) => void;
  actionLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen, onClose, mode, scoreVal, dateVal, setScoreVal, setDateVal, errorMsg, setErrorMsg, actionLoading, onSubmit
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] w-screen h-screen grid place-items-center p-4 md:p-8 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/60 backdrop-blur-md w-full h-full animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <div className="bg-white w-full max-w-[420px] rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden z-[10000]">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                {mode === 'add' ? 'New Record' : 'Refine Record'}
              </p>
              <h3 className="text-2xl font-black text-dark uppercase tracking-tight">
                {mode === 'add' ? 'Add Score' : 'Edit Score'}
              </h3>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:text-dark transition-all cursor-pointer flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle size={16} />
              <p className="text-[10px] font-black uppercase tracking-widest">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Stableford Points
              </label>
              <div className="relative">
                <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="number" value={scoreVal} 
                  onChange={e => { setScoreVal(e.target.value); setErrorMsg(''); }}
                  placeholder="1 - 45"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-lg font-black focus:outline-none focus:border-secondary transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Round Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="date" value={dateVal} 
                  onChange={e => { setDateVal(e.target.value); setErrorMsg(''); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-black focus:outline-none focus:border-secondary transition-all uppercase"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={actionLoading}
              className="w-full bg-dark text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.15em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 mt-2 shadow-lg shadow-dark/10"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={4} />}
              {mode === 'add' ? 'Save Score' : 'Update Score'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ScoreModal;
