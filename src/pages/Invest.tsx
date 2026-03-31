import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Wallet,
  Timer
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useNotifications } from "../NotificationContext";
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const INVESTMENT_PLANS = [
  {
    id: "basic",
    name: "Starter Plan",
    return: 1.25, // 25% gain
    duration: 60, // 60 minutes
    minAmount: 100, // USD
    description: "Perfect for beginners. Exact +25% profit in just 1 hour. Minimum investment $100.",
    icon: Zap,
    color: "blue"
  },
  {
    id: "pro",
    name: "Professional Plan",
    return: 1.5, // 50% gain
    duration: 360, // 6 hours
    minAmount: 200, // USD
    description: "Higher returns for serious investors. 6-hour cycle. Exact +50% profit. Minimum investment $200.",
    icon: TrendingUp,
    color: "gold"
  },
  {
    id: "elite",
    name: "Elite Plan",
    return: 2.0, // 100% gain
    duration: 1440, // 24 hours
    minAmount: 500, // USD
    description: "Maximize your wealth. Double your investment in 24 hours. Exact +100% profit. Minimum investment $500.",
    icon: ShieldCheck,
    color: "green"
  }
];

export const Invest = () => {
  const { profile, user } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedPlan, setSelectedPlan] = useState(INVESTMENT_PLANS[0]);
  const [amount, setAmount] = useState<string>("");
  const [investing, setInvesting] = useState(false);
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [btcPrice, setBtcPrice] = useState(65000);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch active investments
    const q = query(collection(db, "investments"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const invs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setActiveInvestments(invs.sort((a, b) => b.startTime - a.startTime));
    });

    // Fetch BTC price
    fetch("/api/market/btc-price")
      .then(res => res.json())
      .then(data => setBtcPrice(data.usd))
      .catch(console.error);

    return () => unsub();
  }, [user]);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const usdAmount = parseFloat(amount);
    const btcAmount = usdAmount / btcPrice;
    
    if (isNaN(usdAmount) || usdAmount < selectedPlan.minAmount) {
      setMessage({ type: 'error', text: `Minimum investment for this plan is $${selectedPlan.minAmount.toLocaleString()}.` });
      return;
    }

    if (btcAmount > profile.btcBalance) {
      setMessage({ type: 'error', text: "Insufficient BTC balance." });
      return;
    }

    setInvesting(true);
    setMessage(null);

    try {
      const startTime = Date.now();
      const endTime = startTime + (selectedPlan.duration * 60 * 1000);
      const expectedReturnUsd = usdAmount * selectedPlan.return;
      const expectedReturnBtc = expectedReturnUsd / btcPrice;

      // 1. Deduct balance
      await updateDoc(doc(db, "users", user.uid), {
        usdBalance: increment(-usdAmount),
        tradingBalanceBtc: increment(-btcAmount)
      });

      // 2. Create investment record
      await addDoc(collection(db, "investments"), {
        userId: user.uid,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amountBtc: btcAmount,
        amountUsd: usdAmount,
        expectedReturnUsd: expectedReturnUsd,
        expectedReturnBtc: expectedReturnBtc,
        startTime,
        endTime,
        status: "active"
      });

      // 3. Handle Referral Reward if first trade
      if (!profile.hasTraded) {
        await updateDoc(doc(db, "users", user.uid), {
          hasTraded: true
        });

        if (profile.referredBy) {
          const bonusAmount = 0.0005; // Fixed referral bonus (~$32)
          await updateDoc(doc(db, "users", profile.referredBy), {
            btcBalance: increment(bonusAmount),
            referralBonusEarned: increment(bonusAmount)
          });
          await addNotification(profile.referredBy, "Referral Bonus Received!", `You've earned ${bonusAmount} BTC because your referral ${profile.displayName} started trading.`, "success");
        }
      }

      await addNotification(user.uid, "Investment Started", `Your investment of ${btcAmount} BTC in the ${selectedPlan.name} has started.`, "success");
      toast.success("Investment started successfully!");
      setAmount("");
    } catch (error) {
      console.error("Investment error:", error);
      setMessage({ type: 'error', text: "Failed to start investment. Please try again." });
    } finally {
      setInvesting(false);
    }
  };

  const claimInvestment = async (inv: any) => {
    if (!user) return;
    try {
      // 1. Update investment status
      await updateDoc(doc(db, "investments", inv.id), {
        status: "completed"
      });

      // 2. Add return to balance
      await updateDoc(doc(db, "users", user.uid), {
        tradingBalanceBtc: increment(inv.expectedReturnBtc)
      });

      await addNotification(user.uid, "Investment Claimed", `You have successfully claimed your profit of ${inv.expectedReturnBtc.toFixed(6)} BTC from the ${inv.planName}.`, "success");
      setMessage({ type: 'success', text: `Claimed ${inv.expectedReturnBtc.toFixed(4)} BTC successfully!` });
    } catch (error) {
      console.error("Claim error:", error);
      setMessage({ type: 'error', text: "Failed to claim investment." });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center text-[#C9A96E]">
          <TrendingUp size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Investment Plans</h1>
          <p className="text-gray-400">Grow your wealth with our high-yield Bitcoin investment cycles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plans Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INVESTMENT_PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={cn(
                  "p-6 rounded-2xl border transition-all text-left relative overflow-hidden group",
                  selectedPlan.id === plan.id 
                    ? "bg-[#C9A96E]/10 border-[#C9A96E] shadow-[0_0_20px_rgba(201,169,110,0.1)]" 
                    : "bg-slate-900 border-[#C9A96E]/10 hover:border-[#C9A96E]/30"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                  plan.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
                  plan.color === 'gold' ? "bg-[#C9A96E]/10 text-[#C9A96E]" :
                  "bg-green-500/10 text-green-500"
                )}>
                  <plan.icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-2xl font-black text-[#C9A96E] mb-2">+{((plan.return - 1) * 100)}%</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  {plan.duration >= 60 ? `${plan.duration / 60} Hours` : `${plan.duration} Minutes`}
                </div>
                {selectedPlan.id === plan.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 size={16} className="text-[#C9A96E]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Investment Form */}
          <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Start Investment</h3>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Available Balance</p>
                <p className="text-sm font-bold text-[#C9A96E]">${(profile?.btcBalance * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] text-gray-500">{profile?.btcBalance?.toFixed(6)} BTC</p>
              </div>
            </div>

            <form onSubmit={handleInvest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400">Amount to Invest (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-xl py-4 pl-10 pr-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all font-mono"
                    placeholder={`Min $${selectedPlan.minAmount.toLocaleString()}`}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    ≈ {(parseFloat(amount || "0") / btcPrice).toFixed(6)} BTC
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#C9A96E]/5 rounded-xl border border-[#C9A96E]/10 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Selected Plan</span>
                  <span className="text-white font-bold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-white font-bold">{selectedPlan.duration >= 60 ? `${selectedPlan.duration / 60} Hours` : `${selectedPlan.duration} Minutes`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expected Return</span>
                  <span className="text-green-500 font-bold">
                    ${(parseFloat(amount || "0") * selectedPlan.return).toLocaleString()}
                  </span>
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

              <button
                type="submit"
                disabled={investing || !amount}
                className="w-full bg-[#C9A96E] text-[#0B0B0B] font-bold py-4 rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {investing ? "Processing..." : "Confirm Investment"}
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Active Investments */}
        <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6 h-fit">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Timer size={20} className="text-[#C9A96E]" />
            Active Investments
          </h3>
          
          <div className="space-y-4">
            {activeInvestments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500">No active investments.</p>
                <p className="text-xs text-gray-600 mt-1">Start a plan to grow your BTC.</p>
              </div>
            ) : (
              activeInvestments.map((inv) => {
                const isExpired = Date.now() >= inv.endTime;
                const progress = Math.min(100, Math.max(0, ((Date.now() - inv.startTime) / (inv.endTime - inv.startTime)) * 100));

                return (
                  <div key={inv.id} className="p-4 bg-slate-950 border border-[#C9A96E]/10 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-[#C9A96E] uppercase tracking-widest">{inv.planName}</p>
                        <p className="text-sm font-bold text-white mt-1">{inv.amountBtc} BTC</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Return</p>
                        <p className="text-sm font-bold text-green-500">
                          ${inv.expectedReturnUsd ? inv.expectedReturnUsd.toLocaleString() : (inv.expectedReturnBtc * btcPrice).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>Progress</span>
                        <span>{isExpired ? "Completed" : `${Math.round(progress)}%`}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-[#C9A96E]"
                        />
                      </div>
                    </div>

                    {inv.status === 'active' ? (
                      isExpired ? (
                        <button 
                          onClick={() => claimInvestment(inv)}
                          className="w-full py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Claim Profit
                        </button>
                      ) : (
                        <p className="text-[10px] text-center text-gray-500 italic">
                          Ends in {formatDistanceToNow(inv.endTime)}
                        </p>
                      )
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-green-500 text-xs font-bold">
                        <CheckCircle2 size={14} />
                        Claimed
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
