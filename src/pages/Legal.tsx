import React from "react";
import { Shield, Lock, Eye, FileText, Scale, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Logo } from "../components/Logo";
import { Footer } from "../components/Footer";

export const LegalLayout = ({ title, icon: Icon, children }: any) => (
  <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-950 dark:text-white font-sans selection:bg-[#C9A96E] selection:text-slate-950 transition-colors duration-300">
    <nav className="h-20 border-b border-[#C9A96E]/10 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
      <div className="flex items-center gap-3">
        <Logo size="md" />
      </div>
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

    <Footer />
  </div>
);

export const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" icon={Eye}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        1. General Provisions and Introduction
      </h2>
      <p>
        At Goldencoin Limited, we place the highest priority on the privacy and security of our users and their data. This comprehensive Privacy Policy defines how we collect, use, store, share, and protect your personal data when you interact with our platform, website, applications, and any suite of services ("Services"). By accessing or using our Services, you explicitly consent to the data practices described in this policy. If you do not agree with any terms within this policy, you must cease using our Services immediately.
      </p>
      <p>
        This policy applies globally, covering all users irrespective of their geographical location, and aims to comply with stringent data protection regulations including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        2. Information We Collect
      </h2>
      <p>
        To provide an optimal and legally compliant financial service, we are mandated to collect various categories of information:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Identity Data:</strong> Full legal name, date of birth, nationality, gender, and government-issued identification documents (e.g., passports, driver's licenses, national ID cards) for Anti-Money Laundering (AML) and Know Your Customer (KYC) verification.</li>
        <li><strong>Contact Data:</strong> Primary and operational email addresses, telephone numbers, and residential or business addresses.</li>
        <li><strong>Financial Data:</strong> Bank account details, cryptocurrency wallet addresses, primary sources of wealth, transaction histories, and asset balances held on our platform.</li>
        <li><strong>Technical Data:</strong> Internet Protocol (IP) addresses, browser type and version, time zone settings, geographic location data, operating systems, and platform access logs.</li>
        <li><strong>Usage Data:</strong> Information detailing how you interact with our platform, including page response times, navigation paths, and platform interaction metrics.</li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        3. Legal Basis and How We Use Your Information
      </h2>
      <p>
        We do not collect data arbitrarily. Every piece of information collected has a specific regulatory or operational purpose. We process your personal data under the following legal bases:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Performance of a Contract:</strong> To register you as a new user, process your deposits and withdrawals, and execute transactions on your behalf as an active asset manager.</li>
        <li><strong>Legal and Regulatory Obligations:</strong> To comply with overarching financial laws, perform identity checks to combat fraud, money laundering, and terrorist financing. We are obligated to retain this data for statutory periods.</li>
        <li><strong>Legitimate Business Interests:</strong> To manage risk governance, enhance platform security, provide customer support, and improve the user experience.</li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        4. Data Security and Enterprise Protection
      </h2>
      <p>
        Goldencoin Limited employs institutional-grade security architectures to prevent unauthorized access, disclosure, or destruction of your personal data. Our methodologies include:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>End-to-end 256-bit encryption for all data in transit and at rest.</li>
        <li>Mandatory Multi-Factor Authentication (MFA) for user access and internal operational access.</li>
        <li>Multi-signature cold storage infrastructure for the vast majority of digital assets, ensuring they are air-gapped from internet-facing services.</li>
        <li>Continuous real-time threat monitoring and penetration testing by accredited third-party security firms.</li>
      </ul>
      <p>
        Despite our rigorous protections, no internet-based platform is impervious. Users must share in the responsibility of security by maintaining the strict confidentiality of their account credentials and enabling Two-Factor Authentication (2FA).
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        5. Data Sharing and Third-Party Disclosures
      </h2>
      <p>
        We strictly prohibit the sale of your personal information. However, to operate legally and efficiently, we may securely share your data with:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Regulatory Bodies and Law Enforcement:</strong> When legally compelled by subpoenas, court orders, or compliance requests from financial regulatory authorities globally.</li>
        <li><strong>Service Providers:</strong> Audited third-party vendors performing KYC verifications, anti-fraud checks, cloud hosting, and robust customer support infrastructures under strict Non-Disclosure Agreements (NDAs).</li>
        <li><strong>Corporate Restructuring:</strong> In the event of a merger, acquisition, or asset sale, your data may be transferred, provided the acquiring entity commits to maintaining equivalent privacy standards.</li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        6. User Rights and Control
      </h2>
      <p>
        Under applicable data protection laws, you retain extensive rights over your personal information:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Right to Access:</strong> You may request copies of your personal data held by us.</li>
        <li><strong>Right to Rectification:</strong> You may request corrections to any inaccurate or incomplete personal data.</li>
        <li><strong>Right to Erasure (Right to be Forgotten):</strong> Subject to overriding legal and regulatory data retention obligations, you may request the deletion of your account and associated data. Note that financial transaction records must typically be kept for several years to comply with AML laws.</li>
        <li><strong>Right to Restrict Processing:</strong> You may request a temporary halt to processing your data under specific conditions.</li>
      </ul>
    </section>
  </LegalLayout>
);

export const TermsOfService = () => (
  <LegalLayout title="Terms of Service" icon={FileText}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        1. Acceptance of Terms and Binding Agreement
      </h2>
      <p>
        These Terms of Service ("Terms") constitute a legally binding agreement between you (the "User") and Goldencoin Limited (the "Company", "we", "us", or "our"). By registering for an account, accessing, or using our platform, website, applications, or services (collectively, the "Services"), you acknowledge that you have read, understood, and agreed to be unequivocally bound by these Terms.
      </p>
      <p>
        If you do not agree with any of the provisions contained within these Terms, you are prohibited from utilizing our Services and must immediately suspend all access to our platform.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        2. Eligibility and Jurisdiction Restrictions
      </h2>
      <p>
        To be eligible to use our Services, you must implicitly and explicitly represent and warrant that you:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Are at least eighteen (18) years of age and possess the legal capacity to form a binding contract.</li>
        <li>Are not located in, under the control of, or a national or resident of any comprehensively restricted location globally (including but not limited to the FATF high-risk jurisdictions).</li>
        <li>Have not previously been suspended or permanently removed from utilizing our Services.</li>
        <li>Will only utilize our services for legal endeavors and not on behalf of any third-party entity without formalized, written organizational consent.</li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        3. Fiduciary Duty and Risk Acknowledgement
      </h2>
      <p>
        Goldencoin Limited acts as an active asset manager providing algorithmic and manual trading mechanisms alongside yield-generation cycles. While we exercise a degree of care expected within the financial technology sector, we bear no fiduciary duty to you outside of the explicit agreements enclosed in generating asset strategies.
      </p>
      <p>
        The user explicitly acknowledges that engaging in digital asset investments bears a substantial risk of total loss. We do not provide personalized financial, legal, or tax advice. Any engagement in our automated or direct portfolio plans is done strictly at the user's discretion and peril.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        4. Account Management and Operational Security
      </h2>
      <p>
        The integrity of your account is paramount. Users are tasked with full operational security over their account credentials. 
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Users must provide accurate, current, and true information during the KYC protocol and continually update this information if it changes.</li>
        <li>Users are wholly responsible for maintaining the confidentiality of their passwords, authentication devices, and API keys.</li>
        <li>Should a user suspect any security breach or unauthorized access, they must contact our strict compliance team immediately. We will not be liable for losses directly caused by user negligence regarding credential management.</li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        5. Prohibited Conduct and Exploitation
      </h2>
      <p>
        To maintain an equitable and legal environment, users are distinctly prohibited from:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Engaging in market manipulation tactics, spoofing, wash trading, or utilizing the platform to obfuscate funds.</li>
        <li>Exploiting platform vulnerabilities, utilizing automated web-scraping scripts, or attacking the operational infrastructure via DDoS or algorithmic stress testing.</li>
        <li>Using our services to facilitate any activity that violates laws concerning money laundering, corruption, gambling, or the financing of illicit organizations.</li>
      </ul>
      <p>
        Violation of these prohibitions grants the Company the irrevocable right to freeze assets, seize involved funds conditionally to regulatory guidelines, and permanently terminate the user’s account.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        6. Modification of Terms and Force Majeure
      </h2>
      <p>
        We reserve the absolute right to unilaterally modify, amend, or supplement these Terms at our discretion. Significant modifications will always be notified via dashboard announcements or email broadcasts. Continued utility of the platform post-modification constitutes irrevocable acceptance of the new Terms.
      </p>
      <p>
        Goldencoin Limited will not be held liable for failure or delay in performance resulting from conditions beyond its reasonable control, including but not limited to catastrophic hardware failures, extreme market volatility triggering global exchange halts, governmental actions, natural disasters, or broad network outages (Force Majeure).
      </p>
    </section>
  </LegalLayout>
);

export const RiskDisclaimer = () => (
  <LegalLayout title="Risk Governance and Disclaimer" icon={AlertTriangle}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        1. Inherent Market Volatility and Risk of Loss
      </h2>
      <p>
        The valuation of digital assets, algorithmic trading returns, and cryptocurrency markets are intrinsically highly volatile. Prices can severely fluctuate within minutes, entirely independently of Goldencoin Limited's operations. Investing in such markets carries a profound level of risk. You must unequivocally acknowledge that you could lose partially or completely any initial capital invested.
      </p>
      <p>
        Only allocate risk capital—money you can afford to lose without adversely affecting your standard of living.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        2. Absence of Financial Advice
      </h2>
      <p>
        Goldencoin Limited acts strictly as an execution execution and asset management platform. No communication, interface text, analytical chart, or strategic plan parameter provided on this platform constitutes personalized financial, investment, legal, or tax advice. Any engagement parameters are self-directed, and users maintain ultimate liability for their strategic choices.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        3. Strategic Performance and Forward-Looking Disclaimers
      </h2>
      <p>
        Any historical data referenced on the platform outlining past yield performances, algorithmic success rates, or market timing is strictly illustrative. Past performance metrics are explicitly not indicative of, nor do they guarantee, any specific future returns. Any forward-looking statements regarding potential profit percentages are mathematical targets, not guaranteed outcomes.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        4. Technical and Cyber Risk
      </h2>
      <p>
        The decentralized nature of blockchain technologies implies absolute finality; transactions sent to incorrect wallet addresses cannot be reversed by Goldencoin Limited. Furthermore, while we deploy state-of-the-art security, cyber threats evolve unpredictably. Users accept the pervasive risks inherent in internet-based transacting, including potential phishing attempts by third parties impersonating the Company.
      </p>
    </section>
  </LegalLayout>
);

export const AMLPolicy = () => (
  <LegalLayout title="AML & KYC Policy" icon={Shield}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        1. Regulatory Framework and Commitment
      </h2>
      <p>
        Goldencoin Limited enforces a zero-tolerance policy towards money laundering, terrorism financing, and any form of economic corruption. We adhere fiercely to international Anti-Money Laundering (AML) directives, the Bank Secrecy Act (BSA), and guidance provided by the Financial Action Task Force (FATF). To function legally and transparently, these methodologies apply non-negotiably to all user accounts.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        2. Know Your Customer (KYC) Protocols
      </h2>
      <p>
        To prevent anonymity-based abuse, we mandate strict identity verification:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Tiered Verification:</strong> Access to withdrawal parameters and elevated deposit thresholds strictly correlates with the level of verifiable identity provided by the user.</li>
        <li><strong>Required Documentation:</strong> Valid, unexpired government-issued identification (Passport, National ID). In high-risk tiers, a recent utility bill or bank statement serving as Proof of Address (POA) may be necessitated alongside biometric or selfie verification.</li>
        <li><strong>Corporate Entities:</strong> Firms opening institutional accounts must present articles of incorporation, board resolutions, and identify Ultimate Beneficial Owners (UBOs).</li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        3. Continuous Transaction Monitoring
      </h2>
      <p>
        Compliance is not static at registration but continuous throughout the account life cycle:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Our proprietary systems utilize heuristic algorithms to flag anomalous transaction velocity, uncharacteristic volume spikes, and interaction with sanctioned wallet addresses.</li>
        <li>We reserve the legal right to intercept and freeze suspected transactions pending Enhanced Due Diligence (EDD), demanding explanations regarding the origin of funds.</li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        4. Reporting Mandate
      </h2>
      <p>
        Goldencoin Limited maintains legal obligations to report Suspicious Activity Reports (SARs) directly to relevant global financial intelligence units without prior user notification if substantial evidence of regulatory breach is identified.
      </p>
    </section>
  </LegalLayout>
);
