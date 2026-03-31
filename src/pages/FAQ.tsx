import React, { useState } from "react";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MessageSquare, 
  ShieldCheck, 
  TrendingUp, 
  Wallet, 
  ArrowRight,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

const faqs = [
  {
    category: "General",
    icon: HelpCircle,
    questions: [
      {
        q: "What is GoldenCoin Limited?",
        a: "GoldenCoin Limited is a premier digital asset investment platform that allows users to grow their Bitcoin holdings through professionally managed investment strategies and real-time market insights."
      },
      {
        q: "Is my investment safe?",
        a: "Yes, we prioritize security above all else. We use multi-signature cold storage for assets, 256-bit encryption for data, and offer Two-Factor Authentication (2FA) for all accounts."
      }
    ]
  },
  {
    category: "Investments",
    icon: TrendingUp,
    questions: [
      {
        q: "How do the investment plans work?",
        a: "We offer various plans with different durations and expected returns. Once you invest your BTC, our automated trading systems and expert analysts work to generate returns, which are credited to your account upon plan completion."
      },
      {
        q: "Can I cancel an active investment?",
        a: "Active investments are locked for the duration of the plan to ensure the stability of the trading pool. Your principal and returns will be available once the plan expires."
      }
    ]
  },
  {
    category: "Withdrawals & Deposits",
    icon: Wallet,
    questions: [
      {
        q: "What is the minimum withdrawal amount?",
        a: "The minimum withdrawal amount is $50 worth of BTC. This ensures that network fees do not disproportionately affect your withdrawal."
      },
      {
        q: "How long do withdrawals take?",
        a: "Withdrawals are processed manually by our security team for your protection. Please allow up to 24 hours for the funds to be sent to your external wallet."
      }
    ]
  },
  {
    category: "Security & Verification",
    icon: ShieldCheck,
    questions: [
      {
        q: "Why do I need to complete KYC?",
        a: "Know Your Customer (KYC) verification is a regulatory requirement that helps us prevent fraud, money laundering, and ensure the security of our platform for all users."
      },
      {
        q: "How do I enable 2FA?",
        a: "You can enable Two-Factor Authentication (2FA) in your Profile settings. We support TOTP-based apps like Google Authenticator or Authy."
      }
    ]
  },
  {
    category: "Referral Program",
    icon: Users,
    questions: [
      {
        q: "How does the referral program work?",
        a: "Our referral program allows you to earn bonuses by inviting others to join Goldencoin. Simply share your unique referral link or code found on your dashboard. When a new user signs up using your code and makes their first successful deposit, you'll receive a 0.0005 BTC bonus credited to your account."
      },
      {
        q: "When will I receive my referral bonus?",
        a: "The referral bonus is automatically credited to your balance as soon as the referred user's first deposit is approved by our administrative team. You will receive a notification once the bonus is added."
      },
      {
        q: "Is there a limit to how many people I can refer?",
        a: "No, there is no limit! You can refer as many friends and family members as you like and earn a bonus for each one who completes their first deposit."
      }
    ]
  }
];

export const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  const toggleFaq = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12 py-10 px-4">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center text-[#C9A96E] mx-auto"
        >
          <HelpCircle size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold text-slate-950 dark:text-white tracking-tight">Frequently Asked Questions</h1>
        <p className="text-slate-600 dark:text-gray-400 max-w-xl mx-auto">
          Find answers to common questions about GoldenCoin Limited, our platform, and how to manage your digital assets.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Search for answers..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-[#C9A96E]/10 rounded-2xl py-4 pl-12 pr-4 text-slate-950 dark:text-white outline-none focus:border-[#C9A96E]/40 transition-all shadow-xl"
        />
      </div>

      <div className="space-y-8">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-[#C9A96E]/10">
            <p className="text-gray-500">No results found for "{searchTerm}"</p>
          </div>
        ) : (
          filteredFaqs.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <cat.icon size={20} className="text-[#C9A96E]" />
                <h2 className="text-lg font-bold text-slate-950 dark:text-white uppercase tracking-widest">{cat.category}</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {cat.questions.map((item, qIdx) => {
                  const id = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div 
                      key={id} 
                      className={cn(
                        "bg-white dark:bg-slate-900 border rounded-2xl transition-all overflow-hidden",
                        isOpen ? "border-[#C9A96E]/40 ring-1 ring-[#C9A96E]/20" : "border-[#C9A96E]/10"
                      )}
                    >
                      <button 
                        onClick={() => toggleFaq(id)}
                        className="w-full p-6 flex items-center justify-between text-left"
                      >
                        <span className="font-bold text-slate-950 dark:text-white pr-8">{item.q}</span>
                        {isOpen ? <ChevronUp className="text-[#C9A96E]" size={20} /> : <ChevronDown className="text-gray-500" size={20} />}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-6 pb-6 text-slate-600 dark:text-gray-400 text-sm leading-relaxed border-t border-[#C9A96E]/5 pt-4">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contact Support CTA */}
      <div className="bg-[#C9A96E] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0B0B0B]/10 rounded-full flex items-center justify-center text-[#0B0B0B]">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0B0B0B]">Still have questions?</h3>
            <p className="text-[#0B0B0B]/70 text-sm">Our support team is available 24/7 to help you.</p>
          </div>
        </div>
        <a 
          href="mailto:lookuptoadams@gmail.com" 
          className="px-8 py-3 bg-[#0B0B0B] text-white font-bold rounded-xl hover:bg-[#1A1A1A] transition-all flex items-center gap-2"
        >
          Contact Support
          <ArrowRight size={18} />
        </a>
      </div>
      </div>
    </div>
  );
};
