import React, { useEffect, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
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
  Users,
  Inbox
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
import { APP_CONFIG } from "../config";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { cn, fetchCryptoPrices } from "../lib/utils";
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
  const navigate = useNavigate();
  const { profile, user, isRestricted } = useAuth();
  const [prices, setPrices] = useState<any>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [activeInvestmentsCount, setActiveInvestmentsCount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await fetchCryptoPrices(); 
        setPrices(data);
        setPriceError(null);
      } catch (e) {
        setPriceError("Unable to load live market data. Some balances may be estimations.");
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, APP_CONFIG.btcPriceUpdateInterval);

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
        orderBy("timestamp", "desc"),
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

  const usdBalance = profile?.usdBalance || 0;
  const tradingUsdBalance = (profile?.tradingBalanceBtc || 0) * (prices?.btc?.usd || 65000);

  const copyReferralCode = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          onClick={() => window.location.href = `mailto:${APP_CONFIG.supportEmail}`}
          className="px-8 py-3 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all"
        >
          Contact Support
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-12 text-[#0B0B0B] dark:text-white pb-8 lg:pb-12 font-sans transition-all duration-300">
      <ReactTooltip id="dashboard-tooltip" className="z-50" />
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 lg:gap-6">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold tracking-tight font-display transition-all">Welcome back, {profile?.displayName?.split(' ')[0]}!</h1>
            <span className="hidden sm:inline-block px-3 py-1 bg-[#C9A96E]/10 text-[#C9A96E] text-[10px] font-bold rounded-full uppercase tracking-[0.2em] border border-[#C9A96E]/20">
              Member
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2 text-sm lg:text-lg opacity-80">Here's what's happening with your portfolio today.</p>
        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          <Link to="/deposit" className="flex-1 sm:flex-none px-6 lg:px-8 py-3 lg:py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl lg:rounded-2xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C9A96E]/20">
            <ArrowDownCircle size={18} className="lg:size-5" />
            Deposit BTC
          </Link>
          <Link to="/withdraw" className="flex-1 sm:flex-none px-6 lg:px-8 py-3 lg:py-4 bg-slate-200 dark:bg-slate-900 text-[#0B0B0B] dark:text-white font-bold rounded-xl lg:rounded-2xl border border-[#C9A96E]/20 hover:bg-slate-300 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            <ArrowUpCircle size={18} className="lg:size-5" />
            Withdraw
          </Link>
        </div>
      </div>

      {priceError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} />
          {priceError}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-8">
        <StatCard 
          title="Account Balance" 
          value={`$${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          subValue={`${(usdBalance / (prices?.btc?.usd || 65000)).toFixed(4) || "0.0000"} BTC`}
          icon={Wallet}
          color="gold"
        />
        <StatCard 
          title="Trading Balance" 
          value={`${profile?.tradingBalanceBtc?.toFixed(4) || "0.0000"} BTC`}
          subValue={`$${tradingUsdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Zap}
          color="gold"
        />
        <StatCard 
          title="Total Deposited" 
          value={`$${(profile?.totalDepositedUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          subValue={`Total USD deposited`}
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
          onClick={() => navigate('/kyc')}
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
      <div className="bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-4 overflow-hidden">
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
        <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#0B0B0B] dark:text-white">Portfolio Performance</h3>
            <select className="bg-slate-200 dark:bg-slate-950 border border-[#C9A96E]/20 rounded-lg px-3 py-1 text-sm text-gray-600 dark:text-gray-400 outline-none">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#C9A96E" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#E0E0E0', borderColor: 'rgba(201, 169, 110, 0.2)', borderRadius: '12px' }}
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
          <div className="bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#C9A96E]/10 text-[#C9A96E] rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B0B0B] dark:text-white">Refer and Earn Cash</h3>
                <p className="text-xs text-gray-600 dark:text-gray-500">Invite friends and earn cash bonuses</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-600 dark:text-gray-500 uppercase font-bold tracking-widest ml-1">Referral Code</label>
                <div className="bg-slate-200 dark:bg-slate-950 border border-[#C9A96E]/20 rounded-xl p-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#0B0B0B] dark:text-white font-mono">{profile?.referralCode}</span>
                  <button 
                    onClick={copyReferralCode}
                    data-tooltip-id="dashboard-tooltip"
                    data-tooltip-content="Copy Referral Code"
                    className="p-2 hover:bg-[#C9A96E]/10 text-[#C9A96E] rounded-lg transition-all"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-[#C9A96E]/10">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bonus Earned</span>
                <span className="text-sm font-bold text-[#C9A96E]">${profile?.referralBonusEarned?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#0B0B0B] dark:text-white">Recent Activity</h3>
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
                <div className="text-center py-8 flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-950 rounded-full flex items-center justify-center text-gray-500 mb-3">
                    <Inbox size={24} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon: Icon, color, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className={cn(
      "bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 p-6 rounded-2xl relative overflow-hidden group",
      onClick && "cursor-pointer hover:border-[#C9A96E]/30"
    )}
  >
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-500 font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-[#0B0B0B] dark:text-white tracking-tight">{value}</h4>
        <p className={cn("text-xs mt-1", color === 'green' ? "text-green-600 dark:text-green-500" : color === 'yellow' ? "text-yellow-600 dark:text-yellow-500" : color === 'red' ? "text-red-600 dark:text-red-500" : "text-gray-500 dark:text-gray-400")}>
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
    <span className="text-sm font-bold text-[#0B0B0B] dark:text-white">{symbol}</span>
    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">${price?.toLocaleString() || "---"}</span>
    <span className={cn("text-xs font-bold", (change || 0) >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500")}>
      {(change || 0) >= 0 ? '+' : ''}{(change || 0).toFixed(2)}%
    </span>
  </div>
);

const ActivityItem = ({ type, amount, status, date }: any) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center",
        type === 'deposit' ? "bg-green-500/10 text-green-600 dark:text-green-500" : "bg-red-500/10 text-red-600 dark:text-red-500"
      )}>
        {type === 'deposit' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#0B0B0B] dark:text-white capitalize">{type}</p>
        <p className="text-xs text-gray-600 dark:text-gray-500">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={cn("text-sm font-bold", type === 'deposit' ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500")}>
        {type === 'deposit' ? '+' : '-'}{amount} BTC
      </p>
      <div className="flex flex-col items-end">
        <p className={cn(
          "text-[10px] uppercase tracking-wider font-bold",
          status === 'confirmed' ? "text-green-600 dark:text-green-500" : status === 'pending' ? "text-yellow-600 dark:text-yellow-500" : "text-red-600 dark:text-red-500"
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
