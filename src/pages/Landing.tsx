import React from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight, 
  Lock, 
  BarChart3,
  CheckCircle2,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "./ThemeContext";
import { cn } from "../lib/utils";
import { Logo } from "../components/Logo";
import { Footer } from "../components/Footer";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import createAccountImg from "../assets/NoteGPT_Image_20260425233608-removebg-preview.png";
import secureDepositImg from "../assets/modern-design-illustration-of-secure-vault-vector-removebg-preview.png";
import startGrowthImg from "../assets/Screenshot_20260425_233726_Gallery-removebg-preview.png";

export const Landing = () => {
  const { theme } = useTheme();
  const [userCount, setUserCount] = React.useState<number>(0);

  React.useEffect(() => {
    // setUserCount(1420); // Removed insecure listener
  }, []);

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* Navigation */}
      <nav className="h-20 border-b px-6 md:px-12 flex items-center justify-between sticky top-0 backdrop-blur-md z-50 border-[#C9A96E]/20 bg-slate-50/80 dark:border-[#C9A96E]/10 dark:bg-slate-950/80">
        <div className="flex items-center gap-3">
          <Logo size="md" />
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
              Institutional Digital Asset Management
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-display font-black tracking-tight mb-8 lg:mb-16 leading-[0.9] lg:leading-[0.8] text-slate-900 dark:text-white uppercase">
              Secure. Simple. <br />
              <span className="text-[#C9A96E]">Smart Crypto</span>
            </h1>
            <p className="text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-12 lg:mb-16 leading-relaxed lg:leading-[1.6] opacity-80 font-medium">
              Manage your Bitcoin with absolute confidence through institutional-grade governance and full transparency. Our platform provides the technical infrastructure needed to track, secure, and stake your digital assets with audited precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6">
              <Link to="/register" className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-6 bg-[#C9A96E] text-slate-950 font-black rounded-2xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-3 text-lg lg:text-xl shadow-2xl shadow-[#C9A96E]/30 uppercase tracking-widest">
                Start Your Journey <ArrowRight size={24} />
              </Link>
              <Link to="/about" className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-6 bg-slate-200 dark:bg-slate-900 text-slate-950 dark:text-white font-black rounded-2xl border border-[#C9A96E]/30 hover:bg-slate-300 dark:hover:bg-slate-800 transition-all text-lg lg:text-xl text-center uppercase tracking-widest">
                Explore Wealth
              </Link>
            </div>
            
            {/* Real-time Counter */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 flex items-center justify-center gap-2 text-[#C9A96E] font-bold"
            >
              <Users size={20} />
              <span className="text-2xl tabular-nums">{userCount.toLocaleString()}</span>
              <span className="text-gray-500 uppercase tracking-widest text-xs">Active Asset Managers</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C9A96E]/5 rounded-full blur-[120px] -z-10"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-slate-100 dark:bg-slate-900 transition-all">
        <div className="max-w-[1440px] mx-auto xl:max-w-[1600px]">
          <div className="text-center mb-24 transition-all">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 font-display uppercase tracking-tight">Why Choose Goldencoin?</h2>
            <p className="text-gray-600 dark:text-gray-500 max-w-2xl mx-auto text-lg lg:text-xl opacity-80">We've built a platform that prioritizes security, speed, and user experience above all else.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard 
              icon={Shield} 
              title="Advanced Security" 
              description="Your assets are protected securely with industry-standard encryption protocols and standard cold storage principles."
            />
            <FeatureCard 
              icon={Zap} 
              title="Efficient Settlement" 
              description="Our systemized monitoring ensures your BTC deposits are credited after industry-standard network confirmations."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Advanced Analytics" 
              description="Track your portfolio performance with real-time charts and detailed transaction history."
            />
          </div>
        </div>
      </section>

      {/* How to Invest Section */}
      <section className="py-32 px-6 bg-white dark:bg-slate-950 transition-all">
        <div className="max-w-[1440px] mx-auto xl:max-w-[1600px]">
          <div className="text-center mb-24 transition-all">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 font-display uppercase tracking-tight">How to Invest</h2>
            <p className="text-gray-600 dark:text-gray-500 max-w-2xl mx-auto text-lg lg:text-xl opacity-80">Start your journey to digital wealth in three easy steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <div className="space-y-8 text-center group">
                <motion.img 
                  initial={{ y: 0 }}
                  src={createAccountImg}
                  alt="Create Account" 
                  className="w-full max-w-[280px] h-auto mx-auto object-contain transition-all duration-700 scale-110 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
               <div className="w-12 h-12 bg-[#C9A96E] rounded-full flex items-center justify-center text-[#0B0B0B] font-black text-xl shadow-lg mx-auto">01</div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white uppercase tracking-tight">Create Account</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">Sign up in seconds with our streamlined registration process. Verify your identity to unlock core features.</p>
              </div>
            </div>

            <div className="space-y-8 text-center group">
                <motion.img 
                  initial={{ y: 0 }}
                  src={secureDepositImg}
                  alt="Secure Deposit" 
                  className="w-full max-w-[280px] h-auto mx-auto object-contain transition-all duration-700 scale-110 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
                />
               <div className="w-12 h-12 bg-[#C9A96E] rounded-full flex items-center justify-center text-[#0B0B0B] font-black text-xl shadow-lg mx-auto">02</div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white uppercase tracking-tight">Secure Deposit</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">Transfer Bitcoin to your unique wallet address. Our systems utilize industry-standard node confirmation protocols.</p>
              </div>
            </div>

            <div className="space-y-8 text-center group">
                <motion.img 
                  initial={{ y: 0 }}
                  src={startGrowthImg}
                  alt="Start Growth" 
                  className="w-full max-w-[280px] h-auto mx-auto object-contain transition-all duration-700 scale-110 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
               <div className="w-12 h-12 bg-[#C9A96E] rounded-full flex items-center justify-center text-[#0B0B0B] font-black text-xl shadow-lg mx-auto">03</div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white uppercase tracking-tight">Start Growth</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">Select a cycle that matches your goals. Your returns are credited automatically upon plan completion.</p>
              </div>
            </div>
          </div>

          <div className="mt-20 text-center">
            <Link to="/register" className="px-10 py-5 bg-[#0B0B0B] dark:bg-white text-white dark:text-slate-950 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 text-xl uppercase tracking-widest">
              Ready to begin? <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* Referral Announcement Section */}
      <section id="about" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto xl:max-w-[1600px]">
          <div className="bg-slate-100 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-[#C9A96E]/20 rounded-[40px] p-8 md:p-16 lg:p-24 relative overflow-hidden transition-all shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A96E]/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <span className="inline-block px-4 py-1.5 bg-[#C9A96E]/10 text-[#C9A96E] text-xs font-bold rounded-full border border-[#C9A96E]/20 uppercase tracking-widest">
                  Limited Time Offer
                </span>
                <h2 className="text-5xl md:text-7xl font-bold leading-tight text-slate-950 dark:text-white font-display uppercase italic">
                  Refer and Earn <br />
                  <span className="text-[#C9A96E] font-black">$10 Cash</span> Bonus
                </h2>
                <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed opacity-90">
                  Invite your friends and family to join Goldencoin. When they sign up and make their first deposit, you'll receive a $10 cash bonus credited directly to your account.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link to="/register" className="px-10 py-5 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-2xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 text-xl shadow-xl shadow-[#C9A96E]/20">
                    Join Now & Refer <ArrowRight size={24} />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <div className="p-8 bg-slate-200 dark:bg-slate-950 border border-[#C9A96E]/10 rounded-[2rem] hover:border-[#C9A96E]/40 transition-all">
                  <div className="text-4xl font-bold text-[#C9A96E] mb-3">01</div>
                  <h4 className="font-bold text-lg mb-2 text-slate-950 dark:text-white uppercase">Share Link</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-500">Copy your unique referral link from your dashboard.</p>
                </div>
                <div className="p-8 bg-slate-200 dark:bg-slate-950 border border-[#C9A96E]/10 rounded-[2rem] hover:border-[#C9A96E]/40 transition-all">
                  <div className="text-4xl font-bold text-[#C9A96E] mb-3">02</div>
                  <h4 className="font-bold text-lg mb-2 text-slate-950 dark:text-white uppercase">Friends Join</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-500">Your friends sign up using your unique referral code.</p>
                </div>
                <div className="p-8 bg-slate-200 dark:bg-slate-950 border border-[#C9A96E]/10 rounded-[2rem] hover:border-[#C9A96E]/40 transition-all">
                  <div className="text-4xl font-bold text-[#C9A96E] mb-3">03</div>
                  <h4 className="font-bold text-lg mb-2 text-slate-950 dark:text-white uppercase">They Deposit</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-500">Bonus is triggered once their first deposit is approved.</p>
                </div>
                <div className="p-8 bg-slate-200 dark:bg-slate-950 border border-[#C9A96E]/10 rounded-[2rem] hover:border-[#C9A96E]/40 transition-all">
                  <div className="text-4xl font-bold text-[#C9A96E] mb-3">04</div>
                  <h4 className="font-bold text-lg mb-2 text-slate-950 dark:text-white uppercase">Get Paid</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-500">$10 is instantly credited to your balance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="security" className="py-32 px-6">
        <div className="max-w-[1200px] mx-auto bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden transition-all shadow-3xl">
          <div className="relative z-10">
            <h2 className="text-5xl lg:text-6xl font-black mb-10 text-slate-950 dark:text-white font-display uppercase tracking-tight italic">Take control <br /> of your crypto.</h2>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto opacity-80">Join thousands of users who trust Goldencoin for their digital asset management.</p>
            <div className="flex flex-col items-center gap-6 mb-16">
              <Link to="/register" className="px-12 py-5 bg-[#C9A96E] text-slate-950 font-black rounded-2xl hover:bg-[#D4B985] transition-all inline-flex items-center gap-3 text-xl uppercase tracking-widest">
                Create Free Account <ArrowRight size={24} />
              </Link>
              <div className="flex items-center gap-4 text-sm text-gray-500 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-[#C9A96E]" /> Audited Storage</span>
                <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full"></span>
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-[#C9A96E]" /> Monthly Transparency Reports</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.07]">
            <Logo size="custom" className="w-[120%]" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
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
