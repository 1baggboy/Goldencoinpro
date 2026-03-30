import React, { useState } from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useNotifications } from "../NotificationContext";
import { NotificationDropdown } from "./NotificationDropdown";

export const Navbar = () => {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="h-20 bg-[#0B0B0B]/80 backdrop-blur-md border-b border-[#C9A96E]/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 md:hidden">
        <Menu className="text-[#C9A96E]" size={24} />
        <span className="text-xl font-bold text-[#C9A96E]">GOLDENCOIN</span>
      </div>

      <div className="hidden md:flex items-center gap-4 bg-[#121212] px-4 py-2 rounded-xl border border-[#C9A96E]/10 w-96">
        <Search className="text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search transactions, assets..."
          className="bg-transparent border-none outline-none text-sm w-full text-gray-300 placeholder:text-gray-600"
        />
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden lg:flex items-center gap-6 mr-4">
          <Link to="/faq" className="text-sm font-medium text-gray-400 hover:text-[#C9A96E] transition-colors">FAQ</Link>
          <Link to="/dashboard" className="text-sm font-medium text-gray-400 hover:text-[#C9A96E] transition-colors">Dashboard</Link>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-gray-400 hover:text-[#C9A96E] transition-colors relative"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B0B0B]"></span>
            )}
          </button>
          <NotificationDropdown 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
          />
        </div>

        <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-[#C9A96E]/10 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{profile?.displayName || "User"}</p>
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
