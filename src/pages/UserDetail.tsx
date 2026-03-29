import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Settings
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
import { cn } from "../lib/utils";
import { format } from "date-fns";

const chartData = [
  { name: "Mon", value: 4000 },
  { name: "Tue", value: 3000 },
  { name: "Wed", value: 5000 },
  { name: "Thu", value: 4500 },
  { name: "Fri", value: 6000 },
  { name: "Sat", value: 5500 },
  { name: "Sun", value: 7000 },
];

export const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [btcPrice, setBtcPrice] = useState<number>(65000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Fetch user profile
    const unsubUser = onSnapshot(doc(db, "users", userId), (doc) => {
      if (doc.exists()) {
        setUserProfile({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });

    // Fetch user transactions
    const q = query(collection(db, "transactions"), where("userId", "==", userId));
    const unsubTx = onSnapshot(q, (snap) => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(txs.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)));
    });

    // Fetch BTC price
    fetch("/api/market/btc-price")
      .then(res => res.json())
      .then(data => setBtcPrice(data.usd))
      .catch(console.error);

    return () => {
      unsubUser();
      unsubTx();
    };
  }, [userId]);

  const updateBalance = async (amount: number) => {
    if (!userId) return;
    const newBalance = (userProfile?.btcBalance || 0) + amount;
    await updateDoc(doc(db, "users", userId), { btcBalance: newBalance });
  };

  if (loading) return <div className="flex items-center justify-center h-96 text-[#C9A96E]">Loading user data...</div>;
  if (!userProfile) return <div className="text-center py-20 text-red-500">User not found.</div>;

  const usdBalance = (userProfile?.btcBalance || 0) * btcPrice;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Admin Panel
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => updateBalance(0.1)}
            className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-bold hover:bg-green-500/20 transition-colors"
          >
            +0.1 BTC
          </button>
          <button 
            onClick={() => updateBalance(-0.1)}
            className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors"
          >
            -0.1 BTC
          </button>
        </div>
      </div>

      {/* User Identity Card */}
      <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-24 h-24 bg-[#C9A96E]/10 rounded-3xl flex items-center justify-center text-[#C9A96E] text-4xl font-bold">
          {userProfile.displayName?.charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white mb-2">{userProfile.displayName}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#C9A96E]" />
              {userProfile.email}
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#C9A96E]" />
              Role: <span className="text-white capitalize">{userProfile.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#C9A96E]" />
              Joined: <span className="text-white">{userProfile.createdAt ? format(new Date(userProfile.createdAt), "MMM dd, yyyy") : "---"}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
           <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
            userProfile.kycStatus === 'verified' ? "bg-green-500/10 text-green-500" : 
            userProfile.kycStatus === 'pending' ? "bg-yellow-500/10 text-yellow-500" : 
            "bg-gray-500/10 text-gray-500"
          )}>
            KYC: {userProfile.kycStatus?.replace('_', ' ')}
          </span>
          <p className="text-xs text-gray-500 font-mono">UID: {userProfile.uid}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Current Balance" 
          value={`${userProfile.btcBalance?.toFixed(4)} BTC`} 
          subValue={`≈ $${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={Wallet}
          color="gold"
        />
        <StatCard 
          title="Total Deposited" 
          value={`${userProfile.totalDeposited?.toFixed(4)} BTC`} 
          subValue="Lifetime volume"
          icon={TrendingUp}
          color="green"
        />
        <StatCard 
          title="Live BTC Price" 
          value={`$${btcPrice.toLocaleString()}`} 
          subValue="Market Rate"
          icon={TrendingUp}
          color="gold"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-8">User Portfolio Performance</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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

        {/* Transaction History */}
        <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">User Transactions</h3>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">No transactions found.</p>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      tx.type === 'deposit' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {tx.type === 'deposit' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white capitalize">{tx.type}</p>
                      <p className="text-[10px] text-gray-500">{tx.timestamp ? format(new Date(tx.timestamp), "MMM dd, HH:mm") : "---"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-xs font-bold", tx.type === 'deposit' ? "text-green-500" : "text-red-500")}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount} BTC
                    </p>
                    <p className={cn(
                      "text-[8px] uppercase font-bold",
                      tx.status === 'confirmed' ? "text-green-500" : tx.status === 'pending' ? "text-yellow-500" : "text-red-500"
                    )}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-[#121212] border border-[#C9A96E]/10 p-6 rounded-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
        <p className={cn("text-xs mt-1", color === 'green' ? "text-green-500" : "text-gray-400")}>
          {subValue}
        </p>
      </div>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        color === 'gold' ? "bg-[#C9A96E]/10 text-[#C9A96E]" : "bg-green-500/10 text-green-500"
      )}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);
