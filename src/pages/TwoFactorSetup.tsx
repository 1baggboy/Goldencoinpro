import React, { useState, useEffect } from "react";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Smartphone, 
  Lock,
  Loader2
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export const TwoFactorSetup = () => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateSecret = async () => {
    if (!user) return;
    const newSecret = generateSecret();
    setSecret(newSecret);
    
    const otpauth = generateURI({
      label: user.email || "user",
      issuer: "GoldenCoin Limited",
      secret: newSecret
    });
    
    try {
      const url = await QRCode.toDataURL(otpauth);
      setQrCodeUrl(url);
    } catch (err) {
      console.error("QR Code generation error:", err);
    }
  };

  useEffect(() => {
    if (step === 2 && !secret) {
      handleGenerateSecret();
    }
  }, [step]);

  const handleVerifyAndEnable = async () => {
    if (!user || !secret) return;
    setLoading(true);
    setError("");

    try {
      const result = await verify({
        token: verificationCode,
        secret: secret
      });

      if (result.valid) {
        await updateDoc(doc(db, "users", user.uid), {
          twoFactorEnabled: true,
          twoFactorSecret: secret // In a real app, encrypt this or store it more securely
        });
        setStep(4);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      setError("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        twoFactorEnabled: false,
        twoFactorSecret: null
      });
      setStep(1);
      setSecret("");
      setQrCodeUrl("");
    } catch (err) {
      console.error("Disable 2FA error:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (profile?.twoFactorEnabled && step !== 4) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-3xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white">Two-Factor Authentication is Enabled</h2>
          <p className="text-gray-400">
            Your account is protected with an extra layer of security. You will be prompted for a code whenever you log in.
          </p>
          <button 
            onClick={handleDisable}
            disabled={loading}
            className="px-8 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
            Disable 2FA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-3xl p-8 md:p-12 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center text-[#C9A96E]">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Two-Factor Authentication</h1>
            <p className="text-gray-400 text-sm">Enhance your account security with TOTP.</p>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#1A1A1A] -translate-y-1/2 -z-10"></div>
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500",
                step >= s ? "bg-[#C9A96E] text-[#0B0B0B]" : "bg-[#1A1A1A] text-gray-500 border border-[#C9A96E]/10"
              )}
            >
              {s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4 p-4 bg-[#C9A96E]/5 rounded-2xl border border-[#C9A96E]/10">
                <Smartphone className="text-[#C9A96E] shrink-0" size={24} />
                <div className="space-y-1">
                  <h3 className="font-bold text-white">Install an Authenticator App</h3>
                  <p className="text-sm text-gray-400">
                    Download and install an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator on your mobile device.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2"
              >
                I have installed the app <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h3 className="font-bold text-white text-lg">Scan this QR Code</h3>
                <p className="text-sm text-gray-400">Open your authenticator app and scan the QR code below.</p>
                <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <Loader2 className="animate-spin text-[#0B0B0B]" size={32} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">Or enter this code manually in your app:</p>
                <div className="flex items-center gap-2 bg-[#0B0B0B] border border-[#C9A96E]/10 p-4 rounded-xl">
                  <code className="text-[#C9A96E] font-mono font-bold flex-1 text-center tracking-widest">{secret}</code>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 text-gray-500 hover:text-[#C9A96E] transition-colors"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setStep(3)}
                className="w-full py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2"
              >
                Next Step <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h3 className="font-bold text-white text-lg">Verify Verification Code</h3>
                <p className="text-sm text-gray-400">Enter the 6-digit code generated by your authenticator app.</p>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
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
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 bg-[#1A1A1A] text-white font-bold rounded-xl border border-[#C9A96E]/10 hover:bg-[#222] transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleVerifyAndEnable}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-[2] py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  Verify & Enable
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">2FA Enabled Successfully!</h2>
                <p className="text-gray-400">Your account is now more secure. You will need to enter a code from your app to log in.</p>
              </div>
              <button 
                onClick={() => window.location.href = "/profile"}
                className="w-full py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all"
              >
                Back to Profile
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
