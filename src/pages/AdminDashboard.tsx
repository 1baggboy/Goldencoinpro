import React, { useEffect, useState } from "react";
import { 
  Users, 
  ArrowDownCircle, 
  ShieldCheck, 
  TrendingUp,
  Search,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  Eye
} from "lucide-react";
import { collection, query, onSnapshot, doc, updateDoc, increment, getDocs, where } from "firebase/firestore";
import { db } from "../firebase";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    activeKyc: 0,
    activeInvestments: 0
  });

  useEffect(() => {
    // Fetch users
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const u = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(u);
      setStats(prev => ({ ...prev, totalUsers: u.length }));
    });

    // Fetch active investments count
    const qI = query(collection(db, "investments"), where("status", "==", "active"));
    const unsubI = onSnapshot(qI, (snap) => {
      setStats(prev => ({ ...prev, activeInvestments: snap.docs.length }));
    });

    // Fetch pending transactions
    const qT = query(collection(db, "transactions"), where("status", "==", "pending"));
    const unsubT = onSnapshot(qT, (snap) => {
      const t = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingDeposits(t);
    });

    // Fetch pending KYC
    const qK = query(collection(db, "kyc_submissions"), where("status", "==", "pending"));
    const unsubK = onSnapshot(qK, (snap) => {
      const k = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingKyc(k);
    });

    return () => {
      unsubUsers();
      unsubT();
      unsubK();
    };
  }, []);

  const approveDeposit = async (tx: any) => {
    try {
      // Update transaction
      await updateDoc(doc(db, "transactions", tx.id), {
        status: "confirmed"
      });
      // Update user balance
      await updateDoc(doc(db, "users", tx.userId), {
        btcBalance: increment(tx.amount),
        totalDeposited: increment(tx.amount)
      });
    } catch (e) {
      console.error("Approve deposit error:", e);
    }
  };

  const rejectDeposit = async (txId: string) => {
    await updateDoc(doc(db, "transactions", txId), { status: "failed" });
  };

  const approveKyc = async (kyc: any) => {
    await updateDoc(doc(db, "kyc_submissions", kyc.id), { status: "approved" });
    await updateDoc(doc(db, "users", kyc.userId), { kycStatus: "verified" });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center text-[#C9A96E]">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Control Panel</h1>
          <p className="text-gray-400">Manage users, deposits, and KYC verifications.</p>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <AdminStatCard title="Active Investments" value={stats.activeInvestments} icon={TrendingUp} color="green" />
        <AdminStatCard title="Pending Deposits" value={pendingDeposits.length} icon={ArrowDownCircle} color="yellow" />
        <AdminStatCard title="Pending KYC" value={pendingKyc.length} icon={ShieldCheck} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Deposits */}
        <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowDownCircle size={20} className="text-yellow-500" />
            Pending Deposits
          </h3>
          <div className="space-y-4">
            {pendingDeposits.length === 0 ? (
              <p className="text-sm text-gray-500 py-10 text-center">No pending deposits.</p>
            ) : (
              pendingDeposits.map(tx => (
                <div key={tx.id} className="p-4 bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-bold text-white">{tx.amount} BTC</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{tx.txHash.substring(0, 16)}...</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => approveDeposit(tx)}
                      className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => rejectDeposit(tx.id)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending KYC */}
        <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-500" />
            Pending KYC
          </h3>
          <div className="space-y-4">
            {pendingKyc.length === 0 ? (
              <p className="text-sm text-gray-500 py-10 text-center">No pending KYC requests.</p>
            ) : (
              pendingKyc.map(kyc => (
                <div key={kyc.id} className="p-4 bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-bold text-white">{kyc.fullName}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{kyc.idType.replace('_', ' ')}: {kyc.idNumber}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => approveKyc(kyc)}
                      className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#C9A96E]/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">All Users</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-[#C9A96E]/40"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0B0B]/50 border-b border-[#C9A96E]/10">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">BTC Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">KYC Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A96E]/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[#C9A96E]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#C9A96E]/10 rounded-full flex items-center justify-center text-[#C9A96E] text-xs font-bold">
                        {u.displayName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{u.displayName}</p>
                        <p className="text-[10px] text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[#C9A96E]">{u.btcBalance?.toFixed(4)} BTC</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      u.kycStatus === 'verified' ? "bg-green-500/10 text-green-500" : 
                      u.kycStatus === 'pending' ? "bg-yellow-500/10 text-yellow-500" : 
                      "bg-gray-500/10 text-gray-500"
                    )}>
                      {u.kycStatus?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.createdAt ? format(new Date(u.createdAt), "MMM dd, yyyy") : "---"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/admin/user/${u.id}`}
                        className="p-2 text-gray-500 hover:text-[#C9A96E] transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                      <button className="p-2 text-gray-500 hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminStatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-[#121212] border border-[#C9A96E]/10 p-6 rounded-2xl flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-white">{value}</h4>
    </div>
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center",
      color === 'yellow' ? "bg-yellow-500/10 text-yellow-500" : 
      color === 'blue' ? "bg-blue-500/10 text-blue-500" : 
      "bg-[#C9A96E]/10 text-[#C9A96E]"
    )}>
      <Icon size={24} />
    </div>
  </div>
);
