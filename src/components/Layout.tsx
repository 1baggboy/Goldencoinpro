import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
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
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar lg:bg-slate-100/30 dark:lg:bg-transparent content-center">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1440px] mx-auto w-full min-h-fit"
            >
              <div className="glass-card rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 shadow-2xl border-[#C9A96E]/20">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
