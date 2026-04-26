import React, { useState, useEffect } from "react";
import { 
  ArrowUpCircle, 
  Wallet, 
  AlertTriangle, 
  Check, 
  Info,
  ShieldAlert,
  TrendingUp
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useNotifications } from "../NotificationContext";
import { collection, addDoc, query, where, getDocs, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "motion/react";
import { cn, fetchBtcPrice as fetchBtcPriceUtil } from "../lib/utils";

export const Withdraw = () => {
  const { user, profile } = useAuth();
  const { addNotification } = useNotifications();
  const [amountUsd, setAmountUsd] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [btcPrice, setBtcPrice] = useState<number>(65000);
  const [dailyWithdrawn, setDailyWithdrawn] = useState(0);

  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const data = await fetchBtcPriceUtil();
        if (data.usd) setBtcPrice(data.usd);
      } catch (err) {
        console.error("Failed to fetch BTC price:", err);
      }
    };

    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 30000); // Update every 30s

    // Fetch today's withdrawals to calculate daily limit
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, "transactions"), 
        where("userId", "==", user.uid), 
        where("type", "==", "withdrawal"),
        where("status", "in", ["pending", "confirmed"])
      );

      const unsub = onSnapshot(q, (snap) => {
        let total = 0;
        snap.docs.forEach(doc => {
          const data = doc.data();
          const txDate = new Date(data.timestamp);
          if (txDate >= today) {
            total += data.amountBtc || 0;
          }
        });
        setDailyWithdrawn(total);
      }, (err) => {
        console.error("Daily withdrawals fetch error:", err);
        setError("Unable to calculate daily limits. Please refresh the page.");
      });

      return () => {
        unsub();
        clearInterval(interval);
      };
    }
    return () => clearInterval(interval);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setError(null);

    const valUsd = parseFloat(amountUsd);
    if (isNaN(valUsd) || valUsd <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    const amountBtc = valUsd / btcPrice;
    const dailyWithdrawnUsd = dailyWithdrawn * btcPrice;

    // 1. Check KYC
    if (profile.kycStatus !== 'verified') {
      setError("Your account must be KYC verified to withdraw funds.");
      return;
    }

    // 2. Check Balance
    if (amountBtc > profile.btcBalance) {
      setError("Insufficient BTC balance.");
      return;
    }

    // 3. Check Minimum ($1000)
    if (valUsd < 1000) {
      setError("Minimum withdrawal amount is $1000.");
      return;
    }

    // 4. Check Daily Maximum ($50,000)
    if (dailyWithdrawnUsd + valUsd > 50000) {
      setError(`Daily withdrawal limit exceeded. You have already withdrawn $${dailyWithdrawnUsd.toLocaleString()} today. Remaining limit: $${(50000 - dailyWithdrawnUsd).toLocaleString()}`);
      return;
    }

    // 5. Validate BTC Wallet Address
    const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,90})$/;
    if (!btcRegex.test(walletAddress)) {
      setError("Please enter a valid BTC wallet address (Legacy, P2SH, or SegWit).");
      return;
    }

    setLoading(true);
    try {
      const txId = 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "withdrawal",
        txId: txId,
        amountUsd: valUsd,
        amountBtc: amountBtc,
        status: "confirmed",
        walletAddress: walletAddress,
        timestamp: new Date().toISOString(),
      });
      
      // Update user balance
      await updateDoc(doc(db, "users", user.uid), {
        btcBalance: increment(-amountBtc),
        tradingBalanceBtc: increment(-amountBtc)
      });

      await addNotification(user.uid, "Withdrawal Approved", `Your withdrawal request for $${valUsd.toLocaleString()} (~${amountBtc.toFixed(8)} BTC) has been automatically approved and processed.`, "success");
      setSuccess(true);
      setAmountUsd("");
      setWalletAddress("");
    } catch (err) {
      console.error("Withdrawal error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const valUsd = parseFloat(amountUsd || "0");
  const amountBtc = valUsd / btcPrice;
  const dailyWithdrawnUsd = dailyWithdrawn * btcPrice;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center text-[#C9A96E]">
          <ArrowUpCircle size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Withdraw Funds</h1>
          <p className="text-gray-400">Enter the amount in USD you wish to withdraw. It will be converted from your BTC balance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Info & Limits */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Withdrawal Limits</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Minimum</span>
                <span className="text-xs font-bold text-white">$50.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Daily Maximum</span>
                <span className="text-xs font-bold text-white">$50,000.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">KYC Required</span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  profile?.kycStatus === 'verified' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {profile?.kycStatus === 'verified' ? "YES" : "REQUIRED"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Current Balance</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-xl flex items-center justify-center text-[#C9A96E]">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{profile?.btcBalance?.toFixed(6)} BTC</p>
                <p className="text-xs text-gray-500">≈ ${((profile?.btcBalance || 0) * btcPrice).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex gap-3">
            <Info className="text-blue-500 shrink-0" size={18} />
            <p className="text-[10px] text-blue-200 leading-relaxed">
              Withdrawals are processed manually by our team for security. Please allow up to 24 hours for processing.
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-2">
          <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6 lg:p-8">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-6"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                  <Check size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Withdrawal Requested</h3>
                  <p className="text-gray-400">Your request is being processed. You can track its status in your transaction history.</p>
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="px-8 py-3 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all"
                >
                  Make Another Request
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                    <ShieldAlert size={18} />
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Amount to Withdraw (USD)</label>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Available Balance</span>
                      <span className="text-sm font-bold text-[#C9A96E]">{profile?.btcBalance?.toFixed(8)} BTC</span>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A96E]">
                      <TrendingUp size={18} />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={amountUsd}
                      onChange={(e) => setAmountUsd(e.target.value)}
                      className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-2xl py-5 pl-12 pr-24 text-white outline-none focus:border-[#C9A96E]/40 transition-all font-mono text-lg"
                      placeholder="0.00"
                    />
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 border-r border-gray-800 pr-3">
                        ≈ {amountBtc.toFixed(8)} BTC
                      </span>
                      <button 
                        type="button"
                        onClick={() => setAmountUsd(((profile?.btcBalance || 0) * btcPrice).toFixed(2))}
                        className="px-3 py-1.5 bg-[#C9A96E]/10 text-[#C9A96E] text-[10px] font-bold rounded-lg border border-[#C9A96E]/20 hover:bg-[#C9A96E]/20 transition-all"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      BTC to Deduct: <span className="text-white font-bold">{amountBtc.toFixed(8)} BTC</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Daily: ${dailyWithdrawnUsd.toLocaleString()} / $50,000</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Destination BTC Wallet Address</label>
                  <input
                    type="text"
                    required
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className={cn(
                      "w-full bg-slate-950 border rounded-xl py-4 px-4 text-white outline-none transition-all font-mono text-sm",
                      walletAddress && !/^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,90})$/.test(walletAddress)
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-[#C9A96E]/10 focus:border-[#C9A96E]/40"
                    )}
                    placeholder="Enter your BTC address"
                  />
                </div>

                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex gap-4">
                  <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                  <p className="text-xs text-yellow-200 leading-relaxed">
                    Double check your wallet address. We cannot recover funds sent to the wrong address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || profile?.kycStatus !== 'verified'}
                  className="w-full py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                >
                  <ArrowUpCircle size={20} />
                  {loading ? "Processing..." : "Confirm Withdrawal"}
                </button>
                
                {profile?.kycStatus !== 'verified' && (
                  <p className="text-center text-xs text-red-500 font-bold">
                    KYC Verification Required
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
