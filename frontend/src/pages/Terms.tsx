import React from 'react';
import { Shield } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 lg:px-16">
      <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-[3rem] shadow-xl border-2 border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-4xl font-black text-dark tracking-tighter">Terms of Service</h1>
        </div>
        
        <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
          <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">1. Acceptance of Terms</h2>
          <p className="mb-6">
            By accessing and using the Talon platform ("we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">2. Subscription and Billing</h2>
          <p className="mb-6">
            Talon requires an active premium subscription to access core features, including score tracking and monthly draws. Subscriptions auto-renew automatically based on your chosen billing cycle (monthly or yearly). Payments are processed securely via our payment partner, Paddle.
          </p>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">3. Score Entry and Draws</h2>
          <p className="mb-6">
            Users must submit authentic Stableford scores (1-45). Only your last 5 scores are retained. Talon reserves the right to request proof (e.g., screenshots from official golf platforms) for any winning draw entries. Fraudulent entries will result in immediate account termination.
          </p>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">4. Charity Contributions</h2>
          <p className="mb-6">
            A minimum of 10% of your subscription fee is allocated to your selected charity. Talon facilitates these transfers but is not directly affiliated with the listed charities. Users cannot claim tax deductions for this portion as it is processed as part of the service fee.
          </p>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">5. Account Termination</h2>
          <p className="mb-6">
            We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent score reporting, or misuse the platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
