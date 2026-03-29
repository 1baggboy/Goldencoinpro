import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Coins, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: "user",
        btcBalance: 0,
        totalDeposited: 0,
        kycStatus: "not_submitted",
        createdAt: new Date().toISOString(),
      });

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
            <div className="w-10 h-10 bg-[#C9A96E] rounded-lg flex items-center justify-center">
              <Coins className="text-[#0B0B0B]" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-[#C9A96E]">GOLDENCOIN</span>
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
            <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
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
            disabled={loading}
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
