import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { verify } from "otplib";
import { Mail, Lock, ArrowRight, Chrome, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // First, check if user has 2FA enabled without signing in yet
      // We need to find the user by email. Since we can't easily query by email without being signed in 
      // (due to security rules), we'll try to sign in first, then check profile.
      // If 2FA is enabled, we'll sign them out immediately and show the 2FA prompt.
      // This is a simplified flow for this environment.
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data();

      if (userData?.twoFactorEnabled) {
        setTempUser({ uid: userCredential.user.uid, secret: userData.twoFactorSecret });
        setShowTwoFactor(true);
        // Sign out for now until 2FA is verified
        await auth.signOut();
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const verifyTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await verify({
        token: twoFactorCode,
        secret: tempUser.secret
      });

      if (result.valid) {
        // Re-authenticate
        await signInWithEmailAndPassword(auth, email, password);
        navigate(from, { replace: true });
      } else {
        setError("Invalid 2FA code.");
      }
    } catch (err: any) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Google login failed");
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
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Enter your credentials to access your account.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!showTwoFactor ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#C9A96E] transition-colors" size={20} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-medium text-gray-400">Password</label>
                    <Link to="/forgot-password" title="Reset your password" id="forgot-password-link" className="text-xs text-[#C9A96E] hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#C9A96E] transition-colors" size={20} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign In"} <ArrowRight size={20} />
                </button>
              </form>

              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#C9A96E]/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#121212] px-4 text-gray-600 font-bold tracking-widest">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full mt-8 py-4 bg-[#1A1A1A] text-white font-bold rounded-xl border border-[#C9A96E]/10 hover:bg-[#222] transition-all flex items-center justify-center gap-3"
              >
                <Chrome size={20} className="text-[#C9A96E]" />
                Google Account
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="2fa-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-[#C9A96E]/10 text-[#C9A96E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Two-Factor Verification</h3>
                <p className="text-sm text-gray-500">Enter the 6-digit code from your authenticator app.</p>
              </div>

              <form onSubmit={verifyTwoFactor} className="space-y-6">
                <div className="space-y-4">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000"
                    autoFocus
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl py-4 text-center text-3xl font-bold tracking-[0.5em] text-[#C9A96E] outline-none focus:border-[#C9A96E]/40 transition-all"
                  />
                  
                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm justify-center">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowTwoFactor(false)}
                    className="flex-1 py-4 bg-[#1A1A1A] text-white font-bold rounded-xl border border-[#C9A96E]/10 hover:bg-[#222] transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || twoFactorCode.length !== 6}
                    className="flex-[2] py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    Verify
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center mt-10 text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#C9A96E] font-bold hover:underline">Create account</Link>
        </p>
      </motion.div>
    </div>
  );
};
