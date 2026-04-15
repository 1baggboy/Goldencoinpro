import React from "react";
import { Shield } from "lucide-react";
import { LegalLayout } from "./Legal";

export const Security = () => (
  <LegalLayout title="Security at Goldencoin" icon={Shield}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Military-Grade Security
      </h2>
      <p>
        Your assets are protected by multi-signature wallets and institutional-grade encryption protocols. We employ the highest standards of security to ensure your funds and personal information remain safe.
      </p>
    </section>
    
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Two-Factor Authentication (2FA)
      </h2>
      <p>
        We strongly encourage all users to enable Two-Factor Authentication. This adds an extra layer of security to your account, requiring a time-sensitive code from your mobile device in addition to your password.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Continuous Monitoring
      </h2>
      <p>
        Our security team monitors the platform 24/7 for suspicious activity. We utilize advanced threat detection systems to proactively identify and mitigate potential risks before they impact our users.
      </p>
    </section>
  </LegalLayout>
);
