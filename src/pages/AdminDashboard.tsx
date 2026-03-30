import React, { useEffect, useState } from "react";
import { 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle,
  ShieldCheck, 
  TrendingUp,
  Search,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  Eye,
  ShieldAlert,
  Shield,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useNotifications } from "../NotificationContext";
import { collection, query, onSnapshot, doc, updateDoc, increment, getDocs, where } from "firebase/firestore";
import { db } from "../firebase";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export const AdminDashboard = () => {
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("joined");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKyc, setFilterKyc] = useState("all");
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
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

    // Fetch pending deposits
    const qD = query(collection(db, "transactions"), where("status", "==", "pending"), where("type", "==", "deposit"));
    const unsubD = onSnapshot(qD, (snap) => {
      const t = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingDeposits(t);
    });

    // Fetch pending withdrawals
    const qW = query(collection(db, "transactions"), where("status", "==", "pending"), where("type", "==", "withdrawal"));
    const unsubW = onSnapshot(qW, (snap) => {
      const t = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingWithdrawals(t);
    });

    // Fetch pending KYC
    const qK = query(collection(db, "kyc_submissions"), where("status", "==", "pending"));
    const unsubK = onSnapshot(qK, (snap) => {
      const k = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingKyc(k);
    });

    return () => {
      unsubUsers();
      unsubI();
      unsubD();
      unsubW();
      unsubK();
    };
  }, []);

  const approveDeposit = async (tx: any) => {
    try {
      await updateDoc(doc(db, "transactions", tx.id), { status: "confirmed" });
      await updateDoc(doc(db, "users", tx.userId), {
        btcBalance: increment(tx.amount),
        totalDeposited: increment(tx.amount)
      });
      await addNotification(tx.userId, "Deposit Approved", `Your deposit of ${tx.amount} BTC has been confirmed and added to your balance.`, "success");
    } catch (e) {
      console.error("Approve deposit error:", e);
    }
  };

  const approveWithdrawal = async (tx: any) => {
    try {
      await updateDoc(doc(db, "transactions", tx.id), { status: "confirmed" });
      await updateDoc(doc(db, "users", tx.userId), {
        btcBalance: increment(-tx.amount)
      });
      await addNotification(tx.userId, "Withdrawal Approved", `Your withdrawal request for ${tx.amount} BTC has been approved and processed.`, "success");
    } catch (e) {
      console.error("Approve withdrawal error:", e);
    }
  };

  const rejectTransaction = async (txId: string, userId: string, type: string, amount: number) => {
    await updateDoc(doc(db, "transactions", txId), { status: "failed" });
    await addNotification(userId, `${type.charAt(0).toUpperCase() + type.slice(1)} Rejected`, `Your ${type} request for ${amount} BTC has been rejected. Please contact support for more information.`, "error");
  };

  const approveKyc = async (kyc: any) => {
    await updateDoc(doc(db, "kyc_submissions", kyc.id), { status: "approved" });
    await updateDoc(doc(db, "users", kyc.userId), { kycStatus: "verified" });
    await addNotification(kyc.userId, "KYC Verified", "Your KYC verification has been approved. You can now access all features, including withdrawals.", "success");
  };

  const rejectKyc = async (kycId: string, userId: string) => {
    await updateDoc(doc(db, "kyc_submissions", kycId), { status: "rejected" });
    await updateDoc(doc(db, "users", userId), { kycStatus: "rejected" });
    await addNotification(userId, "KYC Rejected", "Your KYC verification has been rejected. Please review your documents and try again.", "error");
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'restricted' ? 'active' : 'restricted';
    try {
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      await addNotification(userId, 
        newStatus === 'restricted' ? "Account Restricted" : "Account Activated", 
        newStatus === 'restricted' ? 
          "Your account has been restricted. Please contact support for more information." : 
          "Your account has been activated. You can now access all features.",
        newStatus === 'restricted' ? "warning" : "success"
      );
    } catch (e) {
      console.error("Toggle user status error:", e);
    }
  };

  const filteredAndSortedUsers = users
    .filter(u => {
      const matchesSearch = 
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || (u.status || "active") === filterStatus;
      const matchesKyc = filterKyc === "all" || u.kycStatus === filterKyc;
      return matchesSearch && matchesStatus && matchesKyc;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") comparison = (a.displayName || "").localeCompare(b.displayName || "");
      if (sortBy === "balance") comparison = (a.btcBalance || 0) - (b.btcBalance || 0);
      if (sortBy === "joined") comparison = (a.createdAt || 0) - (b.createdAt || 0);
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <AdminStatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <AdminStatCard title="Active Plans" value={stats.activeInvestments} icon={TrendingUp} color="green" />
        <AdminStatCard title="Pending Deposits" value={pendingDeposits.length} icon={ArrowDownCircle} color="yellow" />
        <AdminStatCard title="Pending Withdraws" value={pendingWithdrawals.length} icon={ArrowUpCircle} color="red" />
        <AdminStatCard title="Pending KYC" value={pendingKyc.length} icon={ShieldCheck} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <p className="text-[10px] text-gray-500 font-mono mt-1">{tx.txHash?.substring(0, 16)}...</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => approveDeposit(tx)}
                      className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => rejectTransaction(tx.id, tx.userId, tx.type, tx.amount)}
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

        {/* Pending Withdrawals */}
        <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowUpCircle size={20} className="text-red-500" />
            Pending Withdraws
          </h3>
          <div className="space-y-4">
            {pendingWithdrawals.length === 0 ? (
              <p className="text-sm text-gray-500 py-10 text-center">No pending withdrawals.</p>
            ) : (
              pendingWithdrawals.map(tx => (
                <div key={tx.id} className="p-4 bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-bold text-white">{tx.amount} BTC</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">{tx.walletAddress?.substring(0, 16)}...</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => approveWithdrawal(tx)}
                      className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => rejectTransaction(tx.id, tx.userId, tx.type, tx.amount)}
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
                    <p className="text-xs text-gray-500 mt-1 capitalize">{kyc.idType?.replace('_', ' ')}: {kyc.idNumber}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => approveKyc(kyc)}
                      className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => rejectKyc(kyc.id, kyc.userId)}
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
      </div>

      {/* User Management Table */}
      <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#C9A96E]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white">All Users</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-[#C9A96E]/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#C9A96E]" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-lg py-2 px-3 text-xs text-gray-400 outline-none focus:border-[#C9A96E]/40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="restricted">Restricted</option>
              </select>
              <select 
                value={filterKyc}
                onChange={(e) => setFilterKyc(e.target.value)}
                className="bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-lg py-2 px-3 text-xs text-gray-400 outline-none focus:border-[#C9A96E]/40"
              >
                <option value="all">All KYC</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="not_submitted">Not Submitted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0B0B]/50 border-b border-[#C9A96E]/10">
                <th 
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-[#C9A96E] transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    User
                    <ArrowUpDown size={12} className={sortBy === "name" ? "text-[#C9A96E]" : "text-gray-600"} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-[#C9A96E] transition-colors"
                  onClick={() => handleSort("balance")}
                >
                  <div className="flex items-center gap-2">
                    BTC Balance
                    <ArrowUpDown size={12} className={sortBy === "balance" ? "text-[#C9A96E]" : "text-gray-600"} />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">KYC Status</th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-[#C9A96E] transition-colors"
                  onClick={() => handleSort("joined")}
                >
                  <div className="flex items-center gap-2">
                    Joined
                    <ArrowUpDown size={12} className={sortBy === "joined" ? "text-[#C9A96E]" : "text-gray-600"} />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A96E]/5">
              {filteredAndSortedUsers.map(u => (
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
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        u.status === 'restricted' ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                      )}>
                        {u.status || 'active'}
                      </span>
                      <button 
                        onClick={() => toggleUserStatus(u.id, u.status || 'active')}
                        className={cn(
                          "p-1 rounded-md transition-colors",
                          u.status === 'restricted' ? "text-green-500 hover:bg-green-500/10" : "text-red-500 hover:bg-red-500/10"
                        )}
                        title={u.status === 'restricted' ? "Activate User" : "Restrict User"}
                      >
                        {u.status === 'restricted' ? <Shield size={14} /> : <ShieldAlert size={14} />}
                      </button>
                    </div>
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
      color === 'red' ? "bg-red-500/10 text-red-500" :
      color === 'green' ? "bg-green-500/10 text-green-500" :
      "bg-[#C9A96E]/10 text-[#C9A96E]"
    )}>
      <Icon size={24} />
    </div>
  </div>
);
