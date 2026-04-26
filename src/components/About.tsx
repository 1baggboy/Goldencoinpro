import React from "react";
import { Info } from "lucide-react";
import { LegalLayout } from "../pages/Legal";

export const About = () => (
  <LegalLayout title="About Goldencoin" icon={Info}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Our Mission
      </h2>
      <p>
        Goldencoin Limited is a leading digital asset management platform providing secure and transparent Bitcoin solutions. We believe in empowering individuals to take control of their financial future through innovative cryptocurrency tools.
      </p>
    </section>
    
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Corporate Structure
      </h2>
      <p>
        Goldencoin Limited is a registered company (Registration No. GC-77821-LTD) specializing in digital asset management and institutional-grade cryptocurrency infrastructure.
      </p>
    </section>

    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Leadership Team
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="h-40 bg-slate-900 rounded-xl flex items-center justify-center border border-[#C9A96E]/10">
            <span className="text-[#C9A96E] font-bold">M. Sterling</span>
          </div>
          <h3 className="font-bold text-slate-950 dark:text-white">Marcus Sterling</h3>
          <p className="text-xs text-[#C9A96E] uppercase font-bold tracking-wider">Chief Executive Officer</p>
          <p className="text-xs text-gray-500">Former Head of Digital Assets at a leading European investment bank.</p>
        </div>
        <div className="space-y-2">
          <div className="h-40 bg-slate-900 rounded-xl flex items-center justify-center border border-[#C9A96E]/10">
            <span className="text-[#C9A96E] font-bold">Dr. A. Chen</span>
          </div>
          <h3 className="font-bold text-slate-950 dark:text-white">Dr. Aris Chen</h3>
          <p className="text-xs text-[#C9A96E] uppercase font-bold tracking-wider">Chief Security Officer</p>
          <p className="text-xs text-gray-500">PhD in Cryptography with 15 years experience in financial systems security.</p>
        </div>
        <div className="space-y-2">
          <div className="h-40 bg-slate-900 rounded-xl flex items-center justify-center border border-[#C9A96E]/10">
            <span className="text-[#C9A96E] font-bold">L. Vane</span>
          </div>
          <h3 className="font-bold text-slate-950 dark:text-white">Lydia Vane</h3>
          <p className="text-xs text-[#C9A96E] uppercase font-bold tracking-wider">Head of Compliance</p>
          <p className="text-xs text-gray-500">Expert in international AML/KYC regulatory frameworks and fintech law.</p>
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Global Compliance
      </h2>
      <p className="text-sm">
        Goldencoin Limited maintains strict adherence to global regulatory standards. We are registered in compliance with international financial services regulations and undergo annual third-party security audits to ensure the integrity of our platform and the safety of client assets.
      </p>
      <div className="p-4 bg-[#C9A96E]/5 rounded-xl border border-[#C9A96E]/20 text-xs text-slate-600 dark:text-gray-400">
        <strong>Registered Office:</strong> 22 Bishopsgate, London EC2N 4BQ, United Kingdom. <br/>
        <strong>Registration No:</strong> GC-77821-LTD
      </div>
    </section>
  </LegalLayout>
);
