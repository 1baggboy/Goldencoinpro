import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDocs, query, collection, where, updateDoc, increment, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Check, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);
  const canSubmit = name.length > 2 && isEmailValid && isPasswordStrong && isOtpVerified;

  const sendOtp = async () => {
    if (!isEmailValid) return;
    setOtpLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setIsOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return;
    setOtpLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      setIsOtpVerified(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

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
    if (!isOtpVerified) {
      setError("Please verify your email with the OTP first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // 1. Check if referral code is valid if provided
      let referredByUid = "";
      const finalReferralCode = referralCode || referralInput;
      if (finalReferralCode) {
        // Validate alphanumeric
        if (!/^[a-zA-Z0-9]+$/.test(finalReferralCode)) {
          setError("Referral code must be alphanumeric.");
          setLoading(false);
          return;
        }
        const q = query(collection(db, "users"), where("referralCode", "==", finalReferralCode));
        const snap = await getDocs(q);
        if (!snap.empty) {
          referredByUid = snap.docs[0].id;
        } else {
          setError("Invalid referral code.");
          setLoading(false);
          return;
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Create user profile in Firestore
      const isAdminEmail = user.email === "lookuptoadams@gmail.com";
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: isAdminEmail ? "admin" : "user",
        btcBalance: 0,
        tradingBalanceBtc: 0,
        totalDeposited: 0,
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
          referralBonusEarned: increment(10),
        });
        
        // Add notification for referrer
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
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A96E]/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C9A96E]/5 rounded-full blur-[120px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#121212] border border-[#C9A96E]/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img src="/logo.svg" alt="GOLDENCOIN" className="h-10 w-auto" referrerPolicy="no-referrer" />
          </Link>
          <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-gray-500 mt-2">Join Goldencoin and start managing your assets.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#C9A96E] transition-colors" size={20} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#C9A96E] transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isOtpSent}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full bg-[#0B0B0B] border rounded-xl py-4 pl-12 pr-4 text-white outline-none transition-all",
                    email && !isEmailValid ? "border-red-500/50 focus:border-red-500" : "border-[#C9A96E]/10 focus:border-[#C9A96E]/40",
                    isOtpSent && "opacity-50"
                  )}
                  placeholder="name@example.com"
                />
              </div>
              {!isOtpSent && (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={!isEmailValid || otpLoading}
                  className="px-4 bg-[#C9A96E]/10 text-[#C9A96E] font-bold rounded-xl border border-[#C9A96E]/20 hover:bg-[#C9A96E]/20 transition-all disabled:opacity-50 text-xs"
                >
                  {otpLoading ? "..." : "Send OTP"}
                </button>
              )}
            </div>
            {email && !isEmailValid && (
              <p className="text-[10px] text-red-500 ml-1 flex items-center gap-1">
                <AlertCircle size={10} /> Please enter a valid email address
              </p>
            )}
            {isOtpSent && !isOtpVerified && (
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 bg-[#0B0B0B] border border-[#C9A96E]/20 rounded-xl py-3 px-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all text-center tracking-[0.5em] font-bold"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={otp.length !== 6 || otpLoading}
                    className="px-6 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all disabled:opacity-50 text-sm"
                  >
                    {otpLoading ? "..." : "Verify"}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 ml-1">
                  Enter the 6-digit code sent to your email.
                </p>
              </div>
            )}
            {isOtpVerified && (
              <p className="text-[10px] text-green-500 ml-1 flex items-center gap-1">
                <Check size={10} /> Email verified successfully
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#C9A96E] transition-colors" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full bg-[#0B0B0B] border rounded-xl py-4 pl-12 pr-4 text-white outline-none transition-all",
                  password && !isPasswordStrong ? "border-yellow-500/30 focus:border-yellow-500/50" : "border-[#C9A96E]/10 focus:border-[#C9A96E]/40"
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
            <label className="text-sm font-medium text-gray-400 ml-1">Referral Code (Optional)</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#C9A96E] transition-colors" size={20} />
              <input
                type="text"
                value={referralInput || referralCode || ""}
                onChange={(e) => setReferralInput(e.target.value)}
                disabled={!!referralCode}
                className="w-full bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all disabled:opacity-50"
                placeholder="ABC123"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 ml-1">
            <div className="mt-1">
              <ShieldCheck size={16} className="text-[#C9A96E]" />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              By creating an account, you agree to our <a href="#" className="text-[#C9A96E] hover:underline">Terms of Service</a> and <a href="#" className="text-[#C9A96E] hover:underline">Privacy Policy</a>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center mt-10 text-gray-500 text-sm">
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
    met ? "text-green-500" : "text-gray-600"
  )}>
    {met ? <Check size={10} /> : <X size={10} />}
    {text}
  </div>
);
