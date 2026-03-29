import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { Coins, Mail, Lock, ArrowRight, Chrome } from "lucide-react";
import { motion } from "motion/react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to login");
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
            <div className="w-10 h-10 bg-[#C9A96E] rounded-lg flex items-center justify-center">
              <Coins className="text-[#0B0B0B]" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-[#C9A96E]">GOLDENCOIN</span>
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
              <a href="#" className="text-xs text-[#C9A96E] hover:underline">Forgot password?</a>
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

        <p className="text-center mt-10 text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#C9A96E] font-bold hover:underline">Create account</Link>
        </p>
      </motion.div>
    </div>
  );
};
