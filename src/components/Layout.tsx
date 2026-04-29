import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../pages/ThemeContext";
import { cn } from "../lib/utils";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { theme } = useTheme();

  return (
    <div className={cn("flex h-screen font-sans overflow-hidden", theme === 'light' ? 'bg-[#F5F5F5] text-[#0B0B0B]' : 'bg-slate-950 text-white')}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Moving Legal Updates Banner */}
        <div className="bg-[#C9A96E]/20 text-[#C9A96E] py-2 px-4 shadow-sm border-b border-[#C9A96E]/30 relative overflow-hidden flex items-center font-medium text-sm sm:text-base shrink-0">
          <div className="whitespace-nowrap overflow-hidden w-full relative">
             <div className="inline-block animate-marquee whitespace-nowrap">
                 Notice: We have comprehensively updated our Privacy Policy, Terms of Service, Risk Governance, and AML/KYC Policy. Please review these legal updates.
             </div>
          </div>
        </div>

        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-2 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12 custom-scrollbar transition-all duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1600px] mx-auto w-full"
            >
              <div className="glass-card shadow-2xl relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] lg:rounded-[3.5rem] border border-[#C9A96E]/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A96E]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                <div className="p-4 sm:p-8 lg:p-12">
                  {children}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
