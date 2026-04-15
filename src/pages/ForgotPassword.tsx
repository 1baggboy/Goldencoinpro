import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../ThemeContext";
import { cn } from "../lib/utils";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { theme } = useTheme();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send reset email. Please check the email address.");
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
          <div className="inline-flex items-center gap-3 mb-6">
            <img src="/Logo.png" alt="GOLDENCOIN" className="h-10 w-auto" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Reset Password</h2>
          <p className="text-slate-500 mt-2">Enter your email to receive a password reset link.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="border p-6 rounded-2xl space-y-3 bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-500">
              <CheckCircle2 size={48} className="mx-auto mb-2" />
              <h3 className="text-lg font-bold">Email Sent!</h3>
              <p className="text-sm opacity-80">
                A password reset link has been sent to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
            </div>
            <Link 
              to="/login" 
              className="w-full py-4 bg-[#C9A96E] text-slate-950 font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 text-lg"
            >
              <ArrowLeft size={20} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 text-slate-600 dark:text-gray-400">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-slate-400 group-focus-within:text-[#C9A96E] dark:text-gray-600 dark:group-focus-within:text-[#C9A96E]" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-xl py-4 pl-12 pr-4 outline-none transition-all bg-slate-50 border-slate-200 text-slate-950 focus:border-[#C9A96E]/40 dark:bg-[#0B0B0B] dark:border-[#C9A96E]/10 dark:text-white dark:focus:border-[#C9A96E]/40"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#C9A96E] text-slate-950 font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Sending...
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight size={20} />
                </>
              )}
            </button>

            <Link 
              to="/login" 
              className="w-full py-4 font-bold rounded-xl border transition-all flex items-center justify-center gap-2 bg-slate-50 text-slate-950 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 text-white border-[#C9A96E]/10 hover:bg-slate-700"
            >
              <ArrowLeft size={18} /> Back to Login
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
};
