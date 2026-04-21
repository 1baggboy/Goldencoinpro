import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip } from "react-tooltip";
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
  Filter,
  Camera,
  MessageSquare,
  Inbox
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { APP_CONFIG } from "../config";
import { useNotifications } from "../NotificationContext";
import { collection, query, onSnapshot, doc, updateDoc, increment, getDocs, where, getDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db, auth } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestoreErrorHandler";
import { cn, fetchBtcPrice as fetchBtcPriceUtil } from "../lib/utils";
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
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTxRejectModal, setShowTxRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingKyc, setRejectingKyc] = useState<{ id: string, userId: string } | null>(null);
  const [rejectingTx, setRejectingTx] = useState<{ id: string, userId: string, type: string, amount: number } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [btcPrice, setBtcPrice] = useState<number>(65000);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    activeKyc: 0,
    activeInvestments: 0,
    activeChats: 0
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch users
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const u = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(u);
      setStats(prev => ({ ...prev, totalUsers: u.length }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "users"));

    // Fetch active investments count
    const qI = query(collection(db, "investments"), where("status", "==", "active"));
    const unsubI = onSnapshot(qI, (snap) => {
      setStats(prev => ({ ...prev, activeInvestments: snap.docs.length }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "investments"));

    // Fetch pending deposits
    const qD = query(collection(db, "transactions"), where("status", "==", "pending"), where("type", "==", "deposit"));
    const unsubD = onSnapshot(qD, (snap) => {
      const t = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingDeposits(t);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "transactions"));

    // Fetch pending withdrawals
    const qW = query(collection(db, "transactions"), where("status", "==", "pending"), where("type", "==", "withdrawal"));
    const unsubW = onSnapshot(qW, (snap) => {
      const t = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingWithdrawals(t);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "transactions"));

    // Fetch pending KYC
    const qK = query(collection(db, "kyc_submissions"), where("status", "==", "pending"));
    const unsubK = onSnapshot(qK, (snap) => {
      const k = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingKyc(k);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "kyc_submissions"));

    // Fetch active chats count (unread)
    const unsubChats = onSnapshot(collection(db, "support_chats"), (snap) => {
      const allMsgs = snap.docs.map(d => d.data());
      const unreadUserIds = new Set(allMsgs.filter(m => m.sender === 'user' && m.read === false).map(m => m.userId));
      setStats(prev => ({ ...prev, activeChats: unreadUserIds.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "support_chats"));

    // Fetch BTC Price
    const fetchBtcPrice = async () => {
      try {
        const data = await fetchBtcPriceUtil(); setBtcPrice(data.usd);
      } catch (e) {
        console.error("BTC price fetch error:", e);
      }
    };
    fetchBtcPrice();
    const priceInterval = setInterval(fetchBtcPrice, APP_CONFIG.btcPriceUpdateInterval);

    return () => {
      unsubUsers();
      unsubI();
      unsubD();
      unsubW();
      unsubK();
      unsubChats();
      clearInterval(priceInterval);
    };
  }, []);

  const approveDeposit = async (tx: any) => {
    try {
      const amountBtc = Number(tx.amountBtc || tx.amount || 0);
      const amountUsd = Number(tx.amountUsd || 0);
      
      if (amountBtc <= 0) {
        throw new Error("Invalid deposit amount.");
      }
      
      await updateDoc(doc(db, "transactions", tx.id), { status: "confirmed" });
      
      // Update user balance
      await updateDoc(doc(db, "users", tx.userId), {
        btcBalance: increment(amountBtc),
        tradingBalanceBtc: increment(amountBtc),
        totalDeposited: increment(amountBtc)
      });

      // Referral bonus is now handled at registration in Register.tsx
      /*
      const userSnap = await getDoc(doc(db, "users", tx.userId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.referredBy && !userData.hasTraded) {
          const REFERRAL_BONUS_BTC = 0.0005; // Example bonus amount
          
          // Credit referrer
          await updateDoc(doc(db, "users", userData.referredBy), {
            btcBalance: increment(REFERRAL_BONUS_BTC),
            referralBonusEarned: increment(REFERRAL_BONUS_BTC)
          });
          
          // Mark user as having triggered the bonus
          await updateDoc(doc(db, "users", tx.userId), {
            hasTraded: true
          });

          await addNotification(userData.referredBy, "Referral Bonus Received", `You've earned ${REFERRAL_BONUS_BTC} BTC as a bonus for referring ${userData.displayName}.`, "success");
        }
      }
      */

      await addNotification(tx.userId, "Deposit Approved", `Your deposit of ${amountBtc} BTC ($${amountUsd}) has been confirmed and added to your balance.`, "success");
    } catch (e: any) {
      console.error("Approve deposit error:", e);
      alert("Failed to approve deposit: " + (e.message || "Unknown error"));
    }
  };

  const approveWithdrawal = async (tx: any) => {
    try {
      const amountBtc = Number(tx.amountBtc || tx.amount || 0);
      const amountUsd = Number(tx.amountUsd || 0);

      if (amountBtc <= 0) {
        throw new Error("Invalid withdrawal amount.");
      }

      // Check user balance before approving
      const userSnap = await getDoc(doc(db, "users", tx.userId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if ((userData.btcBalance || 0) < amountBtc) {
          throw new Error("User has insufficient balance for this withdrawal.");
        }
      } else {
        throw new Error("User not found.");
      }

      await updateDoc(doc(db, "transactions", tx.id), { status: "confirmed" });
      await updateDoc(doc(db, "users", tx.userId), {
        btcBalance: increment(-amountBtc),
        tradingBalanceBtc: increment(-amountBtc)
      });
      await addNotification(tx.userId, "Withdrawal Approved", `Your withdrawal request for ${amountBtc} BTC ($${amountUsd}) has been approved and processed.`, "success");
    } catch (e: any) {
      console.error("Approve withdrawal error:", e);
      alert("Failed to approve withdrawal: " + (e.message || "Unknown error"));
    }
  };

  const handleRejectTransaction = async () => {
    if (!rejectingTx || !rejectReason.trim()) return;
    try {
      const amountBtc = Number(rejectingTx.amount || 0);
      await updateDoc(doc(db, "transactions", rejectingTx.id), { 
        status: "failed",
        rejectionReason: rejectReason
      });
      await addNotification(rejectingTx.userId, `${rejectingTx.type.charAt(0).toUpperCase() + rejectingTx.type.slice(1)} Rejected`, `Your ${rejectingTx.type} request for ${amountBtc} BTC has been rejected. Reason: ${rejectReason}`, "error");
      setShowTxRejectModal(false);
      setRejectReason("");
      setRejectingTx(null);
      setSelectedTx(null);
    } catch (error) {
      console.error("Error rejecting transaction:", error);
    }
  };

  const initiateRejectTx = (tx: any) => {
    setRejectingTx({ id: tx.id, userId: tx.userId, type: tx.type, amount: tx.amountBtc || tx.amount });
    setShowTxRejectModal(true);
  };

  const approveKyc = async (kyc: any) => {
    try {
      if (!kyc.id || !kyc.userId) {
        throw new Error("Invalid KYC submission data (missing id or userId).");
      }
      await updateDoc(doc(db, "kyc_submissions", kyc.id), { status: "approved" });
      await updateDoc(doc(db, "users", kyc.userId), { kycStatus: "verified" });
      await addNotification(kyc.userId, "KYC Verified", "Your KYC verification has been approved. You can now access all features, including withdrawals.", "success");
      setSelectedKyc(null);
    } catch (error: any) {
      console.error("Error approving KYC:", error);
      alert("Failed to approve KYC: " + (error.message || "Unknown error"));
    }
  };

  const handleRejectKyc = async () => {
    if (!rejectingKyc || !rejectReason.trim()) return;
    try {
      await updateDoc(doc(db, "kyc_submissions", rejectingKyc.id), { 
        status: "rejected",
        rejectionReason: rejectReason 
      });
      await updateDoc(doc(db, "users", rejectingKyc.userId), { 
        kycStatus: "rejected",
        kycRejectionReason: rejectReason 
      });
      await addNotification(rejectingKyc.userId, "KYC Rejected", `Your KYC verification was rejected. Reason: ${rejectReason}`, "error");
      setShowRejectModal(false);
      setRejectReason("");
      setRejectingKyc(null);
      setSelectedKyc(null);
    } catch (error) {
      console.error("Error rejecting KYC:", error);
    }
  };

  const initiateRejectKyc = (id: string, userId: string) => {
    setRejectingKyc({ id, userId });
    setShowRejectModal(true);
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

  const resetSystemData = async () => {
    if (!window.confirm("CRITICAL: This will reset ALL user balances to 0 and delete ALL transactions, investments, and KYC submissions. This action cannot be undone. Are you absolutely sure?")) {
      return;
    }

    setIsResetting(true);
    try {
      console.log("Starting system reset...");
      
      const collectionsToClear = ["transactions", "investments", "kyc_submissions", "notifications"];
      let totalDeleted = 0;

      // 1. Reset all user balances (using batches of 500)
      const usersSnap = await getDocs(collection(db, "users"));
      console.log(`Found ${usersSnap.size} users to reset.`);
      
      let batch = writeBatch(db);
      let count = 0;

      for (const userDoc of usersSnap.docs) {
        batch.update(doc(db, "users", userDoc.id), {
          btcBalance: 0,
          usdBalance: 0,
          tradingBalanceBtc: 0,
          totalDeposited: 0,
          totalDepositedUsd: 0,
          referralBonusEarned: 0,
          kycStatus: "not_submitted"
        });
        count++;
        if (count === 500) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }
      if (count > 0) await batch.commit();
      console.log("User balances reset.");

      // 2. Delete other collections
      for (const colName of collectionsToClear) {
        const snap = await getDocs(collection(db, colName));
        console.log(`Deleting ${snap.size} documents from ${colName}...`);
        
        batch = writeBatch(db);
        count = 0;
        for (const d of snap.docs) {
          batch.delete(doc(db, colName, d.id));
          count++;
          totalDeleted++;
          if (count === 500) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        }
        if (count > 0) await batch.commit();
      }

      console.log(`System reset complete. Total documents deleted: ${totalDeleted}`);
      alert("System data has been successfully reset.");
    } catch (error: any) {
      console.error("Reset error:", error);
      alert("Failed to reset system data: " + (error.code ? `[${error.code}] ` : "") + error.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <Tooltip id="admin-tooltip" className="z-50" />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center text-[#C9A96E]">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Control Panel</h1>
          <p className="text-gray-400">Manage users, deposits, and KYC verifications.</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={resetSystemData}
            disabled={isResetting}
            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <ShieldAlert size={18} />
            {isResetting ? "Resetting..." : "Reset System Data"}
          </button>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        <AdminStatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <AdminStatCard title="Active Plans" value={stats.activeInvestments} icon={TrendingUp} color="green" />
        <AdminStatCard title="Pending KYC" value={pendingKyc.length} icon={ShieldCheck} color="blue" />
        <AdminStatCard 
          title="Unread Chats" 
          value={stats.activeChats} 
          icon={MessageSquare} 
          color="gold" 
          link="/admin/support" 
          badge={stats.activeChats > 0}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Pending Deposits */}
        <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowDownCircle size={20} className="text-yellow-500" />
            Pending Deposits
          </h3>
          <div className="space-y-4">
            {pendingDeposits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center text-gray-700 mb-4">
                  <Inbox size={32} />
                </div>
                <p className="text-sm text-gray-500">No pending deposits.</p>
              </div>
            ) : (
              pendingDeposits.map(tx => (
                <div key={tx.id} className="p-4 bg-slate-950 border border-[#C9A96E]/10 rounded-xl flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-bold text-white">{tx.amountBtc || tx.amount} BTC</p>
                    <p className="text-[10px] text-gray-500 mt-1">From: {tx.userId.slice(0, 8)}...</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setSelectedTx(tx)}
                      data-tooltip-id="admin-tooltip"
                      data-tooltip-content="View Deposit Details"
                      className="p-2 bg-[#C9A96E]/10 text-[#C9A96E] rounded-lg hover:bg-[#C9A96E]/20 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => approveDeposit(tx)}
                      data-tooltip-id="admin-tooltip"
                      data-tooltip-content="Approve Deposit"
                      className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowUpCircle size={20} className="text-red-500" />
            Pending Withdrawals
          </h3>
          <div className="space-y-4">
            {pendingWithdrawals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center text-gray-700 mb-4">
                  <Inbox size={32} />
                </div>
                <p className="text-sm text-gray-500">No pending withdrawals.</p>
              </div>
            ) : (
              pendingWithdrawals.map(tx => (
                <div key={tx.id} className="p-4 bg-slate-950 border border-[#C9A96E]/10 rounded-xl flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-bold text-white">{tx.amountBtc || tx.amount} BTC</p>
                    <p className="text-[10px] text-gray-500 mt-1">To: {tx.walletAddress?.slice(0, 8)}...</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setSelectedTx(tx)}
                      data-tooltip-id="admin-tooltip"
                      data-tooltip-content="View Withdrawal Details"
                      className="p-2 bg-[#C9A96E]/10 text-[#C9A96E] rounded-lg hover:bg-[#C9A96E]/20 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => approveWithdrawal(tx)}
                      data-tooltip-id="admin-tooltip"
                      data-tooltip-content="Approve Withdrawal"
                      className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Pending KYC */}
        <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-500" />
            Pending KYC
          </h3>
          <div className="space-y-4">
            {pendingKyc.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center text-gray-700 mb-4">
                  <ShieldCheck size={32} />
                </div>
                <p className="text-sm text-gray-500">No pending KYC requests.</p>
              </div>
            ) : (
              pendingKyc.map(kyc => (
                <div key={kyc.id} className="p-4 bg-slate-950 border border-[#C9A96E]/10 rounded-xl flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-bold text-white">{kyc.fullName}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{kyc.idType?.replace('_', ' ')}: {kyc.idNumber}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setSelectedKyc(kyc)}
                      data-tooltip-id="admin-tooltip"
                      data-tooltip-content="View KYC Details"
                      className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => approveKyc(kyc)}
                      data-tooltip-id="admin-tooltip"
                      data-tooltip-content="Approve KYC"
                      className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => initiateRejectKyc(kyc.id, kyc.userId)}
                      data-tooltip-id="admin-tooltip"
                      data-tooltip-content="Reject KYC"
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

      {/* KYC Details Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-[#C9A96E]/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#C9A96E]/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-blue-500" />
                KYC Verification Details
              </h3>
              <button onClick={() => setSelectedKyc(null)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Full Name</p>
                    <p className="text-lg font-bold text-white">{selectedKyc.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">ID Type</p>
                    <p className="text-white capitalize">{selectedKyc.idType?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">ID Number</p>
                    <p className="text-white font-mono">{selectedKyc.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Submitted At</p>
                    <p className="text-white">{format(new Date(selectedKyc.submittedAt), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-4 bg-slate-950 border border-[#C9A96E]/10 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">ID Document</p>
                    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-[#C9A96E]/5">
                      {selectedKyc.idImage ? (
                        <img src={selectedKyc.idImage} alt="ID Document" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                          <ShieldCheck size={32} className="mb-2 opacity-20" />
                          <p className="text-[10px]">No ID image provided</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-950 border-t border-[#C9A96E]/10 flex gap-4">
              <button 
                onClick={() => approveKyc(selectedKyc)}
                className="flex-1 py-4 bg-green-500 text-[#0B0B0B] font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Approve KYC
              </button>
              <button 
                onClick={() => initiateRejectKyc(selectedKyc.id, selectedKyc.userId)}
                className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <X size={20} />
                Reject KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-[#C9A96E]/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#C9A96E]/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {selectedTx.type === 'deposit' ? <ArrowDownCircle className="text-yellow-500" /> : <ArrowUpCircle className="text-red-500" />}
                {selectedTx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Details
              </h3>
              <button onClick={() => setSelectedTx(null)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-950 border border-[#C9A96E]/10 rounded-2xl">
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Amount (BTC)</p>
                    <p className="text-2xl font-bold text-[#C9A96E]">{selectedTx.amountBtc || selectedTx.amount} BTC</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Amount (USD)</p>
                    <p className="text-xl font-bold text-white">${(selectedTx.amountUsd || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Status</p>
                  <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded-full uppercase tracking-widest border border-yellow-500/20">
                    {selectedTx.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {selectedTx.type === 'deposit' ? (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Transaction Hash (TXID)</p>
                    <p className="text-sm text-white font-mono break-all bg-slate-950 p-3 rounded-lg border border-[#C9A96E]/5">{selectedTx.txHash}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Destination Wallet</p>
                    <p className="text-sm text-white font-mono break-all bg-slate-950 p-3 rounded-lg border border-[#C9A96E]/5">{selectedTx.walletAddress}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Timestamp</p>
                  <p className="text-sm text-white">{format(new Date(selectedTx.timestamp), "MMM dd, yyyy HH:mm:ss")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">User ID</p>
                  <p className="text-[10px] text-gray-500 font-mono">{selectedTx.userId}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-950 border-t border-[#C9A96E]/10 flex gap-4">
              <button 
                onClick={() => { 
                  if (selectedTx.type === 'deposit') approveDeposit(selectedTx);
                  else approveWithdrawal(selectedTx);
                  setSelectedTx(null); 
                }}
                className="flex-1 py-4 bg-green-500 text-[#0B0B0B] font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Approve
              </button>
              <button 
                onClick={() => initiateRejectTx(selectedTx)}
                className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <X size={20} />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl overflow-hidden">
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
                className="bg-slate-950 border border-[#C9A96E]/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-[#C9A96E]/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#C9A96E]" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-[#C9A96E]/10 rounded-lg py-2 px-3 text-xs text-gray-400 outline-none focus:border-[#C9A96E]/40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="restricted">Restricted</option>
              </select>
              <select 
                value={filterKyc}
                onChange={(e) => setFilterKyc(e.target.value)}
                className="bg-slate-950 border border-[#C9A96E]/10 rounded-lg py-2 px-3 text-xs text-gray-400 outline-none focus:border-[#C9A96E]/40"
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
              <tr className="bg-slate-950/50 border-b border-[#C9A96E]/10">
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
              {filteredAndSortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center text-gray-700 mb-4">
                        <Users size={40} />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">No users found</h4>
                      <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedUsers.map(u => (
                  <tr key={u.id} className="hover:bg-[#C9A96E]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#C9A96E]/10 rounded-full flex items-center justify-center text-[#C9A96E] text-xs font-bold">
                        {u.displayName?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{u.displayName}</p>
                          <span className="px-1.5 py-0.5 bg-[#C9A96E]/10 text-[#C9A96E] text-[8px] font-bold rounded-full uppercase tracking-widest border border-[#C9A96E]/20">
                            Member
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#C9A96E]">{u.btcBalance?.toFixed(4)} BTC</span>
                      <span className="text-[10px] text-gray-500">≈ ${(u.btcBalance * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
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
                        data-tooltip-id="admin-tooltip"
                        data-tooltip-content={u.status === 'restricted' ? "Activate User" : "Restrict User"}
                        className={cn(
                          "p-1 rounded-md transition-colors",
                          u.status === 'restricted' ? "text-green-500 hover:bg-green-500/10" : "text-red-500 hover:bg-red-500/10"
                        )}
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
                        to={`/admin/support?user=${u.id}`}
                        className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                        title="Chat with User"
                      >
                        <MessageSquare size={16} />
                      </Link>
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
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowRejectModal(false);
                setRejectingKyc(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-[#C9A96E]/20 rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Reject KYC</h3>
              <p className="text-gray-400 text-sm mb-6">Please provide a reason for rejecting this KYC submission. The user will be notified.</p>
              
              <div className="space-y-4">
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. ID image is blurry, document expired..."
                  className="w-full h-32 bg-slate-950 border border-[#C9A96E]/10 rounded-xl p-4 text-white outline-none focus:border-red-500/40 transition-all resize-none"
                />
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectingKyc(null);
                    }}
                    className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl border border-[#C9A96E]/10 hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRejectKyc}
                    disabled={!rejectReason.trim()}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 transition-all disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Transaction Rejection Reason Modal */}
      <AnimatePresence>
        {showTxRejectModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowTxRejectModal(false);
                setRejectingTx(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-[#C9A96E]/20 rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Reject {rejectingTx?.type.charAt(0).toUpperCase()}{rejectingTx?.type.slice(1)}</h3>
              <p className="text-gray-400 text-sm mb-6">Please provide a reason for rejecting this {rejectingTx?.type}. The user will be notified.</p>
              
              <div className="space-y-4">
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Invalid transaction hash, insufficient funds..."
                  className="w-full h-32 bg-slate-950 border border-[#C9A96E]/10 rounded-xl p-4 text-white outline-none focus:border-red-500/40 transition-all resize-none"
                />
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setShowTxRejectModal(false);
                      setRejectingTx(null);
                    }}
                    className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl border border-[#C9A96E]/10 hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRejectTransaction}
                    disabled={!rejectReason.trim()}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 transition-all disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminStatCard = ({ title, value, icon: Icon, color, link, badge }: any) => {
  const content = (
    <>
      <div className="relative">
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
        {badge && (
          <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
        color === 'yellow' ? "bg-yellow-500/10 text-yellow-500" : 
        color === 'blue' ? "bg-blue-500/10 text-blue-500" : 
        color === 'red' ? "bg-red-500/10 text-red-500" :
        color === 'green' ? "bg-green-500/10 text-green-500" :
        "bg-[#C9A96E]/10 text-[#C9A96E]"
      )}>
        <Icon size={24} />
      </div>
    </>
  );

  const className = "bg-slate-900 border border-[#C9A96E]/10 p-6 rounded-2xl flex items-center justify-between group transition-all hover:border-[#C9A96E]/30";

  if (link) {
    return (
      <Link to={link} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};
