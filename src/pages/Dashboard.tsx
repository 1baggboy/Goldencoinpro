import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  Clock,
  ShieldCheck,
  AlertCircle,
  Zap
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useAuth } from "../AuthContext";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const data = [
  { name: "Mon", value: 4000 },
  { name: "Tue", value: 3000 },
  { name: "Wed", value: 5000 },
  { name: "Thu", value: 4500 },
  { name: "Fri", value: 6000 },
  { name: "Sat", value: 5500 },
  { name: "Sun", value: 7000 },
];

export const Dashboard = () => {
  const { profile, user } = useAuth();
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [activeInvestmentsCount, setActiveInvestmentsCount] = useState(0);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("/api/market/btc-price");
        const data = await res.json();
        setBtcPrice(data.usd);
      } catch (e) {
        console.error("Price fetch error:", e);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);

    // Fetch active investments count
    let unsubInvestments = () => {};
    if (user) {
      const q = query(collection(db, "investments"), where("userId", "==", user.uid), where("status", "==", "active"));
      unsubInvestments = onSnapshot(q, (snap) => {
        setActiveInvestmentsCount(snap.docs.length);
      });
    }

    return () => {
      clearInterval(interval);
      unsubInvestments();
    };
  }, [user]);

  const usdBalance = (profile?.btcBalance || 0) * (btcPrice || 65000);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {profile?.displayName?.split(' ')[0]}!</h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your portfolio today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/deposit" className="px-6 py-3 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center gap-2">
            <ArrowDownCircle size={18} />
            Deposit
          </Link>
          <button className="px-6 py-3 bg-[#121212] text-white font-bold rounded-xl border border-[#C9A96E]/20 hover:bg-[#1A1A1A] transition-all flex items-center gap-2">
            <ArrowUpCircle size={18} />
            Withdraw
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          title="BTC Balance" 
          value={`${profile?.btcBalance?.toFixed(4) || "0.0000"} BTC`} 
          subValue={`≈ $${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Wallet}
          color="gold"
        />
        <StatCard 
          title="Total Deposited" 
          value={`${profile?.totalDeposited?.toFixed(4) || "0.0000"} BTC`} 
          subValue="Lifetime deposits"
          icon={TrendingUp}
          color="green"
        />
        <StatCard 
          title="Active Investments" 
          value={activeInvestmentsCount} 
          subValue={activeInvestmentsCount > 0 ? "Cycles in progress" : "No active plans"}
          icon={Zap}
          color="gold"
        />
        <StatCard 
          title="KYC Status" 
          value={profile?.kycStatus?.replace('_', ' ').toUpperCase() || "NOT SUBMITTED"} 
          subValue={profile?.kycStatus === 'verified' ? "Full access granted" : "Pending verification"}
          icon={profile?.kycStatus === 'verified' ? ShieldCheck : AlertCircle}
          color={profile?.kycStatus === 'verified' ? "green" : "yellow"}
        />
        <StatCard 
          title="Live BTC Price" 
          value={`$${btcPrice?.toLocaleString() || "---"}`} 
          subValue="+2.4% last 24h"
          icon={TrendingUp}
          color="gold"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Portfolio Performance</h3>
            <select className="bg-[#0B0B0B] border border-[#C9A96E]/20 rounded-lg px-3 py-1 text-sm text-gray-400 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(201, 169, 110, 0.2)', borderRadius: '12px' }}
                  itemStyle={{ color: '#C9A96E' }}
                />
                <Area type="monotone" dataKey="value" stroke="#C9A96E" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            <Link to="/transactions" className="text-sm text-[#C9A96E] hover:underline">View all</Link>
          </div>
          <div className="space-y-6">
            <ActivityItem type="deposit" amount="0.0450" status="confirmed" date="2 hours ago" />
            <ActivityItem type="withdrawal" amount="0.0120" status="pending" date="5 hours ago" />
            <ActivityItem type="deposit" amount="0.1000" status="confirmed" date="Yesterday" />
            <ActivityItem type="deposit" amount="0.0250" status="failed" date="2 days ago" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-[#121212] border border-[#C9A96E]/10 p-6 rounded-2xl relative overflow-hidden group"
  >
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
        <p className={cn("text-xs mt-1", color === 'green' ? "text-green-500" : color === 'yellow' ? "text-yellow-500" : "text-gray-400")}>
          {subValue}
        </p>
      </div>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
        color === 'gold' ? "bg-[#C9A96E]/10 text-[#C9A96E]" : 
        color === 'green' ? "bg-green-500/10 text-green-500" : 
        "bg-yellow-500/10 text-yellow-500"
      )}>
        <Icon size={24} />
      </div>
    </div>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#C9A96E]/5 rounded-full blur-2xl group-hover:bg-[#C9A96E]/10 transition-all duration-500"></div>
  </motion.div>
);

const ActivityItem = ({ type, amount, status, date }: any) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center",
        type === 'deposit' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
      )}>
        {type === 'deposit' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
      </div>
      <div>
        <p className="text-sm font-semibold text-white capitalize">{type}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={cn("text-sm font-bold", type === 'deposit' ? "text-green-500" : "text-red-500")}>
        {type === 'deposit' ? '+' : '-'}{amount} BTC
      </p>
      <p className={cn(
        "text-[10px] uppercase tracking-wider font-bold",
        status === 'confirmed' ? "text-green-500" : status === 'pending' ? "text-yellow-500" : "text-red-500"
      )}>
        {status}
      </p>
    </div>
  </div>
);
