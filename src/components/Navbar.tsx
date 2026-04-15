import React, { useState } from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { APP_CONFIG } from "../config";
import { useNotifications } from "../NotificationContext";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationDropdown } from "../pages/NotificationDropdown";
const logo = "/Logo.png";

export const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-[#C9A96E]/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 md:hidden">
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMenuClick?.();
          }} 
          className="p-2 text-[#C9A96E] hover:bg-[#C9A96E]/10 rounded-lg transition-colors relative z-[60]"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 relative z-50">
          <img src={logo} alt="GOLDENCOIN" className="h-8 w-auto" referrerPolicy="no-referrer" />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 bg-gray-100 dark:bg-slate-900 px-4 py-2 rounded-xl border border-[#C9A96E]/10 w-96">
        <Search className="text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search transactions, assets..."
          className="bg-transparent border-none outline-none text-sm w-full text-gray-900 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <ThemeToggle />
        <div className="hidden lg:flex items-center gap-6 mr-4">
          <Link to="/faq" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#C9A96E] transition-colors">FAQ</Link>
          <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#C9A96E] transition-colors">Support</a>
          <Link to="/dashboard" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#C9A96E] transition-colors">Dashboard</Link>
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
