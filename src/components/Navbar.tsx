import React, { useState, useEffect } from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../AuthContext";
import { cn } from "../lib/utils";
import { APP_CONFIG } from "../config";
import { useNotifications } from "../NotificationContext";
import { usePrices } from "../PriceContext";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationDropdown } from "../pages/NotificationDropdown";
import { Logo } from "./Logo";
import { SearchPanel } from "./SearchPanel";

export const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const { prices } = usePrices();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const btcPrice = prices?.btc?.usd || 0;
  const btcChange = prices?.btc?.change || 0;

  const globalSearchItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Transactions", path: "/transactions" },
    { name: "Deposit", path: "/deposit" },
    { name: "Withdraw", path: "/withdraw" },
    { name: "KYC", path: "/kyc" },
    { name: "Invest", path: "/invest" },
    { name: "Profile", path: "/profile" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
    { name: "Features", path: "/features" },
    { name: "Security", path: "/security" },
  ];

  return (
    <header className="h-20 lg:h-24 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-[#C9A96E]/10 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50">
      <SearchPanel 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        items={globalSearchItems}
        title="the website"
      />
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMenuClick?.();
          }} 
          className="p-2 lg:p-3 text-[#C9A96E] hover:bg-[#C9A96E]/10 rounded-xl transition-colors relative z-[60] md:hidden"
        >
          <Menu size={24} />
        </button>
        <Link to="/" className="flex items-center gap-2 relative z-50 mr-4">
          <Logo size="sm" className="lg:h-10" />
        </Link>

        {/* Live BTC Ticker in Navbar */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-[#C9A96E]/10">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-[#C9A96E] uppercase tracking-wider">Live BTC</span>
          <span className="text-xs font-mono font-bold">
            {btcPrice > 0 ? `$${btcPrice.toLocaleString()}` : "Connecting..."}
          </span>
          {btcPrice > 0 && (
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
              btcChange >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {btcChange >= 0 ? "+" : ""}{btcChange.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      <div className="hidden lg:flex items-center relative gap-4">
        <button 
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-[#C9A96E] bg-gray-100 dark:bg-slate-900 rounded-2xl border border-[#C9A96E]/10 transition-colors shrink-0 shadow-sm hover:border-[#C9A96E]/40"
        >
          <Search size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
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
