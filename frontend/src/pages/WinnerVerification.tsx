import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Upload, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { useAuthStore } from '../store/useAuthStore';
import { CONFIG } from '../config';

const WinnerVerification: React.FC = () => {
  const { winnerId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchWinner = async () => {
      try {
        const res = await axios.get(`${CONFIG.BACKEND_URL}/api/winners/${winnerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWinnerData(res.data.winner);
      } catch (err) {
        console.error('Failed to fetch winner data');
      } finally {
        setLoading(false);
      }
    };
    fetchWinner();
  }, [winnerId, token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setSubmitting(true);
    try {
      // 1. Compress image to max 1.5MB like Instagram
      const options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // 2. Convert to Base64
      const base64Image = await fileToBase64(compressedFile);

      // 3. Send to backend for secure Supabase Storage upload
      await axios.post(`${CONFIG.BACKEND_URL}/api/winners/${winnerId}/verify`, {
        proof_image: base64Image 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/messages'), 3000);
    } catch (err) {
      console.error(err);
      alert('Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-secondary animate-spin" />
    </div>
  );

  if (!winnerData) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
       <div className="text-center max-w-sm bg-white border border-slate-200 shadow-sm p-12 rounded-[3rem]">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-dark uppercase mb-4">Invalid Claim</h2>
          <p className="text-slate-500 font-bold text-sm mb-8">This verification link is invalid or has expired.</p>
          <button onClick={() => navigate('/messages')} className="w-full py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all rounded-2xl font-black uppercase text-xs">Return to Inbox</button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        <button onClick={() => navigate('/messages')} className="flex items-center gap-2 text-slate-400 hover:text-dark transition-colors mb-8 sm:mb-12 font-black uppercase text-[10px] tracking-widest cursor-pointer">
           <ArrowLeft size={14} /> Back to Inbox
        </button>

        {success ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500">
             <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-green-500 mx-auto mb-8 shadow-sm">
                <CheckCircle2 size={32} className="sm:w-10 sm:h-10" />
             </div>
             <h2 className="text-2xl sm:text-3xl font-black text-dark uppercase tracking-tighter mb-4">Verification Submitted</h2>
             <p className="text-slate-500 font-bold text-sm mb-8">Our administrators will review your proof within 24 hours. You'll be notified in your inbox once the payout is approved.</p>
             <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-full animate-progress" />
             </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 shadow-sm rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-[0.03] pointer-events-none">
                <ShieldCheck size={160} className="text-dark sm:w-[200px] sm:h-[200px]" />
             </div>

             <header className="relative z-10 mb-8 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl font-black text-dark uppercase tracking-tighter mb-2">Verify Your Win</h1>
                <p className="text-slate-500 font-bold text-xs sm:text-sm">Prize: <span className="text-secondary">{winnerData.prize_tier} (£{winnerData.amount})</span></p>
             </header>

             <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10 relative z-10">
                <h4 className="text-[10px] font-black uppercase text-secondary tracking-widest mb-4">Submission Requirements</h4>
                <ul className="space-y-3">
                   {[
                     'Screenshot from a recognized platform (e.g. Hole19)',
                     'Clearly show your name and the date',
                     'Scores must match your Talon entry (1–45)',
                     'Image must be clear and unedited'
                   ].map((text, i) => (
                     <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600">
                        <CheckCircle2 size={14} className="text-secondary shrink-0 mt-0.5" />
                        {text}
                     </li>
                   ))}
                </ul>
             </div>

             <form onSubmit={handleSubmit} className="relative z-10">
                <div className="mb-8 sm:mb-10">
                   <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Proof of Play (Screenshot)</label>
                   <div className={`relative h-56 sm:h-64 rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all ${preview ? 'border-secondary bg-secondary/5' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        required
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 sm:p-6">
                         {preview ? (
                           <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-xl" />
                         ) : (
                           <>
                              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 mb-4" />
                              <p className="text-xs sm:text-sm font-bold text-slate-500">Click to upload or drag & drop</p>
                              <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 mt-2">PNG, JPG up to 10MB</p>
                           </>
                         )}
                      </div>
                   </div>
                </div>

                <button 
                  disabled={!file || submitting}
                  className="w-full py-5 sm:py-6 bg-dark text-white rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-dark/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                       <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </span>
                  ) : 'Submit Verification'}
                </button>
             </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default WinnerVerification;
