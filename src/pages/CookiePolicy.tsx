import React from "react";
import { PublicLayout } from "../components/PublicLayout";
import { Cookie, Info, ShieldCheck, Settings } from "lucide-react";
import { motion } from "motion/react";

const CookiePolicy: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12"
        >
          <div className="flex items-center gap-6 mb-16">
            <div className="p-4 bg-[#C9A96E]/10 rounded-2xl border border-[#C9A96E]/20 backdrop-blur-md">
              <Cookie className="text-[#C9A96E]" size={40} />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tight uppercase font-display italic">
                Cookie Policy
              </h1>
              <p className="text-[#C9A96E] font-bold text-sm tracking-widest uppercase mt-2">Document Version 10.2 • May 9, 2026</p>
            </div>
          </div>

          <div className="space-y-20 text-gray-600 dark:text-gray-400">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center text-[#C9A96E] border border-[#C9A96E]/20">
                  <Info size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight italic font-display">What are Cookies?</h2>
              </div>
              <p className="leading-relaxed text-xl font-medium">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
              </p>
            </section>

            <section className="space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center text-[#C9A96E] border border-[#C9A96E]/20">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight italic font-display">How We Use Cookies</h2>
              </div>
              <p className="leading-relaxed text-xl font-medium">
                At Goldencoin, we use cookies to improve your browsing experience and the smooth running of our platform. Specifically, we use them for:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="p-8 bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-[#C9A96E]/20 hover:border-[#C9A96E]/50 transition-all group">
                  <div className="font-black text-[#C9A96E] uppercase tracking-widest text-xs mb-4">Priority 01</div>
                  <h4 className="font-bold text-slate-950 dark:text-white mb-3 text-xl uppercase tracking-tighter">Essential</h4>
                  <p className="text-base leading-relaxed">Necessary for the website to function. They enable core functionality such as security, network management, and accessibility infrastructure.</p>
                </div>
                <div className="p-8 bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-[#C9A96E]/20 hover:border-[#C9A96E]/50 transition-all group">
                  <div className="font-black text-[#C9A96E] uppercase tracking-widest text-xs mb-4">Priority 02</div>
                  <h4 className="font-bold text-slate-950 dark:text-white mb-3 text-xl uppercase tracking-tighter">Analytical</h4>
                  <p className="text-base leading-relaxed">Help us understand how visitors interact with our website by collecting and reporting information anonymously to optimize performance.</p>
                </div>
                <div className="p-8 bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-[#C9A96E]/20 hover:border-[#C9A96E]/50 transition-all group">
                  <div className="font-black text-[#C9A96E] uppercase tracking-widest text-xs mb-4">Priority 03</div>
                  <h4 className="font-bold text-slate-950 dark:text-white mb-3 text-xl uppercase tracking-tighter">Preference</h4>
                  <p className="text-base leading-relaxed">Allow the website to remember choices you make (such as your username) to provide enhanced, more personal and efficient features.</p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center text-[#C9A96E] border border-[#C9A96E]/20">
                  <Settings size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight italic font-display">Managing Preferences</h2>
              </div>
              <p className="leading-relaxed text-xl font-medium">
                Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage them, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-[#C9A96E] hover:underline font-bold transition-all">aboutcookies.org</a>.
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent("show-cookie-preferences"))}
                  className="px-8 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black uppercase tracking-widest rounded-2xl hover:bg-[#C9A96E] dark:hover:bg-[#C9A96E] hover:text-slate-950 transition-all active:scale-95 shadow-2xl"
                >
                  Manage My Preferences
                </button>
              </div>
            </section>

            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="p-10 md:p-16 bg-[#C9A96E] text-slate-950 rounded-[3rem] border border-[#C9A96E]/20 shadow-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <Cookie size={200} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black uppercase mb-6 tracking-tight italic font-display">Infrastructure Core</h3>
                <p className="text-slate-950 font-bold text-xl leading-relaxed max-w-2xl">
                  Without cookies, some parts of our high-performance infrastructure might not work properly. They are essential for providing you with a seamless and secure investment experience.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default CookiePolicy;
