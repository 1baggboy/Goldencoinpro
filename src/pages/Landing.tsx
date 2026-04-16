import React from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight, 
  Lock, 
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "./ThemeContext";
import { cn } from "../lib/utils";
import logo from "../assets/logo.png";

export const Landing = () => {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* Navigation */}
      <nav className="h-20 border-b px-6 md:px-12 flex items-center justify-between sticky top-0 backdrop-blur-md z-50 border-[#C9A96E]/20 bg-slate-50/80 dark:border-[#C9A96E]/10 dark:bg-slate-950/80">
        <div className="flex items-center gap-3">
          <img src={logo} alt="GOLDENCOIN" className="h-10 w-auto" referrerPolicy="no-referrer" />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link to="/features" className="hover:text-[#C9A96E] transition-colors">Features</Link>
          <Link to="/security" className="hover:text-[#C9A96E] transition-colors">Security</Link>
          <Link to="/faq" className="hover:text-[#C9A96E] transition-colors">FAQ</Link>
          <Link to="/about" className="hover:text-[#C9A96E] transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login" className="text-sm font-semibold transition-colors text-slate-950 hover:text-[#C9A96E] dark:text-white dark:hover:text-[#C9A96E]">Login</Link>
          <Link to="/register" className="px-5 py-2.5 bg-[#C9A96E] text-slate-950 font-bold rounded-lg hover:bg-[#D4B985] transition-all text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 lg:pt-28 pb-32 lg:pb-48 px-6 overflow-hidden">
        <div className="max-w-[1440px] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-6 py-2 bg-[#C9A96E]/10 text-[#C9A96E] text-[10px] font-black rounded-full border border-[#C9A96E]/20 mb-8 lg:mb-12 uppercase tracking-[0.3em]">
              Institutional Grade Crypto Management
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-display font-black tracking-tight mb-8 lg:mb-16 leading-[0.9] lg:leading-[0.8] text-slate-900 dark:text-white uppercase">
              Secure. Simple. <br />
              <span className="text-[#C9A96E]">Smart Crypto</span>
            </h1>
            <p className="text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-12 lg:mb-16 leading-relaxed lg:leading-[1.6] opacity-80 font-medium">
              Manage your Bitcoin with absolute confidence and elite institutional transparency. Our platform provides the elite tools you need to track, deposit, and grow your digital fortune securely.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6">
              <Link to="/register" className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-6 bg-[#C9A96E] text-slate-950 font-black rounded-2xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-3 text-lg lg:text-xl shadow-2xl shadow-[#C9A96E]/30 uppercase tracking-widest">
                Start Your Journey <ArrowRight size={24} />
              </Link>
              <Link to="/about" className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-6 bg-slate-200 dark:bg-slate-900 text-slate-950 dark:text-white font-black rounded-2xl border border-[#C9A96E]/30 hover:bg-slate-300 dark:hover:bg-slate-800 transition-all text-lg lg:text-xl text-center uppercase tracking-widest">
                Explore Wealth
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C9A96E]/5 rounded-full blur-[120px] -z-10"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-slate-100 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Why Choose Goldencoin?</h2>
            <p className="text-gray-600 dark:text-gray-500 max-w-xl mx-auto">We've built a platform that prioritizes security, speed, and user experience above all else.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Shield} 
              title="Military-Grade Security" 
              description="Your assets are protected by multi-signature wallets and institutional-grade encryption protocols."
            />
            <FeatureCard 
              icon={Zap} 
              title="Instant Deposits" 
              description="Our automated monitoring system ensures your BTC deposits are credited after minimal confirmations."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Advanced Analytics" 
              description="Track your portfolio performance with real-time charts and detailed transaction history."
            />
          </div>
        </div>
      </section>

      {/* Referral Announcement Section */}
      <section id="about" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-100 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-[#C9A96E]/20 rounded-[40px] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A96E]/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 bg-[#C9A96E]/10 text-[#C9A96E] text-xs font-bold rounded-full border border-[#C9A96E]/20 mb-6 uppercase tracking-widest">
                  Limited Time Offer
                </span>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-slate-950 dark:text-white">
                  Refer and Earn <br />
                  <span className="text-[#C9A96E]">$10 Cash</span> Bonus
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Invite your friends and family to join Goldencoin. When they sign up and make their first deposit, you'll receive a $10 cash bonus credited directly to your account.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register" className="px-8 py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 text-lg">
                    Join Now & Refer <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-200 dark:bg-slate-950 border border-[#C9A96E]/10 rounded-3xl">
                  <div className="text-3xl font-bold text-[#C9A96E] mb-2">01</div>
                  <h4 className="font-bold mb-2 text-slate-950 dark:text-white">Share Link</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-500">Copy your unique referral link from your dashboard.</p>
                </div>
                <div className="p-6 bg-slate-200 dark:bg-slate-950 border border-[#C9A96E]/10 rounded-3xl">
                  <div className="text-3xl font-bold text-[#C9A96E] mb-2">02</div>
                  <h4 className="font-bold mb-2 text-slate-950 dark:text-white">Friends Join</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-500">Your friends sign up using your unique referral code.</p>
                </div>
                <div className="p-6 bg-slate-200 dark:bg-slate-950 border border-[#C9A96E]/10 rounded-3xl">
                  <div className="text-3xl font-bold text-[#C9A96E] mb-2">03</div>
                  <h4 className="font-bold mb-2 text-slate-950 dark:text-white">They Deposit</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-500">Bonus is triggered once their first deposit is approved.</p>
                </div>
                <div className="p-6 bg-slate-200 dark:bg-slate-950 border border-[#C9A96E]/10 rounded-3xl">
                  <div className="text-3xl font-bold text-[#C9A96E] mb-2">04</div>
                  <h4 className="font-bold mb-2 text-slate-950 dark:text-white">Get Paid</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-500">$10 is instantly credited to your balance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="security" className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-8 text-slate-950 dark:text-white">Ready to take control of your crypto?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">Join thousands of users who trust Goldencoin for their digital asset management.</p>
            <Link to="/register" className="px-10 py-4 bg-[#C9A96E] text-slate-950 font-bold rounded-xl hover:bg-[#D4B985] transition-all inline-flex items-center gap-2 text-lg">
              Create Free Account <ArrowRight size={20} />
            </Link>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <img src={logo} alt="" className="w-64 h-auto" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-[#C9A96E]/10 bg-slate-100 dark:bg-slate-900/50">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <img src={logo} alt="GOLDENCOIN" className="h-12 w-auto" referrerPolicy="no-referrer" />
              <span className="text-2xl font-display font-black tracking-tight uppercase">Goldencoin</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-10 text-lg leading-relaxed">
              Goldencoin Limited is a leading digital asset management platform providing secure and transparent Bitcoin solutions. Established to bring institutional-grade tools to everyone.
            </p>
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-white dark:bg-slate-950 rounded-2xl border border-[#C9A96E]/20 flex items-center justify-center hover:border-[#C9A96E] cursor-pointer transition-all shadow-lg">
                <Globe size={24} className="text-[#C9A96E]" />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-8 text-[#C9A96E] uppercase tracking-widest text-sm">Platform</h4>
            <ul className="space-y-6 text-base text-gray-600 dark:text-gray-400 font-medium">
              <li><Link to="/dashboard" className="hover:text-[#C9A96E] transition-colors">Client Dashboard</Link></li>
              <li><Link to="/deposit" className="hover:text-[#C9A96E] transition-colors">Secure Deposit</Link></li>
              <li><Link to="/kyc" className="hover:text-[#C9A96E] transition-colors">KYC Verification</Link></li>
              <li><Link to="/faq" className="hover:text-[#C9A96E] transition-colors">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-8 text-[#C9A96E] uppercase tracking-widest text-sm">Legal Excellence</h4>
            <ul className="space-y-6 text-base text-gray-600 dark:text-gray-400 font-medium">
              <li><Link to="/privacy-policy" className="hover:text-[#C9A96E] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-[#C9A96E] transition-colors">Service Terms</Link></li>
              <li><Link to="/risk-disclaimer" className="hover:text-[#C9A96E] transition-colors">Risk Governance</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-24 pt-10 border-t border-[#C9A96E]/10 text-center text-xs text-gray-500 font-medium tracking-wide">
          <p className="mb-6">© 2026 Goldencoin Limited. Institutional Grade License No. GC-77821-LTD.</p>
          <p className="max-w-4xl mx-auto leading-loose opacity-60">
            Cryptocurrency is highly volatile and carries significant financial risk. Goldencoin Limited does not guarantee specific yields or profits. All financial decisions remain the sole responsibility of the user. Please consult with a qualified financial advisor before participating in digital asset markets.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div className="p-8 bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-2xl hover:border-[#C9A96E]/40 transition-all group">
    <div className="w-14 h-14 bg-[#C9A96E]/10 rounded-xl flex items-center justify-center text-[#C9A96E] mb-6 group-hover:scale-110 transition-transform">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-950 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-500 leading-relaxed">{description}</p>
  </div>
);
