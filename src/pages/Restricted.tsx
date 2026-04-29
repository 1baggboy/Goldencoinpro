import React from "react";
import { ShieldAlert, LogOut, MessageSquare } from "lucide-react";
import { useAuth } from "../AuthContext";
import { motion } from "motion/react";
import { APP_CONFIG } from "../config";
import { Footer } from "../components/Footer";

export const Restricted = () => {
  const { profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      <div className="flex-1 flex items-center justify-center p-4 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-red-500/5"
        >
          {/* ... existing content ... */}
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert size={40} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Account Restricted</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Hello <span className="text-white font-bold">{profile?.displayName}</span>, your account has been temporarily restricted by our security team.
            </p>
          </div>

          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-xs text-red-200/70 leading-relaxed">
            This usually happens due to suspicious activity or pending verification. During this time, you cannot perform transactions or access certain dashboard features.
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              className="w-full py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10"
              onClick={() => window.location.href = `mailto:${APP_CONFIG.supportEmail}`}
            >
              <MessageSquare size={18} />
              Contact Support
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
            GoldenCoin Limited Security System
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};
