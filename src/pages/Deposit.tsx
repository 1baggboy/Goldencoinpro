import React, { useState, useEffect } from "react";
import { 
  Copy, 
  Check, 
  Info, 
  ArrowDownCircle, 
  Upload,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Download
} from "lucide-react";
import QRCode from "qrcode";
import { useAuth } from "../AuthContext";
import { useNotifications } from "../NotificationContext";
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, increment, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "motion/react";
import { usePrices } from "../PriceContext";
import { handleFirestoreError, OperationType } from "../lib/firestoreErrorHandler";
import { sendAdminEmailNotification } from "../lib/emailService";

export const Deposit = () => {
  const { user, profile } = useAuth();
  const { addNotification } = useNotifications();
  const [copied, setCopied] = useState(false);
  const [amountUsd, setAmountUsd] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { prices } = usePrices();
  const btcPrice = prices?.btc?.usd || 0;
  const [dailyDeposited, setDailyDeposited] = useState(0);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  // In a real app, this would be generated uniquely per user
  const walletAddress = "bc1qnamqyfnm96vxkrftcztmtzuztrute0xcjny4gr";

  useEffect(() => {
    QRCode.toDataURL(walletAddress, { width: 300, margin: 1 }).then(setQrCodeDataUrl);
  }, [walletAddress]);

  useEffect(() => {
    // Fetch today's deposits to calculate daily limit
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, "transactions"), 
        where("userId", "==", user.uid), 
        where("type", "==", "DEPOSIT"),
        where("status", "in", ["PENDING", "SUCCESS"])
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
        setDailyDeposited(total);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, "transactions");
        setError("Unable to calculate daily limits. Please refresh the page.");
      });

      return () => unsub();
    }
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);

    const valUsd = parseFloat(amountUsd);
    const amountBtc = valUsd / btcPrice;
    const dailyDepositedUsd = dailyDeposited * btcPrice;

    // 0. Check KYC - Ensure profile exists before checking
    if (!profile) {
      setError("Loading your profile... Please try again in a moment.");
      return;
    }

    const kycStatus = profile?.kycStatus?.toLowerCase() || '';
    if (kycStatus !== 'verified' && kycStatus !== 'approved') {
      setError("Your account must be KYC verified (Currently: " + (profile?.kycStatus || 'Not Submitted') + ") to deposit funds.");
      return;
    }

    if (profile?.status === 'restricted' || profile?.status === 'suspended' || profile?.isSuspended) {
      setError(`Your account is currently ${profile.isSuspended ? 'suspended' : profile.status}. Please contact support.`);
      return;
    }

    // 1. Check Minimum ($50)
    if (valUsd < 50) {
      setError("Minimum deposit amount is $50.");
      return;
    }

    // 2. Check Daily Maximum ($50,000)
    if (dailyDepositedUsd + valUsd > 50000) {
      setError(`Daily deposit limit exceeded. You have already deposited $${dailyDepositedUsd.toLocaleString()} today. Remaining limit: $${(50000 - dailyDepositedUsd).toLocaleString()}`);
      return;
    }

    if (btcPrice <= 0 || isNaN(btcPrice)) {
      setError("Unable to get current Bitcoin price. Please try again in a few moments.");
      return;
    }

    if (isNaN(valUsd) || isNaN(amountBtc)) {
      setError("The calculated deposit amount is invalid. Please check your input.");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting deposit to transactions collection...");
      const txData = {
        userId: user.uid,
        type: "DEPOSIT",
        amountUsd: valUsd,
        amountBtc: amountBtc,
        status: "PENDING",
        txHash: txHash || "N/A",
        timestamp: new Date().toISOString(),
      };
      
      await addDoc(collection(db, "transactions"), txData);
      
      await addNotification(user.uid, "Deposit Submitted", `Your deposit of $${valUsd.toLocaleString()} (~${amountBtc.toFixed(8)} BTC) has been submitted for verification. It will be credited once confirmed by an admin.`, "info");
      
      // Notify admins via email (Extension will pick this up)
      try {
        const eventTitle = valUsd >= 1000 ? "Critical Event: Large Deposit" : "New Deposit Received";
        await sendAdminEmailNotification(
          eventTitle,
          `User ${profile?.displayName || user.email} has deposited $${valUsd.toLocaleString()} (~${amountBtc.toFixed(8)} BTC). TX Hash: ${txHash}`
        );
      } catch (adminErr) {
        console.error("Failed to send admin email notification:", adminErr);
      }

      setSuccess(true);
      setAmountUsd("");
      setTxHash("");

    } catch (err: any) {
      console.error("Deposit execution error:", err);
      // provide more details if possible
      if (err.code === "permission-denied" || (err.message && err.message.toLowerCase().includes("permission"))) {
        setError(`Permission denied (Code: ${err.code || 'unknown'}). Please ensure your account status is 'Verified' and not 'Restricted'. If the issue persists, contact support.`);
      } else {
        setError("An error occurred during submission: " + (err.message || "Unknown error") + ". Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center text-[#C9A96E]">
          <ArrowDownCircle size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Deposit Funds</h1>
          <p className="text-gray-400">Enter the amount in USD you wish to deposit. It will be converted to BTC.</p>
        </div>
      </div>

      {/* AI Smart Insight Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-slate-900 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest">AI Assistant Tip</p>
            <p className="text-sm text-gray-300">Minimum $50. Most deposits confirm within 20 mins. Ensure you use a high-fee tier for faster crediting.</p>
          </div>
        </div>
        <button 
          onClick={() => {
            const event = new CustomEvent('open-support', { detail: 'I need help with making a deposit' });
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-white/5"
        >
          <HelpCircle size={16} />
          <span className="text-xs font-bold uppercase tracking-tight">Ask Support</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Wallet Address Section */}
        <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6 lg:p-8 space-y-6 lg:space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-2xl">
              {qrCodeDataUrl && (
                <img src={qrCodeDataUrl} alt="QR Code" className="size-[160px] lg:size-[180px]" />
              )}
            </div>
            <a 
              href={qrCodeDataUrl} 
              download="deposit-qr.png"
              className="flex items-center gap-2 text-sm font-bold text-[#C9A96E] hover:text-[#C9A96E]/80 transition-colors"
            >
              <Download size={16} />
              Download QR
            </a>
          </div>
          
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-500">Your BTC Deposit Address</label>
            <div className="flex items-center gap-2 p-3 lg:p-4 bg-slate-950 border border-[#C9A96E]/20 rounded-xl">
              <span className="text-xs lg:text-sm font-mono text-gray-300 break-all flex-1">{walletAddress}</span>
              <button 
                onClick={handleCopy}
                className="p-2 text-[#C9A96E] hover:bg-[#C9A96E]/10 rounded-lg transition-colors shrink-0"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex gap-4">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className="text-xs text-blue-200 leading-relaxed">
              Send only Bitcoin (BTC) to this address. Sending any other coin may result in permanent loss. Deposits are credited after 3 network confirmations.
            </p>
          </div>
        </div>

        {/* Proof of Payment Section */}
        <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Submit Proof of Payment</h3>
          
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/20 p-8 rounded-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                <Check size={32} />
              </div>
              <h4 className="text-xl font-bold text-white">Submission Received</h4>
              <p className="text-sm text-gray-400">Our team will verify your transaction shortly. You'll be notified once it's confirmed.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-[#C9A96E] font-bold text-sm hover:underline"
              >
                Submit another deposit
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmitProof} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                  <AlertTriangle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Amount (USD)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(e.target.value)}
                    className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-xl py-4 pl-8 pr-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all font-mono"
                    placeholder="0.00"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    ≈ { (parseFloat(amountUsd || "0") / btcPrice).toFixed(8) } BTC
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 px-1">
                  Daily used: ${(dailyDeposited * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $50,000
                  <br/>
                  Remaining: ${(50000 - (dailyDeposited * btcPrice)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Transaction Hash (TXID)</label>
                <input
                  type="text"
                  required
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-xl py-4 px-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                  placeholder="Enter transaction hash"
                />
              </div>

              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex gap-4">
                <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                <p className="text-xs text-yellow-200 leading-relaxed">
                  Providing a false transaction hash may lead to account suspension. Ensure you've actually sent the BTC before submitting.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50"
              >
                <Upload size={20} />
                {loading ? "Submitting..." : "Submit Proof"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
