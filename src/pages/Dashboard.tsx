import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  Clock,
  ShieldCheck,
  AlertCircle,
  Zap,
  Lock,
  Copy,
  Check,
  Users
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
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestoreErrorHandler";

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
  const { profile, user, isRestricted } = useAuth();
  const [prices, setPrices] = useState<any>(null);
  const [activeInvestmentsCount, setActiveInvestmentsCount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/market/prices");
        const data = await res.json();
        setPrices(data);
      } catch (e) {
        console.error("Price fetch error:", e);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);

    // Fetch active investments count
    let unsubInvestments = () => {};
    let unsubTransactions = () => {};

    if (user) {
      const q = query(collection(db, "investments"), where("userId", "==", user.uid), where("status", "==", "active"));
      unsubInvestments = onSnapshot(q, (snap) => {
        setActiveInvestmentsCount(snap.docs.length);
      }, (error) => handleFirestoreError(error, OperationType.LIST, "investments"));

      const txQ = query(
        collection(db, "transactions"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      unsubTransactions = onSnapshot(txQ, (snap) => {
        setRecentTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (error) => handleFirestoreError(error, OperationType.LIST, "transactions"));
    }

    return () => {
      clearInterval(interval);
      unsubInvestments();
      unsubTransactions();
    };
  }, [user]);

  const usdBalance = (profile?.btcBalance || 0) * (prices?.btc?.usd || 65000);
  const tradingUsdBalance = (profile?.tradingBalanceBtc || 0) * (prices?.btc?.usd || 65000);
  const referralLink = `${window.location.origin}/register?ref=${profile?.referralCode || ''}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isRestricted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Lock size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Account Restricted</h1>
        <p className="text-gray-400 max-w-md mb-8">
          Your account has been restricted due to suspicious activity or a violation of our terms of service. 
          Please contact support to resolve this issue.
        </p>
        <button 
          onClick={() => window.location.href = "mailto:lookuptoadams@gmail.com"}
          className="px-8 py-3 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all"
        >
          Contact Support
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {profile?.displayName?.split(' ')[0]}!</h1>
            <span className="px-2 py-0.5 bg-[#C9A96E]/10 text-[#C9A96E] text-[10px] font-bold rounded-full uppercase tracking-widest border border-[#C9A96E]/20">
              Member
            </span>
          </div>
          <p className="text-gray-400 mt-1">Here's what's happening with your portfolio today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/deposit" className="px-6 py-3 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center gap-2">
            <ArrowDownCircle size={18} />
            Deposit
          </Link>
          <Link to="/withdraw" className="px-6 py-3 bg-[#121212] text-white font-bold rounded-xl border border-[#C9A96E]/20 hover:bg-[#1A1A1A] transition-all flex items-center gap-2">
            <ArrowUpCircle size={18} />
            Withdraw
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          title="Account Balance" 
          value={`$${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          subValue={`${profile?.btcBalance?.toFixed(4) || "0.0000"} BTC`}
          icon={Wallet}
          color="gold"
        />
        <StatCard 
          title="Trading Balance" 
          value={`$${tradingUsdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          subValue={`${profile?.tradingBalanceBtc?.toFixed(4) || "0.0000"} BTC`}
          icon={Zap}
          color="gold"
        />
        <StatCard 
          title="Total Deposited" 
          value={`$${((profile?.totalDeposited || 0) * (prices?.btc?.usd || 65000)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          subValue={`${profile?.totalDeposited?.toFixed(4) || "0.0000"} BTC`}
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
          value={profile?.kycStatus === 'not_submitted' ? "NOT SUBMITTED" : profile?.kycStatus?.replace('_', ' ').toUpperCase() || "NOT SUBMITTED"} 
          subValue={
            profile?.kycStatus === 'verified' ? "Full access granted" : 
            profile?.kycStatus === 'pending' ? "Pending verification" : 
            profile?.kycStatus === 'rejected' ? `Rejected: ${profile.kycRejectionReason || "Please resubmit"}` :
            "Submit ID for verification"
          } 
          icon={profile?.kycStatus === 'verified' ? ShieldCheck : AlertCircle}
          color={profile?.kycStatus === 'verified' ? "green" : profile?.kycStatus === 'pending' ? "yellow" : "red"}
        />
        <StatCard 
          title="Live BTC Price" 
          value={`$${prices?.btc?.usd?.toLocaleString() || "---"}`} 
          subValue={`${prices?.btc?.change >= 0 ? '+' : ''}${prices?.btc?.change?.toFixed(2)}% last 24h`}
          icon={TrendingUp}
          color={prices?.btc?.change >= 0 ? "green" : "red"}
        />
      </div>

      {/* Market Ticker */}
      <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-4 overflow-hidden">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
          <TickerItem symbol="BTC" price={prices?.btc?.usd} change={prices?.btc?.change} />
          <TickerItem symbol="ETH" price={prices?.eth?.usd} change={prices?.eth?.change} />
          <TickerItem symbol="SOL" price={prices?.sol?.usd} change={prices?.sol?.change} />
          <TickerItem symbol="ADA" price={prices?.ada?.usd} change={prices?.ada?.change} />
          {/* Duplicate for seamless loop */}
          <TickerItem symbol="BTC" price={prices?.btc?.usd} change={prices?.btc?.change} />
          <TickerItem symbol="ETH" price={prices?.eth?.usd} change={prices?.eth?.change} />
          <TickerItem symbol="SOL" price={prices?.sol?.usd} change={prices?.sol?.change} />
          <TickerItem symbol="ADA" price={prices?.ada?.usd} change={prices?.ada?.change} />
        </div>
      </div>

      {/* Content Grid */}
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

        {/* Referral & Activity Column */}
        <div className="space-y-8">
          {/* Referral Card */}
          <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#C9A96E]/10 text-[#C9A96E] rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Refer & Earn</h3>
                <p className="text-xs text-gray-500">Invite friends and earn BTC</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#0B0B0B] border border-[#C9A96E]/20 rounded-xl p-3 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-400 truncate flex-1">{referralLink}</span>
                <button 
                  onClick={copyReferral}
                  className="p-2 hover:bg-[#C9A96E]/10 text-[#C9A96E] rounded-lg transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-[#C9A96E]/10">
                <span className="text-sm text-gray-400">Bonus Earned</span>
                <span className="text-sm font-bold text-[#C9A96E]">{profile?.referralBonusEarned?.toFixed(6) || "0.000000"} BTC</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
              <Link to="/transactions" className="text-sm text-[#C9A96E] hover:underline">View all</Link>
            </div>
            <div className="space-y-6">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <ActivityItem 
                    key={tx.id}
                    type={tx.type} 
                    amount={tx.amountBtc || tx.amount} 
                    status={tx.status} 
                    date={tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Pending'} 
                  />
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
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
        <p className={cn("text-xs mt-1", color === 'green' ? "text-green-500" : color === 'yellow' ? "text-yellow-500" : color === 'red' ? "text-red-500" : "text-gray-400")}>
          {subValue}
        </p>
      </div>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
        color === 'gold' ? "bg-[#C9A96E]/10 text-[#C9A96E]" : 
        color === 'green' ? "bg-green-500/10 text-green-500" : 
        color === 'red' ? "bg-red-500/10 text-red-500" :
        "bg-yellow-500/10 text-yellow-500"
      )}>
        <Icon size={24} />
      </div>
    </div>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#C9A96E]/5 rounded-full blur-2xl group-hover:bg-[#C9A96E]/10 transition-all duration-500"></div>
  </motion.div>
);

const TickerItem = ({ symbol, price, change }: any) => (
  <div className="inline-flex items-center gap-3 px-6 border-r border-[#C9A96E]/10 last:border-none">
    <span className="text-sm font-bold text-white">{symbol}</span>
    <span className="text-sm font-medium text-gray-300">${price?.toLocaleString() || "---"}</span>
    <span className={cn("text-xs font-bold", (change || 0) >= 0 ? "text-green-500" : "text-red-500")}>
      {(change || 0) >= 0 ? '+' : ''}{(change || 0).toFixed(2)}%
    </span>
  </div>
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
      <div className="flex flex-col items-end">
        <p className={cn(
          "text-[10px] uppercase tracking-wider font-bold",
          status === 'confirmed' ? "text-green-500" : status === 'pending' ? "text-yellow-500" : "text-red-500"
        )}>
          {status}
        </p>
        {status === 'failed' && (
          <p className="text-[8px] text-red-400 italic">Rejected</p>
        )}
      </div>
    </div>
  </div>
);
