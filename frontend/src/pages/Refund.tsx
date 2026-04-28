import React from 'react';
import { Shield } from 'lucide-react';

const Refund: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 lg:px-16">
      <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-[3rem] shadow-xl border-2 border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-4xl font-black text-dark tracking-tighter">Refund Policy</h1>
        </div>
        
        <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
          <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">1. Subscription Refunds</h2>
          <p className="mb-6">
            We offer a 14-day money-back guarantee for all new subscriptions. If you are not satisfied with Talon within your first 14 days, you may request a full refund by contacting our support team.
          </p>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">2. Conditions for Refund</h2>
          <p className="mb-6">
            Refunds within the 14-day window will be processed provided that you have not claimed any draw winnings during this period. Once a prize is claimed, the subscription becomes non-refundable.
          </p>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">3. Renewals and Cancellations</h2>
          <p className="mb-6">
            Subscriptions automatically renew unless canceled. You may cancel your subscription at any time from your account settings. Cancellations apply to the next billing cycle. We do not offer prorated refunds for mid-cycle cancellations after the initial 14-day period.
          </p>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">4. Charity Contributions</h2>
          <p className="mb-6">
            Because the charitable contribution portion of your subscription is distributed to the selected charity organizations on a monthly rolling basis, that specific portion of the fee cannot be refunded once it has been processed and disbursed to the charity.
          </p>

          <h2 className="text-2xl font-black text-dark mt-10 mb-4 tracking-tight">5. How to Request a Refund</h2>
          <p className="mb-6">
            To request a refund, please email our billing team with your account details and receipt. Refunds are processed back to the original payment method through our processor, Paddle, and may take 5-10 business days to appear on your statement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Refund;
