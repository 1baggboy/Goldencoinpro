import React from "react";
import { Shield } from "lucide-react";
import { LegalLayout } from "./Legal";

export const Security = () => (
  <LegalLayout title="Security at Goldencoin" icon={Shield}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Institutional-Grade Asset Protection
      </h2>
      <p>
        Your digital assets are secured using enterprise-grade encryption and multi-signature (Multi-Sig) logic. 100% of client treasury funds are stored in air-gapped cold storage facilities, ensuring they are disconnected from the network and protected from unauthorized access.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Security Audits & Compliance
      </h2>
      <p>
        Goldencoin Limited adheres to ISO 27001 compliant security management procedures. We conduct regular external security audits and stress tests on our infrastructure to maintain the highest levels of platform integrity and resilience against emerging cyber threats.
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
