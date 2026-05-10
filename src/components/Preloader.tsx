import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "./Logo";

interface PreloaderProps {
  isLoading: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950"
        >
          {/* Ambient Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-[500px] h-[500px] bg-[#C9A96E]/20 rounded-full blur-[120px]"
          />

          {/* Logo Container with "Hovering" effect */}
          <div className="relative mb-8">
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10"
            >
              <Logo size="xl" className="filter drop-shadow-[0_0_15px_rgba(201,169,110,0.3)]" />
            </motion.div>
            
            {/* Pulsing ring below logo */}
            <motion.div
              animate={{
                scale: [1, 2],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute inset-0 border-2 border-[#C9A96E] rounded-full scale-0"
            />
          </div>

          {/* Loading Text */}
          <div className="flex flex-col items-center gap-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-50"
            />
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[#C9A96E] text-[10px] font-black uppercase tracking-[0.5em] ml-[0.5em]"
            >
              Initializing Secure Environment
            </motion.p>
          </div>

          <div className="absolute bottom-12 text-gray-600 text-[8px] font-bold uppercase tracking-[0.2em]">
            Goldencoin LTD • Institutional Grade Infrastructure
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
