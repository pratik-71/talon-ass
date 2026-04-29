import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
}

interface AnalyticsTabProps {
  stats: Stat[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ stats }) => {
  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-dark transition-all">
                <s.icon size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{s.trend}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <h3 className="text-2xl sm:text-3xl font-black text-dark tracking-tighter">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark p-8 sm:p-10 rounded-[2.5rem] text-white overflow-hidden relative group">
          <div className="relative z-10">
            <h4 className="text-xl font-black uppercase tracking-tight mb-2">Growth Projection</h4>
            <p className="text-slate-500 font-bold text-sm mb-8">Subscriber acquisition velocity (24h Window)</p>
            <div className="flex items-end gap-2 h-32 sm:h-48">
              {[40, 70, 45, 90, 65, 80, 100, 55, 75, 40, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-secondary/20 rounded-t-lg group-hover:bg-secondary transition-all duration-500" style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 flex flex-col">
          <h4 className="text-xl font-black text-dark uppercase tracking-tight mb-8">Charity Mix</h4>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {[
              { label: 'Youth Sport', value: 45, color: 'bg-emerald-500' },
              { label: 'Medical Research', value: 30, color: 'bg-secondary' },
              { label: 'Environment', value: 25, color: 'bg-dark' }
            ].map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                  <span>{c.label}</span>
                  <span>{c.value}%</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color}`} style={{ width: `${c.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AnalyticsTab);
