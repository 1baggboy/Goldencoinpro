import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDocs, query, collection, where, updateDoc, increment, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Check, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../ThemeContext";
import { cn } from "../lib/utils";

export const Register = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const { theme } = useTheme();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);
  const canSubmit = name.length > 2 && isEmailValid && isPasswordStrong && acceptedTerms;

  const generateReferralCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      try {
        // Force token refresh to ensure Firestore has the latest auth state
        await user.getIdToken(true);
      } catch (e) {
        console.error("Failed to refresh token:", e);
      }

      let referredByUid = "";
      const finalReferralCode = referralCode || referralInput;
      if (finalReferralCode) {
        if (!/^[a-zA-Z0-9]+$/.test(finalReferralCode)) {
          // Ignore invalid referral code format
          console.warn("Invalid referral code format.");
        } else {
          try {
            const q = query(collection(db, "users"), where("referralCode", "==", finalReferralCode));
            const snap = await getDocs(q);
            if (!snap.empty) {
              referredByUid = snap.docs[0].id;
            } else {
              console.warn("Invalid referral code.");
            }
          } catch (err) {
            console.error("Error checking referral code:", err);
          }
        }
      }

      await updateProfile(user, { displayName: name });

      const isAdminEmail = user.email === "lookuptoadams@gmail.com";
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: isAdminEmail ? "admin" : "user",
        usdBalance: 0,
        btcBalance: 0,
        tradingBalanceBtc: 0,
        totalDepositedUsd: 0,
        referralCode: generateReferralCode(),
        referredBy: referredByUid,
        referralBonusEarned: 0,
        hasTraded: false,
        kycStatus: "not_submitted",
        status: "active",
        createdAt: new Date().toISOString(),
      });

      if (referredByUid) {
        await updateDoc(doc(db, "users", referredByUid), {
          usdBalance: increment(10),
          referralBonusEarned: increment(10),
        });
        
        await addDoc(collection(db, "notifications"), {
          userId: referredByUid,
          title: "Referral Bonus Received",
          message: `You've earned a $10.00 cash bonus for referring ${name}!`,
          type: "success",
          read: false,
          timestamp: new Date().toISOString(),
        });
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A96E]/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C9A96E]/5 rounded-full blur-[120px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md border rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 transition-colors duration-300 bg-white border-slate-200 dark:bg-slate-900 dark:border-[#C9A96E]/10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img src="/logo.webp" alt="GOLDENCOIN" className="h-16 w-auto" referrerPolicy="no-referrer" />
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Create Account</h2>
          <p className="text-slate-500 mt-2">Join Goldencoin and start managing your assets.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1 text-slate-600 dark:text-gray-400">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-slate-400 group-focus-within:text-[#C9A96E] dark:text-gray-600 dark:group-focus-within:text-[#C9A96E]" size={20} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-xl py-4 pl-12 pr-4 outline-none transition-all bg-slate-50 border-slate-200 text-slate-950 focus:border-[#C9A96E]/40 dark:bg-[#0B0B0B] dark:border-[#C9A96E]/10 dark:text-white dark:focus:border-[#C9A96E]/40"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1 text-slate-600 dark:text-gray-400">Email Address</label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-slate-400 group-focus-within:text-[#C9A96E] dark:text-gray-600 dark:group-focus-within:text-[#C9A96E]" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full border rounded-xl py-4 pl-12 pr-4 outline-none transition-all",
                    email && !isEmailValid ? "border-red-500/50 focus:border-red-500" : "bg-slate-50 border-slate-200 text-slate-950 focus:border-[#C9A96E]/40 dark:bg-[#0B0B0B] dark:border-[#C9A96E]/10 dark:text-white dark:focus:border-[#C9A96E]/40"
                  )}
                  placeholder="name@example.com"
                />
              </div>
            </div>
            {email && !isEmailValid && (
              <p className="text-[10px] text-red-500 ml-1 flex items-center gap-1">
                <AlertCircle size={10} /> Please enter a valid email address
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1 text-slate-600 dark:text-gray-400">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-slate-400 group-focus-within:text-[#C9A96E] dark:text-gray-600 dark:group-focus-within:text-[#C9A96E]" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full border rounded-xl py-4 pl-12 pr-4 outline-none transition-all",
                  password && !isPasswordStrong ? "border-yellow-500/30 focus:border-yellow-500/50" : "bg-slate-50 border-slate-200 text-slate-950 focus:border-[#C9A96E]/40 dark:bg-[#0B0B0B] dark:border-[#C9A96E]/10 dark:text-white dark:focus:border-[#C9A96E]/40"
                )}
                placeholder="••••••••"
              />
            </div>
            
            {password && (
              <div className="grid grid-cols-2 gap-2 mt-2 ml-1">
                <PasswordCriterion met={passwordCriteria.length} text="8+ characters" />
                <PasswordCriterion met={passwordCriteria.uppercase} text="Uppercase" />
                <PasswordCriterion met={passwordCriteria.number} text="Number" />
                <PasswordCriterion met={passwordCriteria.special} text="Special char" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1 text-slate-600 dark:text-gray-400">Referral Code (Optional)</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-slate-400 group-focus-within:text-[#C9A96E] dark:text-gray-600 dark:group-focus-within:text-[#C9A96E]" size={20} />
              <input
                type="text"
                value={referralInput || referralCode || ""}
                onChange={(e) => setReferralInput(e.target.value)}
                disabled={!!referralCode}
                className="w-full border rounded-xl py-4 pl-12 pr-4 outline-none transition-all disabled:opacity-50 bg-slate-50 border-slate-200 text-slate-950 focus:border-[#C9A96E]/40 dark:bg-[#0B0B0B] dark:border-[#C9A96E]/10 dark:text-white dark:focus:border-[#C9A96E]/40"
                placeholder="ABC123"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 ml-1">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 accent-[#C9A96E]"
            />
            <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
              I agree to the <a href="/terms" className="text-[#C9A96E] hover:underline">Terms of Service</a> and <a href="/privacy" className="text-[#C9A96E] hover:underline">Privacy Policy</a>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-4 bg-[#C9A96E] text-slate-950 font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center mt-10 text-slate-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[#C9A96E] font-bold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

const PasswordCriterion = ({ met, text }: { met: boolean; text: string }) => (
  <div className={cn(
    "flex items-center gap-1.5 text-[10px] font-medium transition-colors",
    met ? "text-green-500" : "text-slate-600 dark:text-gray-600"
  )}>
    {met ? <Check size={10} /> : <X size={10} />}
    {text}
  </div>
);
