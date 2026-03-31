import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  User, 
  CreditCard, 
  Camera, 
  Check, 
  AlertCircle,
  Upload,
  Info,
  X,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useNotifications } from "../NotificationContext";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export const KYC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    idType: "passport",
    idNumber: "",
  });
  const [idImage, setIdImage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.fullName.trim()) {
        setError("Please enter your full legal name.");
        return;
      }
      if (!formData.idNumber.trim()) {
        setError("Please enter your ID number.");
        return;
      }
    }
    setStep(step + 1);
  };
  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 700KB for base64 handling to stay under Firestore 1MB limit)
    if (file.size > 700 * 1024) {
      setError("File is too large. Please upload an image smaller than 700KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setIdImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setError(null);
    if (!idImage) {
      setError("Please upload your ID image.");
      return;
    }
    setLoading(true);
    try {
      // Create KYC submission
      await addDoc(collection(db, "kyc_submissions"), {
        userId: user.uid,
        ...formData,
        idImage,
        status: "pending",
        submittedAt: new Date().toISOString(),
      });

      // Update user profile status
      await updateDoc(doc(db, "users", user.uid), {
        kycStatus: "pending"
      });
      
      await addNotification(user.uid, "KYC Submitted", "Your identity verification documents have been submitted and are pending review.", "info");

      setShowSuccessModal(true);
      setSuccess(true);
    } catch (err: any) {
      console.error("KYC error:", err);
      setError("Failed to submit KYC: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (profile?.kycStatus === 'verified') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
          <ShieldCheck size={48} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">You're Verified!</h1>
        <p className="text-gray-400">Your account has full access to all Goldencoin features. Your identity has been successfully confirmed.</p>
        <div className="p-6 bg-slate-900 border border-green-500/20 rounded-2xl flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Verification Level</p>
            <p className="text-lg font-bold text-white">Institutional Tier</p>
          </div>
          <div className="px-4 py-1.5 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">
            ACTIVE
          </div>
        </div>
      </div>
    );
  }

  if (profile?.kycStatus === 'pending' || success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-slate-900 border border-[#C9A96E]/10 rounded-3xl relative">
        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => {
                  setShowSuccessModal(false);
                  setSuccess(true);
                }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-slate-900 border border-[#C9A96E]/20 rounded-3xl p-8 text-center shadow-2xl"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6">
                  <Check size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Submission Successful</h3>
                <p className="text-gray-400 mb-8">Your KYC verification documents have been successfully submitted. Our team will verify them within an hour.</p>
                <button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSuccess(true);
                  }}
                  className="w-full py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all"
                >
                  Got it, thanks!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="w-24 h-24 bg-[#C9A96E]/10 rounded-full flex items-center justify-center text-[#C9A96E] mb-8 relative">
          <ShieldCheck size={48} />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-t-[#C9A96E] border-r-transparent border-b-transparent border-l-transparent rounded-full"
          />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Verification in Progress</h2>
        <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
          Your documents have been successfully submitted. Our team is currently reviewing your information. This process typically takes less than an hour.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
          <div className="p-4 bg-slate-950 rounded-xl border border-[#C9A96E]/5">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</p>
            <p className="text-sm font-bold text-yellow-500">Pending Review</p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-[#C9A96E]/5">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Estimated Time</p>
            <p className="text-sm font-bold text-white">~1 Hour</p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-[#C9A96E]/5">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Last Updated</p>
            <p className="text-sm font-bold text-white">Just now</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-8 py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center gap-2"
        >
          Go to Dashboard
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {profile?.kycStatus === 'rejected' && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 shrink-0">
            <X size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Verification Rejected</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your previous submission was rejected for the following reason: <span className="text-red-400 font-bold">{profile.kycRejectionReason || "No specific reason provided."}</span>. Please review your information and resubmit.
            </p>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center text-[#C9A96E]">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">KYC Verification</h1>
          <p className="text-gray-400">Complete your identity verification to unlock full features.</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4 mb-12">
        <StepIndicator active={step >= 1} completed={step > 1} label="Personal Info" />
        <div className={cn("flex-1 h-1 rounded-full", step > 1 ? "bg-[#C9A96E]" : "bg-slate-900")}></div>
        <StepIndicator active={step >= 2} completed={step > 2} label="ID Document" />
      </div>

      <div className="bg-slate-900 border border-[#C9A96E]/10 rounded-3xl p-8 md:p-12 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-medium">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-xl py-4 px-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                  placeholder="As shown on your ID"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">ID Type</label>
                <select 
                  value={formData.idType}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                  className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-xl py-4 px-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                >
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID Card</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-xl py-4 px-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                  placeholder="Enter ID number"
                />
              </div>
            </div>
            <button onClick={handleNext} className="w-full py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all mt-8">
              Continue
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Upload ID Document</h3>
            
            {!idImage ? (
              <label className="block p-12 border-2 border-dashed border-[#C9A96E]/20 rounded-3xl text-center space-y-4 hover:border-[#C9A96E]/40 transition-all cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleImageUpload(e)}
                />
                <div className="w-16 h-16 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto text-[#C9A96E] group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-white font-bold">Click to upload ID Front</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or PDF (max. 2MB)</p>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-[#C9A96E]/20">
                  <img src={idImage} alt="ID Preview" className="w-full h-full object-contain" />
                  <button 
                    onClick={() => setIdImage(null)}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-green-500 text-sm justify-center">
                  <Check size={16} />
                  ID Image uploaded successfully
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button onClick={handleBack} className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-xl border border-[#C9A96E]/10 hover:bg-slate-700 transition-all">
                Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading || !idImage}
                className="flex-1 py-4 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Verification"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const StepIndicator = ({ active, completed, label }: any) => (
  <div className="flex flex-col items-center gap-2">
    <div className={cn(
      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
      completed ? "bg-[#C9A96E] text-[#0B0B0B]" : active ? "bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40" : "bg-slate-900 text-gray-600 border border-transparent"
    )}>
      {completed ? <Check size={20} /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
    </div>
    <span className={cn("text-[10px] font-bold uppercase tracking-widest", active ? "text-[#C9A96E]" : "text-gray-600")}>{label}</span>
  </div>
);
