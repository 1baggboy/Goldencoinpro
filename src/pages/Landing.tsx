import React from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight, 
  Coins, 
  Lock, 
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { motion } from "motion/react";

export const Landing = () => {
  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans">
      {/* Navigation */}
      <nav className="h-20 border-b border-[#C9A96E]/10 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-[#0B0B0B]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A96E] rounded-lg flex items-center justify-center">
            <Coins className="text-[#0B0B0B]" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-[#C9A96E]">GOLDENCOIN</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-[#C9A96E] transition-colors">Features</a>
          <a href="#security" className="hover:text-[#C9A96E] transition-colors">Security</a>
          <a href="#about" className="hover:text-[#C9A96E] transition-colors">About</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold hover:text-[#C9A96E] transition-colors">Login</Link>
          <Link to="/register" className="px-5 py-2.5 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-lg hover:bg-[#D4B985] transition-all text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#C9A96E]/10 text-[#C9A96E] text-xs font-bold rounded-full border border-[#C9A96E]/20 mb-6 uppercase tracking-widest">
              Institutional Grade Crypto Management
            </span>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
              Secure. Simple. <br />
              <span className="text-[#C9A96E]">Smart Crypto</span> Management
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Manage your Bitcoin with confidence and transparency. Our platform provides the tools you need to track, deposit, and grow your digital assets securely.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 text-lg">
                Start Your Journey <ArrowRight size={20} />
              </Link>
              <Link to="/about" className="w-full sm:w-auto px-8 py-4 bg-[#121212] text-white font-bold rounded-xl border border-[#C9A96E]/20 hover:bg-[#1A1A1A] transition-all text-lg">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C9A96E]/5 rounded-full blur-[120px] -z-10"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Why Choose Goldencoin?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We've built a platform that prioritizes security, speed, and user experience above all else.</p>
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

      {/* Trust Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-[#121212] border border-[#C9A96E]/10 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-8">Ready to take control of your crypto?</h2>
            <p className="text-xl text-gray-400 mb-12">Join thousands of users who trust Goldencoin for their digital asset management.</p>
            <Link to="/register" className="px-10 py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all inline-flex items-center gap-2 text-lg">
              Create Free Account <ArrowRight size={20} />
            </Link>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Coins size={200} className="text-[#C9A96E]" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-[#C9A96E]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#C9A96E] rounded-lg flex items-center justify-center">
                <Coins className="text-[#0B0B0B]" size={18} />
              </div>
              <span className="text-xl font-bold tracking-tighter text-[#C9A96E]">GOLDENCOIN</span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8">
              Goldencoin Limited is a leading digital asset management platform providing secure and transparent Bitcoin solutions.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#121212] rounded-full border border-[#C9A96E]/10 flex items-center justify-center hover:border-[#C9A96E]/40 cursor-pointer transition-all">
                <Globe size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[#C9A96E]">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/deposit" className="hover:text-white transition-colors">Deposit BTC</Link></li>
              <li><Link to="/kyc" className="hover:text-white transition-colors">KYC Verification</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[#C9A96E]">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Risk Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#C9A96E]/5 text-center text-xs text-gray-600">
          <p className="mb-4">© 2026 Goldencoin Limited. All rights reserved.</p>
          <p className="max-w-3xl mx-auto leading-relaxed">
            Cryptocurrency is volatile and carries risk. Goldencoin Limited does not guarantee profits. Users are responsible for their financial decisions. Please trade responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div className="p-8 bg-[#121212] border border-[#C9A96E]/10 rounded-2xl hover:border-[#C9A96E]/40 transition-all group">
    <div className="w-14 h-14 bg-[#C9A96E]/10 rounded-xl flex items-center justify-center text-[#C9A96E] mb-6 group-hover:scale-110 transition-transform">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </div>
);
