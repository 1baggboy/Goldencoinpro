import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { Footer } from "./Footer";
import { NewsletterSubscription } from "./NewsletterSubscription";
import { useAuth } from "../AuthContext";
import { motion } from "motion/react";

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

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
          {user ? (
            <Link to="/dashboard" className="px-5 py-2.5 bg-[#C9A96E] text-slate-950 font-bold rounded-lg hover:bg-[#D4B985] transition-all text-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold transition-colors text-slate-950 hover:text-[#C9A96E] dark:text-white dark:hover:text-[#C9A96E]">Login</Link>
              <Link to="/register" className="px-5 py-2.5 bg-[#C9A96E] text-slate-950 font-bold rounded-lg hover:bg-[#D4B985] transition-all text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="relative">
        {/* Shared Background elements from Landing */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
            style={{ 
              backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')`,
              backgroundSize: '200px'
            }}
          ></div>
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#C9A96E]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"
          />
        </div>

        <div className="pt-20 pb-32">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};
