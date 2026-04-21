import React, { useState } from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../AuthContext";
import { cn } from "../lib/utils";
import { APP_CONFIG } from "../config";
import { useNotifications } from "../NotificationContext";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationDropdown } from "../pages/NotificationDropdown";
import { Logo } from "./Logo";

export const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="h-20 lg:h-24 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-[#C9A96E]/10 px-4 lg:px-12 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 lg:hidden">
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMenuClick?.();
          }} 
          className="p-2 lg:p-3 text-[#C9A96E] hover:bg-[#C9A96E]/10 rounded-xl transition-colors relative z-[60]"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 relative z-50">
          <Logo size="sm" className="lg:h-10" />
        </div>
      </div>

      <div className="hidden lg:flex items-center relative gap-4">
        <motion.div 
          initial={false}
          animate={{ width: isSearchExpanded ? 400 : 48 }}
          className={cn(
            "flex items-center bg-gray-100 dark:bg-slate-900 h-12 rounded-2xl border border-[#C9A96E]/10 overflow-hidden transition-all duration-300 shadow-sm",
            isSearchExpanded && "w-[400px] xl:w-[500px] border-[#C9A96E]/40 ring-1 ring-[#C9A96E]/20"
          )}
        >
          <button 
            type="button"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-[#C9A96E] transition-colors shrink-0"
          >
            <Search size={20} />
          </button>
          <div className={cn("flex-1 pr-4 overflow-hidden transition-opacity duration-300", isSearchExpanded ? "opacity-100" : "opacity-0 invisible")}>
            <input
              type="text"
              placeholder="Search assets, help..."
              className="bg-transparent border-none outline-none text-sm w-full text-gray-900 dark:text-gray-200 placeholder:text-gray-400 font-medium"
            />
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-6 md:gap-10">
        <ThemeToggle />
        <div className="hidden xl:flex items-center gap-10">
          <Link to="/faq" className="text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-[#C9A96E] transition-colors">FAQ</Link>
          <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-[#C9A96E] transition-colors">Support</a>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#C9A96E] transition-colors relative"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
            )}
          </button>
          <NotificationDropdown 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
          />
        </div>

        <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-[#C9A96E]/10 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile?.displayName || "User"}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role || "Member"}</p>
          </div>
          <div className="w-10 h-10 bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-full flex items-center justify-center overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="text-[#C9A96E]" size={20} />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};
