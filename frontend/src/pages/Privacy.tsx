import React from 'react';
import { Shield } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-16">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 md:p-16 rounded-[2rem] sm:rounded-[3rem] shadow-xl border-2 border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tighter">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
          <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">1. Information We Collect</h2>
          <p className="mb-6">
            We collect information you provide directly to us when creating an account, including your name, email address, and golf performance data (Stableford scores). Payment information is securely handled by our PCI-compliant payment processor, Paddle, and is not stored directly on our servers.
          </p>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">2. How We Use Your Information</h2>
          <p className="mb-6">
            Your golf scores are used strictly to calculate your eligibility and standing in our monthly draw system. Your email is used for essential account notifications, including draw results, subscription renewals, and verification requests.
          </p>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">3. Data Sharing</h2>
          <p className="mb-6">
            We do not sell your personal data. We only share necessary information with trusted third parties to provide our services, such as:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Paddle:</strong> For secure payment processing and subscription management.</li>
            <li><strong>Charity Partners:</strong> Anonymized data regarding donation volumes may be shared with our charity partners.</li>
          </ul>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">4. Data Security</h2>
          <p className="mb-6">
            We implement industry-standard security measures, including HTTPS encryption and secure session management, to protect your data from unauthorized access. Proof of score images uploaded for winner verification are stored securely and deleted after validation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
