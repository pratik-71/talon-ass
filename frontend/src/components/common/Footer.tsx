import React from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Mail, ShieldCheck, MessageCircle } from 'lucide-react'

const Twitter = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const Github = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white pt-20 sm:pt-24 pb-12 border-t border-white/5 px-4 sm:px-6 lg:px-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 sm:gap-16 md:gap-8">
          <div className="col-span-1 sm:col-span-2">
            <div className="text-xl sm:text-2xl font-black tracking-tighter mb-6 sm:mb-8 flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-dark" strokeWidth={3} />
              </div>
              TALON<span className="text-secondary">.</span>
            </div>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed mb-8">
              A modern performance engine combining golf performance tracking with global social impact. Deliberately modern, emotionally driven.
            </p>
            <div className="flex items-center gap-4">
               {[
                 { icon: Twitter, link: '#' },
                 { icon: Github, link: '#' },
                 { icon: MessageCircle, label: 'Discord', link: '#' }
               ].map((social, i) => (
                 <a key={i} href={social.link} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-white/10 transition-all">
                   <social.icon className="w-5 h-5" />
                 </a>
               ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-black mb-6 sm:mb-8 uppercase tracking-[0.2em] text-[10px] text-slate-500">The Platform</h4>
            <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-bold text-slate-300">
              <li><a href="#" className="hover:text-secondary transition-colors">Concept</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Charities</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Draw Results</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Prize Pool</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black mb-6 sm:mb-8 uppercase tracking-[0.2em] text-[10px] text-slate-500">Legal</h4>
            <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-bold text-slate-300">
              <li><Link to="/terms-and-conditions" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-secondary transition-colors">Refund Policy</Link></li>
              <li className="flex items-center gap-2 text-slate-500 hover:text-secondary transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4" />
                Paddle Compliance
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-20 sm:mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="text-slate-500 font-bold uppercase tracking-widest text-[8px] sm:text-[9px]">
            © {new Date().getFullYear()} Talon Performance · Issued for Selection Process Only
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
             <Link to="/terms-and-conditions" className="text-slate-400 hover:text-secondary transition-colors text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
               Terms
             </Link>
             <Link to="/privacy" className="text-slate-400 hover:text-secondary transition-colors text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
               Privacy
             </Link>
             <Link to="/refund" className="text-slate-400 hover:text-secondary transition-colors text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
               Refunds
             </Link>
             <a href="mailto:support@digitalheroes.co.in" className="flex items-center gap-2 text-slate-400 hover:text-secondary transition-colors text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                <Mail className="w-3.5 h-3.5" />
                Contact
             </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
