import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { db, auth } from "../firebase";
import { useNotifications } from "../NotificationContext";
import { 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Settings,
  Lock,
  Unlock,
  Key,
  Save,
  Camera,
  FileText,
  Zap,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { cn, fetchBtcPrice as fetchBtcPriceUtil } from "../lib/utils";
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
  const { addNotification } = useNotifications();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [kycSubmission, setKycSubmission] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [btcPrice, setBtcPrice] = useState<number>(65000);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [editBalance, setEditBalance] = useState<string>("");
  const [editTradingBalance, setEditTradingBalance] = useState<string>("");
  const [editWallet, setEditWallet] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // KYC Rejection Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Fetch user profile
    const unsubUser = onSnapshot(doc(db, "users", userId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserProfile({ id: doc.id, ...data });
        setEditBalance(data.btcBalance?.toString() || "0");
        setEditTradingBalance(data.tradingBalanceBtc?.toString() || "0");
        setEditWallet(data.btcWalletAddress || "");
      }
      setLoading(false);
    });

    // Fetch user transactions
    const qTx = query(collection(db, "transactions"), where("userId", "==", userId));
    const unsubTx = onSnapshot(qTx, (snap) => {
      const txs = snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, txType: data.type, type: 'transaction' };
      });
      setTransactions(txs.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)));
    });

    // Fetch user investments
    const qInv = query(collection(db, "investments"), where("userId", "==", userId));
    const unsubInv = onSnapshot(qInv, (snap) => {
      const invs = snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'investment' }));
      setInvestments(invs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)));
    });

    // Fetch user KYC submission
    const qKyc = query(collection(db, "kyc_submissions"), where("userId", "==", userId));
    const unsubKyc = onSnapshot(qKyc, (snap) => {
      if (!snap.empty) {
        // Get the most recent submission
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'kyc' }));
        setKycSubmission(docs.sort((a: any, b: any) => (b.submittedAt || 0) - (a.submittedAt || 0))[0]);
      } else {
        setKycSubmission(null);
      }
    });

    // Fetch BTC price
    fetchBtcPriceUtil()
      .then(data => setBtcPrice(data.usd))
      .catch(console.error);

    return () => {
      unsubUser();
      unsubTx();
      unsubInv();
      unsubKyc();
    };
  }, [userId]);

  useEffect(() => {
    // Combine and sort all activities
    const allActivities = [
      ...transactions.map(t => ({ ...t, timestamp: t.timestamp })),
      ...investments.map(i => ({ ...i, timestamp: i.createdAt })),
      ...(kycSubmission ? [{ ...kycSubmission, timestamp: kycSubmission.submittedAt }] : [])
    ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    setActivities(allActivities);
  }, [transactions, investments, kycSubmission]);

  const handleSaveAdminEdits = async () => {
    if (!userId) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        btcBalance: parseFloat(editBalance),
        tradingBalanceBtc: parseFloat(editTradingBalance),
        btcWalletAddress: editWallet
      });
      setMessage({ type: 'success', text: "User updated successfully!" });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: "Failed to update user." });
    } finally {
      setUpdating(false);
    }
  };

  const toggleRestriction = async () => {
    if (!userId || !userProfile) return;
    const newStatus = userProfile.status === 'restricted' ? 'active' : 'restricted';
    try {
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      await addNotification(userId, 
        newStatus === 'restricted' ? "Account Restricted" : "Account Activated", 
        newStatus === 'restricted' ? 
          "Your account has been restricted. Please contact support for more information." : 
          "Your account has been activated. You can now access all features.",
        newStatus === 'restricted' ? "warning" : "success"
      );
      setMessage({ type: 'success', text: `User ${newStatus === 'restricted' ? 'restricted' : 'unrestricted'} successfully!` });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: "Failed to update status." });
    }
  };

  const sendResetEmail = async () => {
    if (!userProfile?.email) return;
    try {
      await sendPasswordResetEmail(auth, userProfile.email);
      setMessage({ type: 'success', text: "Password reset email sent!" });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: "Failed to send reset email." });
    }
  };

  const handleApproveKyc = async () => {
    if (!userId || !kycSubmission) return;
    try {
      await updateDoc(doc(db, "kyc_submissions", kycSubmission.id), { status: "approved" });
      await updateDoc(doc(db, "users", userId), { kycStatus: "verified" });
      await addNotification(userId, "KYC Verified", "Your KYC verification has been approved. You now have full access to withdrawals.", "success");
      setMessage({ type: 'success', text: "KYC approved successfully!" });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: "Failed to approve KYC." });
    }
  };

  const handleRejectKyc = async () => {
    if (!userId || !kycSubmission || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      await updateDoc(doc(db, "kyc_submissions", kycSubmission.id), { 
        status: "rejected",
        rejectionReason: rejectReason 
      });
      await updateDoc(doc(db, "users", userId), { kycStatus: "rejected" });
      await addNotification(userId, "KYC Rejected", `Your KYC verification was rejected. Reason: ${rejectReason}`, "error");
      setMessage({ type: 'success', text: "KYC rejected successfully." });
      setShowRejectModal(false);
      setRejectReason("");
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: "Failed to reject KYC." });
    } finally {
      setRejecting(false);
    }
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
            onClick={() => navigate(`/admin/support?user=${userId}`)}
            className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg text-sm font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-2"
          >
            <MessageSquare size={16} />
            Chat with User
          </button>
          <button 
            onClick={toggleRestriction}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2",
              userProfile.status === 'restricted' 
                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
                : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            )}
          >
            {userProfile.status === 'restricted' ? <Unlock size={16} /> : <Lock size={16} />}
            {userProfile.status === 'restricted' ? "Unrestrict Account" : "Restrict Account"}
          </button>
          <button 
            onClick={sendResetEmail}
            className="px-4 py-2 bg-[#C9A96E]/10 text-[#C9A96E] rounded-lg text-sm font-bold hover:bg-[#C9A96E]/20 transition-colors flex items-center gap-2"
          >
            <Key size={16} />
            Reset Password
          </button>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-xl flex items-center gap-3 text-sm font-medium",
          message.type === 'success' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
        )}>
          <AlertCircle size={18} />
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Admin Controls */}
        <div className="lg:col-span-1 space-y-8">
          {/* User Identity Card */}
          <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6 text-center">
            <div className="w-20 h-20 bg-[#C9A96E]/10 rounded-3xl flex items-center justify-center text-[#C9A96E] text-3xl font-bold mx-auto mb-4 overflow-hidden">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                userProfile.displayName?.charAt(0)
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{userProfile.displayName}</h1>
            <p className="text-sm text-gray-500 mb-4">{userProfile.email}</p>
            
            <div className="flex flex-col gap-2">
              <span className="px-3 py-1 bg-[#C9A96E]/10 text-[#C9A96E] text-[10px] font-bold rounded-full uppercase tracking-widest mx-auto border border-[#C9A96E]/20">
                Member
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mx-auto",
                userProfile.kycStatus === 'verified' ? "bg-green-500/10 text-green-500" : 
                userProfile.kycStatus === 'pending' ? "bg-yellow-500/10 text-yellow-500" : 
                "bg-gray-500/10 text-gray-500"
              )}>
                KYC: {userProfile.kycStatus?.replace('_', ' ')}
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mx-auto",
                userProfile.status === 'restricted' ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
              )}>
                Status: {userProfile.status || 'active'}
              </span>
            </div>
          </div>

          {/* Admin Edit Form */}
          <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings size={18} className="text-[#C9A96E]" />
              Quick Edit
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">BTC Balance</label>
                <input 
                  type="number"
                  step="0.0001"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trading Balance (BTC)</label>
                <input 
                  type="number"
                  step="0.0001"
                  value={editTradingBalance}
                  onChange={(e) => setEditTradingBalance(e.target.value)}
                  className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">BTC Wallet Address</label>
                <input 
                  type="text"
                  value={editWallet}
                  onChange={(e) => setEditWallet(e.target.value)}
                  className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all font-mono text-xs"
                  placeholder="Enter BTC address"
                />
              </div>

              <button 
                onClick={handleSaveAdminEdits}
                disabled={updating}
                className="w-full bg-[#C9A96E] text-[#0B0B0B] font-bold py-3 rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard 
              title="Current Balance" 
              value={`$${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
              subValue={`${userProfile.btcBalance?.toFixed(4)} BTC`}
              icon={Wallet}
              color="gold"
            />
            <StatCard 
              title="Trading Balance" 
              value={`${userProfile.tradingBalanceBtc?.toFixed(4) || "0.0000"} BTC`} 
              subValue={`≈ $${((userProfile.tradingBalanceBtc || 0) * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              icon={Zap}
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
              title="Referral Bonus" 
              value={`$${(userProfile.referralBonusEarned || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              subValue={`Code: ${userProfile.referralCode || 'N/A'}`}
              icon={TrendingUp}
              color="gold"
            />
          </div>

          {/* Performance Chart */}
          <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-8">User Portfolio Performance</h3>
            <div className="h-[250px] w-full">
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
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(201, 169, 110, 0.2)', borderRadius: '12px' }}
                    itemStyle={{ color: '#C9A96E' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#C9A96E" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10">No recent activity found.</p>
              ) : (
                activities.map(act => (
                  <div key={act.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        act.type === 'transaction' ? (act.txType === 'deposit' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500") :
                        act.type === 'investment' ? "bg-blue-500/10 text-blue-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      )}>
                        {act.type === 'transaction' ? (act.txType === 'deposit' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />) :
                         act.type === 'investment' ? <TrendingUp size={14} /> :
                         <ShieldCheck size={14} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white capitalize">
                          {act.type === 'transaction' ? act.txType : act.type}
                        </p>
                        <p className="text-[10px] text-gray-500">{act.timestamp ? format(new Date(act.timestamp), "MMM dd, HH:mm") : "---"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {act.type === 'transaction' && (
                        <p className={cn("text-xs font-bold", act.txType === 'deposit' ? "text-green-500" : "text-red-500")}>
                          {act.txType === 'deposit' ? '+' : '-'}{act.amountBtc || act.amount || 0} BTC
                        </p>
                      )}
                      {act.type === 'investment' && (
                        <p className="text-xs font-bold text-[#C9A96E]">
                          {act.amountBtc} BTC
                        </p>
                      )}
                      <p className={cn(
                        "text-[8px] uppercase font-bold",
                        act.status === 'confirmed' || act.status === 'approved' || act.status === 'active' ? "text-green-500" : 
                        act.status === 'pending' ? "text-yellow-500" : "text-red-500"
                      )}>
                        {act.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Investments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#C9A96E]" />
            KYC Verification
          </h3>
          
          {kycSubmission ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-[#C9A96E]/5">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Full Name</p>
                  <p className="text-sm font-bold text-white">{kycSubmission.fullName}</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-[#C9A96E]/5">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">ID Type</p>
                  <p className="text-sm font-bold text-white capitalize">{kycSubmission.idType?.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                    <FileText size={10} /> ID Document
                  </p>
                  <div className="aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-[#C9A96E]/10">
                    {kycSubmission.idImage ? (
                      <img src={kycSubmission.idImage} alt="ID" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">No image</div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                    <Camera size={10} /> Selfie
                  </p>
                  <div className="aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-[#C9A96E]/10">
                    {kycSubmission.selfieImage ? (
                      <img src={kycSubmission.selfieImage} alt="Selfie" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">No image</div>
                    )}
                  </div>
                </div>
              </div>

              {kycSubmission.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleApproveKyc}
                    className="flex-1 bg-green-500 text-[#0B0B0B] font-bold py-3 rounded-xl hover:bg-green-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    Approve
                  </button>
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-400 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Reject
                  </button>
                </div>
              )}

              {kycSubmission.status === 'rejected' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-bold text-red-500 uppercase mb-1">Rejection Reason</p>
                  <p className="text-sm text-gray-300 italic">"{kycSubmission.rejectionReason || 'No reason provided.'}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500 italic">
              No KYC submission found for this user.
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">User Investments</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {investments.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No investments found.</div>
            ) : (
              investments.map(inv => (
                <div key={inv.id} className="p-4 bg-slate-950 border border-[#C9A96E]/10 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-bold text-white">{inv.planName}</p>
                      <p className="text-[10px] text-gray-500">{inv.createdAt ? format(new Date(inv.createdAt), "MMM dd, yyyy") : "---"}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      inv.status === 'active' ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
                    )}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Invested</p>
                      <p className="text-sm font-bold text-white">{inv.amountBtc} BTC</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Expected</p>
                      <p className="text-sm font-bold text-[#C9A96E]">{inv.expectedReturnBtc?.toFixed(4)} BTC</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(false)}
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
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl border border-[#C9A96E]/10 hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRejectKyc}
                    disabled={rejecting || !rejectReason.trim()}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 transition-all disabled:opacity-50"
                  >
                    {rejecting ? "Rejecting..." : "Confirm Rejection"}
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

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-[#C9A96E]/10 p-6 rounded-2xl">
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
