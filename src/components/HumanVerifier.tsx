import React, { useState, useEffect, useRef } from "react";
import { Shield, RefreshCw, AlertCircle, Check, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HumanVerifierProps {
  onVerify: (success: boolean) => void;
  isVerified: boolean;
  error?: string;
}

export const HumanVerifier: React.FC<HumanVerifierProps> = ({
  onVerify,
  isVerified,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setUserInput("");
    setVerifyError("");
    return text;
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        drawCaptcha();
      }, 50);
    }
  }, [isOpen]);

  // Redraw when captcha text updates
  useEffect(() => {
    if (isOpen && captchaText) {
      drawCaptcha();
    }
  }, [captchaText]);

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background - theme matching (charcoal/dark vs gold/slate)
    const isDark = document.documentElement.classList.contains("dark");
    ctx.fillStyle = isDark ? "#111111" : "#f1f5f9";
    ctx.fillRect(0, 0, width, height);

    // Decorative distortion grid lines
    ctx.strokeStyle = isDark ? "rgba(201, 169, 110, 0.15)" : "rgba(201, 169, 110, 0.3)";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, 0);
      ctx.lineTo(Math.random() * width, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, Math.random() * height);
      ctx.lineTo(width, Math.random() * height);
      ctx.stroke();
    }

    // Draw random curves
    ctx.strokeStyle = "#C9A96E";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * height);
    ctx.bezierCurveTo(
      width / 4, Math.random() * height,
      (width * 3) / 4, Math.random() * height,
      width, Math.random() * height
    );
    ctx.stroke();

    // Noise dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#C9A96E" : isDark ? "#ffffff" : "#0f172a";
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Write captcha text with letter random rotation, shift, style
    const spacing = width / (captchaText.length + 1);
    ctx.font = "bold 24px monospace";
    ctx.textBaseline = "middle";

    for (let i = 0; i < captchaText.length; i++) {
      const char = captchaText[i];
      const x = (i + 1) * spacing + (Math.random() * 6 - 3);
      const y = height / 2 + (Math.random() * 8 - 4);

      // Rotation angle
      const angle = (Math.random() * 30 - 15) * Math.PI / 180;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Color variation in shades of brand gold and contrasting gray/white
      if (i % 3 === 0) {
        ctx.fillStyle = "#C9A96E";
      } else if (i % 3 === 1) {
        ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
      } else {
        ctx.fillStyle = isDark ? "#94a3b8" : "#475569";
      }

      ctx.fillText(char, -10, 0);
      ctx.restore();
    }
  };

  const handleCheckboxClick = () => {
    if (isVerified) return;
    setIsVerifying(true);
    setTimeout(() => {
      generateCaptcha();
      setIsOpen(true);
      setIsVerifying(false);
    }, 600);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setVerifyError("");
    setUserInput("");
  };

  const handleVerifySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (userInput.toUpperCase().trim() === captchaText) {
      setIsOpen(false);
      onVerify(true);
      setVerifyError("");
    } else {
      setVerifyError("Incorrect code. Please try again.");
      generateCaptcha();
    }
  };

  return (
    <div className="space-y-3 w-full" id="recaptcha-widget-root">
      {/* reCAPTCHA style standard widget layout */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B0B0B] border border-slate-200 dark:border-[#C9A96E]/10 rounded-xl shadow-xs w-full">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCheckboxClick}
            disabled={isVerified || isVerifying}
            className={`w-7 h-7 rounded-md border flex items-center justify-center transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/20 ${
              isVerified 
                ? "bg-[#C9A96E] border-[#C9A96E] text-slate-950" 
                : "border-slate-300 dark:border-[#C9A96E]/30 bg-white dark:bg-[#0B0B0B] hover:border-[#C9A96E]/60"
            }`}
          >
            <AnimatePresence mode="wait">
              {isVerifying ? (
                <motion.div
                  key="spinner"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-[#C9A96E] border-t-transparent rounded-full"
                />
              ) : isVerified ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check size={18} className="stroke-[3]" />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </button>
          
          <span className="text-sm font-medium text-slate-700 dark:text-gray-300 select-none">
            {isVerified ? "Verification Successful" : "I'm not a robot"}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <Shield size={22} className="text-[#C9A96E] animate-pulse" />
          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-semibold">reCAPTCHA</span>
          <span className="text-[7px] text-slate-300 dark:text-slate-600">Secure Shield v3</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Verification Modal Popover */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-[#C9A96E]/20 rounded-2xl w-full max-w-sm overflow-hidden p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="text-[#C9A96E]" size={20} />
                  <h4 className="text-md font-bold text-slate-950 dark:text-white">Security Verification</h4>
                </div>
                <HelpCircle size={16} className="text-slate-400 hover:text-[#C9A96E] cursor-pointer transition-colors" />
              </div>

              <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 leading-relaxed">
                Enter the distorted alphanumeric security sequence below to verify that you are a human.
              </p>

              <div className="space-y-4">
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-[#C9A96E]/15 bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-4">
                  <canvas 
                    ref={canvasRef} 
                    width={280} 
                    height={80} 
                    className="rounded-lg shadow-inner bg-slate-100 dark:bg-slate-900 select-none cursor-pointer"
                    onClick={generateCaptcha}
                    title="Click to refresh image"
                  />
                  
                  <div className="flex w-full justify-between items-center mt-3">
                    <span className="text-[10px] text-slate-400">Disturbed Gold Matrix</span>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="flex items-center gap-1.5 text-xs text-[#C9A96E] hover:text-[#D4B985] font-medium transition-colors"
                    >
                      <RefreshCw size={12} /> Refresh
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleVerifySubmit();
                      }
                    }}
                    placeholder="Enter security code"
                    className="w-full text-center tracking-[0.2em] font-bold text-lg border rounded-xl py-3 px-4 outline-none transition-all bg-slate-50 border-slate-200 text-slate-950 focus:border-[#C9A96E]/40 dark:bg-[#0B0B0B] dark:border-[#C9A96E]/15 dark:text-white dark:focus:border-[#C9A96E]/40"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                  />
                  
                  {verifyError && (
                    <div className="flex items-center justify-center gap-1.5 text-red-500 text-xs pt-1">
                      <AlertCircle size={13} />
                      <span>{verifyError}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3 text-sm font-semibold border rounded-xl transition-all border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-[#C9A96E]/10 dark:text-gray-300 dark:hover:bg-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifySubmit()}
                    className="flex-1 py-3 bg-[#C9A96E] text-slate-950 text-sm font-bold rounded-xl hover:bg-[#D4B985] transition-all"
                  >
                    Verify Match
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
