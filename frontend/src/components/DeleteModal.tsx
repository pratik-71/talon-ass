import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionLoading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, actionLoading }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] w-screen h-screen grid place-items-center p-4 md:p-8 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/60 backdrop-blur-md w-full h-full animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 z-[10000]">
        <div className="p-8 md:p-10 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <Trash2 size={32} />
          </div>
          <h3 className="text-2xl font-black text-dark uppercase tracking-tight mb-2">Delete Record?</h3>
          <p className="text-slate-500 font-bold text-sm mb-10 px-4 leading-relaxed">
            This action is permanent and cannot be reversed by a hero.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm} disabled={actionLoading}
              className="w-full bg-red-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {actionLoading ? 'Deleting...' : 'Yes, Delete It'}
            </button>
            <button 
              onClick={onClose}
              className="w-full py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-dark transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteModal;
