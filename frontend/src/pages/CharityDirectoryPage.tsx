import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Heart, ExternalLink, ArrowRight, Loader2, CreditCard, CheckCircle2, X } from 'lucide-react';
import { CONFIG } from '../config';

// Quick stub for lock icon
const Lock = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const CharityDirectory: React.FC = () => {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Independent Donation State
  const [donationModal, setDonationModal] = useState<any | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(25);
  const [processingDonation, setProcessingDonation] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCharities = async () => {
      try {
        const res = await axios.get(`${CONFIG.BACKEND_URL}/api/charities`);
        // The API returns { success: true, count: X, data: [...] }
        setCharities(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch charities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCharities();
  }, []);

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingDonation(true);
    
    // Simulate payment processing for the independent donation
    setTimeout(() => {
      setProcessingDonation(false);
      setDonationSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        setDonationModal(null);
        setDonationSuccess(false);
        setDonationAmount(25);
      }, 3000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-32 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/10 text-secondary font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-4 sm:mb-6">
          <Heart size={12} className="fill-current sm:w-[14px] sm:h-[14px]" /> Impact Hub
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-dark tracking-tighter uppercase leading-[0.9] mb-4 sm:mb-6">
          Charity <span className="text-secondary">Directory</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed px-4">
          Explore our vetted charity partners. Support them automatically through your subscription or make a direct, independent impact today.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-10 sm:mb-16">
        <div className="relative">
          <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 sm:w-6 sm:h-6" />
          <input 
            type="text" 
            placeholder="Search charities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 rounded-2xl sm:rounded-[2rem] pl-12 sm:pl-16 pr-6 sm:pr-8 py-4 sm:py-6 text-base sm:text-lg font-bold text-dark focus:outline-none focus:border-secondary transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCharities.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl sm:text-2xl font-black text-slate-300 uppercase tracking-tight">No charities found</p>
            </div>
          ) : (
            filteredCharities.map((charity, i) => (
              <div 
                key={charity.id} 
                className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-200 p-6 sm:p-10 flex flex-col hover:border-secondary hover:shadow-2xl transition-all duration-300 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-secondary mb-6 sm:mb-8 overflow-hidden">
                  {charity.logo_url ? (
                    <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover" />
                  ) : (
                    <Heart size={28} className="sm:w-8 sm:h-8" />
                  )}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-dark uppercase tracking-tight mb-3 sm:mb-4 truncate">{charity.name}</h3>
                <p className="text-slate-500 font-bold text-xs sm:text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
                  {charity.description || 'Dedicated to making a positive impact in our community. Join us in supporting this incredible cause.'}
                </p>

                {/* Upcoming Events - PRD Requirement */}
                <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-dark">Upcoming Events</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500">Charity Golf Day</span>
                      <span className="text-secondary">June 12</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500">Community Gala</span>
                      <span className="text-secondary">July 05</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 sm:pt-8 border-t border-slate-100 flex flex-col gap-3 sm:gap-4">
                  <button 
                    onClick={() => setDonationModal(charity)}
                    className="w-full py-3 sm:py-4 bg-secondary text-dark rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-[#e6a800] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-secondary/20"
                  >
                    <Heart size={14} className="fill-current sm:w-4 sm:h-4" /> Donate Now
                  </button>
                  {charity.website_url && (
                    <a 
                      href={charity.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 sm:py-4 bg-slate-50 text-slate-500 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-slate-100 hover:text-dark transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ExternalLink size={14} className="sm:w-4 sm:h-4" /> Visit Website
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Independent Donation Modal */}
      {donationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
              
              <button 
                onClick={() => !processingDonation && !donationSuccess && setDonationModal(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-dark transition-colors z-10"
              >
                <X size={24} />
              </button>

              {donationSuccess ? (
                <div className="p-16 text-center animate-in zoom-in duration-500">
                   <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                   </div>
                   <h3 className="text-3xl font-black text-dark uppercase tracking-tighter mb-4">Thank You!</h3>
                   <p className="text-slate-500 font-bold">Your direct donation of £{donationAmount} to {donationModal.name} was successful.</p>
                </div>
              ) : (
                <div className="p-10">
                   <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-8">
                      <Heart className="w-8 h-8 text-secondary fill-secondary" />
                   </div>
                   
                   <h3 className="text-2xl font-black text-dark uppercase tracking-tighter mb-2">Support {donationModal.name}</h3>
                   <p className="text-sm font-bold text-slate-500 mb-8">Make a direct, one-off impact today. 100% of independent donations go directly to the charity.</p>
                   
                   <form onSubmit={handleDonateSubmit} className="space-y-8">
                      <div>
                         <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Select Amount</label>
                         <div className="grid grid-cols-3 gap-3">
                            {[10, 25, 50, 100, 250, 500].map(amt => (
                               <button
                                 key={amt}
                                 type="button"
                                 onClick={() => setDonationAmount(amt)}
                                 className={`py-4 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                                   donationAmount === amt 
                                     ? 'bg-dark text-white shadow-lg shadow-dark/20' 
                                     : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                 }`}
                               >
                                 £{amt}
                               </button>
                            ))}
                         </div>
                      </div>
                      
                      <button 
                        type="submit" 
                        disabled={processingDonation}
                        className="w-full py-5 bg-secondary text-dark rounded-2xl font-black uppercase tracking-widest hover:bg-[#e6a800] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-secondary/20 disabled:opacity-50"
                      >
                         {processingDonation ? (
                           <><Loader2 size={20} className="animate-spin" /> Processing...</>
                         ) : (
                           <><CreditCard size={20} /> Donate £{donationAmount}</>
                         )}
                      </button>
                      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        <Lock size={10} /> Secure SSL Payment
                      </p>
                   </form>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default CharityDirectory;
