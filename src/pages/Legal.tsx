import React from "react";
import { Shield, Lock, Eye, FileText, Scale, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

const LegalLayout = ({ title, icon: Icon, children }: any) => (
  <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-950 dark:text-white font-sans selection:bg-[#C9A96E] selection:text-slate-950 transition-colors duration-300">
    <nav className="h-20 border-b border-[#C9A96E]/10 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
      <Link to="/" className="flex items-center gap-3">
        <img src="/Goldencoinpro (1).webp" alt="GOLDENCOIN" className="h-10 w-auto" referrerPolicy="no-referrer" />
      </Link>
      <Link to="/" className="text-sm font-semibold hover:text-[#C9A96E] transition-colors flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Home
      </Link>
    </nav>

    <div className="max-w-4xl mx-auto py-20 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-[#C9A96E]/10 rounded-3xl flex items-center justify-center text-[#C9A96E] border border-[#C9A96E]/20">
            <Icon size={40} />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{title}</h1>
            <p className="text-slate-500 mt-2">Last updated: March 30, 2026</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert prose-gold max-w-none space-y-12 text-slate-600 dark:text-gray-400 leading-relaxed">
          {children}
        </div>
      </motion.div>
    </div>

    <footer className="py-20 px-6 border-t border-[#C9A96E]/10 text-center text-xs text-slate-500">
      <p>© 2026 Goldencoin Limited. All rights reserved.</p>
    </footer>
  </div>
);

export const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" icon={Eye}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        1. Information We Collect
      </h2>
      <p>
        At Goldencoin Limited, we collect personal information necessary to provide our services, including your name, email address, government-issued identification for KYC purposes, and transaction history. We also collect technical data such as IP addresses and browser information to ensure the security of our platform.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        2. How We Use Your Information
      </h2>
      <p>
        Your information is used to verify your identity, process transactions, provide customer support, and comply with legal and regulatory requirements. We may also use your data to send you important updates about your account or our services.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        3. Data Security
      </h2>
      <p>
        We implement industry-standard security measures, including 256-bit encryption and multi-signature cold storage, to protect your personal data and digital assets. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        4. Third-Party Sharing
      </h2>
      <p>
        We do not sell your personal information to third parties. We may share data with trusted service providers who assist us in operating our platform, conducting our business, or servicing you, provided those parties agree to keep this information confidential.
      </p>
    </section>
  </LegalLayout>
);

export const TermsOfService = () => (
  <LegalLayout title="Terms of Service" icon={FileText}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        1. Acceptance of Terms
      </h2>
      <p>
        By accessing or using the Goldencoin Limited platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        2. Eligibility
      </h2>
      <p>
        You must be at least 18 years old and have the legal capacity to enter into a binding agreement to use our services. You are responsible for ensuring that your use of our platform complies with the laws of your jurisdiction.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        3. Account Security
      </h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        4. Prohibited Activities
      </h2>
      <p>
        Users are prohibited from using the platform for any illegal activities, including money laundering, fraud, or financing of terrorism. We reserve the right to suspend or terminate accounts suspected of engaging in prohibited activities.
      </p>
    </section>
  </LegalLayout>
);

export const RiskDisclaimer = () => (
  <LegalLayout title="Risk Disclaimer" icon={AlertTriangle}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        1. Market Volatility
      </h2>
      <p>
        The value of digital assets, including Bitcoin, is extremely volatile and can fluctuate significantly in a short period. Investing in cryptocurrencies carries a high level of risk, and you may lose some or all of your invested capital.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        2. No Financial Advice
      </h2>
      <p>
        Goldencoin Limited provides tools and information for digital asset management but does not provide financial, investment, or legal advice. All investment decisions are made solely by the user.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        3. Past Performance
      </h2>
      <p>
        Past performance of any investment plan or strategy is not indicative of future results. Goldencoin Limited does not guarantee any specific returns or profits from its investment cycles.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        4. Regulatory Risk
      </h2>
      <p>
        The regulatory environment for digital assets is evolving. Changes in laws or regulations may impact the operation of our platform or the value of your assets.
      </p>
    </section>
  </LegalLayout>
);
