import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  History, 
  ShieldCheck, 
  Settings, 
  LogOut,
  UserCog,
  TrendingUp,
  MessageSquare,
  X,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { auth } from "../firebase";
import { cn } from "../lib/utils";
import { useTheme } from "../ThemeContext";

export const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Deposit BTC", icon: ArrowUpCircle, path: "/deposit" },
    { name: "Invest BTC", icon: TrendingUp, path: "/invest" },
    { name: "Transactions", icon: History, path: "/transactions" },
    { name: "KYC Verification", icon: ShieldCheck, path: "/kyc" },
    { name: "Profile", icon: Settings, path: "/profile" },
    { name: "Support", icon: MessageSquare, path: "mailto:lookuptoadams@gmail.com", isExternal: true },
  ];

  if (isAdmin) {
    menuItems.push({ name: "Admin Panel", icon: UserCog, path: "/admin" });
    menuItems.push({ name: "Support Chats", icon: MessageSquare, path: "/admin/support" });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-64 bg-white dark:bg-slate-950 border-r border-[#C9A96E]/20 flex flex-col z-[70] transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Goldencoinpro (1).webp" alt="GOLDENCOIN" className="h-10 w-auto" referrerPolicy="no-referrer" />
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white md:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item: any) => {
            const content = (
              <>
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </>
            );
            const className = cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location.pathname === item.path
                ? "bg-[#C9A96E] text-[#0B0B0B]"
                : "text-gray-600 dark:text-gray-400 hover:bg-[#C9A96E]/10 hover:text-[#C9A96E]"
            );

            if (item.isExternal) {
              return (
                <a key={item.path} href={item.path} className={className}>
                  {content}
                </a>
              );
            }

            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={className}
                onClick={onClose}
              >
                {content}
              </Link>
            );
          })}
        </nav>

      <div className="p-4 border-t border-[#C9A96E]/10 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 dark:text-gray-400 hover:bg-[#C9A96E]/10 hover:text-[#C9A96E] transition-all duration-200"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span className="font-medium">{theme === 'light' ? "Dark Mode" : "Light Mode"}</span>
        </button>
        <button
          onClick={() => auth.signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
    </>
  );
};
