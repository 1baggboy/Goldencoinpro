import React from "react";
import { Zap } from "lucide-react";
import { LegalLayout } from "./Legal";

export const Features = () => (
  <LegalLayout title="Platform Features" icon={Zap}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Streamlined Asset Settlement
      </h2>
      <p>
        Experience efficient transaction handling. Our systemized monitoring ensures your BTC deposits are recognized after industry-standard network confirmations, with withdrawal requests processed through secondary security reviews.
      </p>
    </section>
    
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Advanced Analytics
      </h2>
      <p>
        Track your portfolio performance with real-time charts, detailed transaction history, and comprehensive reporting tools designed to give you deep insights into your investments.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Referral Program
      </h2>
      <p>
        Invite your friends and family to join Goldencoin. When they sign up and make their first deposit, you'll receive a cash bonus credited directly to your account.
      </p>
    </section>
  </LegalLayout>
);
