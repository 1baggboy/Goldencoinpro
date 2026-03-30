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
  MessageSquare
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { auth } from "../firebase";
import { cn } from "../lib/utils";

export const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

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
  }

  return (
    <aside className="w-64 bg-[#121212] border-r border-[#C9A96E]/20 flex flex-col hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.svg" alt="GOLDENCOIN" className="h-10 w-auto" referrerPolicy="no-referrer" />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
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
              : "text-gray-400 hover:bg-[#C9A96E]/10 hover:text-[#C9A96E]"
          );

          if (item.isExternal) {
            return (
              <a key={item.path} href={item.path} className={className}>
                {content}
              </a>
            );
          }

          return (
            <Link key={item.path} to={item.path} className={className}>
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#C9A96E]/10">
        <button
          onClick={() => auth.signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
