import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Send,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SupportWidget } from "../components/SupportWidget";
import { Footer } from "../components/Footer";
import { Logo } from "../components/Logo";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestoreErrorHandler";

import { PublicLayout } from "../components/PublicLayout";

export const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    const allowedDomains = ['gmail.com', 'live.com', 'outlook.com', 'icloud.com', 'yahoo.com', 'hotmail.com'];
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
      setError("Please use a recognized email provider (e.g., Gmail, Outlook, Yahoo, iCloud, Live).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "contact_messages"), {
        ...formData,
        submittedAt: new Date().toISOString(),
        status: "new"
      });
      setSubmitted(true);
      setFormData({ fullName: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, "contact_messages");
      setError("Failed to send message. Please try again or use direct email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column: Contact info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#C9A96E] font-black uppercase tracking-[0.3em] text-xs"
              >
                Connect With Us
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase font-display italic"
              >
                Institutional <br />
                <span className="text-[#C9A96E]">Support.</span>
              </motion.h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-md text-xl leading-relaxed font-medium">
                Our global specialized support team is available 24/7 to assist with your portfolio requirements.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-16 h-16 bg-[#C9A96E]/10 rounded-2xl border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] group-hover:bg-[#C9A96E] group-hover:text-black transition-all duration-500 shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest text-xs mb-1">Email Channels</h3>
                  <a href="mailto:info.goldencoinltd@gmail.com" className="text-xl font-bold text-slate-950 dark:text-white hover:text-[#C9A96E] transition-colors block">info.goldencoinltd@gmail.com</a>
                  <a href="mailto:compliance@goldencoin.live" className="text-sm font-medium text-gray-500 hover:text-[#C9A96E] transition-colors mt-1 block">compliance@goldencoin.live</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-16 h-16 bg-[#C9A96E]/10 rounded-2xl border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] group-hover:bg-[#C9A96E] group-hover:text-black transition-all duration-500 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest text-xs mb-1">Global HQ</h3>
                  <p className="text-xl font-bold text-slate-950 dark:text-white leading-tight">22 Bishopsgate, <br />London EC2N 4BQ, UK</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-16 h-16 bg-[#C9A96E]/10 rounded-2xl border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] group-hover:bg-[#C9A96E] group-hover:text-black transition-all duration-500 shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest text-xs mb-1">Entity Status</h3>
                  <p className="text-xl font-bold text-slate-950 dark:text-white uppercase tracking-tighter">Reg No: GC-77821-LTD</p>
                </div>
              </div>
            </div>

            {/* Embedded Map */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="w-full aspect-video rounded-[3rem] overflow-hidden border border-[#C9A96E]/20 bg-slate-200 dark:bg-slate-900 shadow-[0_32px_64px_rgba(0,0,0,0.1)] group relative"
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.905626245037!2d-0.08643802334057885!3d51.51493011015694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48760352ce8dd61f%3A0x6b772b152d194c25!2s22%20Bishopsgate!5e0!3m2!1sen!2suk!4v1714620000000!5m2!1sen!2suk" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(1) contrast(1.2) invert(0.1)' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="group-hover:opacity-100 dark:invert-[0.9] dark:contrast-[1.5] transition-opacity duration-1000"
              />
            </motion.div>
          </div>

          {/* Right Column: Form */}
          <div className="relative">
            <div className="sticky top-32">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-[#C9A96E]/20 rounded-[3rem] p-10 lg:p-14 shadow-3xl relative overflow-hidden"
              >
                {/* Abstract decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A96E]/5 rounded-bl-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A96E]/5 rounded-tr-full blur-[100px]" />

                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit} 
                      className="space-y-8 relative z-10"
                    >
                      <h2 className="text-3xl font-black uppercase tracking-tight italic font-display">Inquiry Channel</h2>
                      
                      {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-[1.5rem] text-sm font-bold flex items-center gap-3">
                          <AlertTriangle size={18} />
                          {error}
                        </div>
                      )}

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Legal Full Name</label>
                          <input 
                            required
                            type="text" 
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-[#C9A96E]/10 rounded-[1.25rem] py-5 px-8 outline-none focus:border-[#C9A96E]/60 transition-all font-medium text-lg dark:text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Verified Email Address</label>
                          <input 
                            required
                            type="email" 
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-[#C9A96E]/10 rounded-[1.25rem] py-5 px-8 outline-none focus:border-[#C9A96E]/60 transition-all font-medium text-lg dark:text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Subject / Category</label>
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. Asset Strategy Query"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-[#C9A96E]/10 rounded-[1.25rem] py-5 px-8 outline-none focus:border-[#C9A96E]/60 transition-all font-medium text-lg dark:text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Message Payload</label>
                          <textarea 
                            required
                            rows={4}
                            placeholder="Detailed inquiry..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-[#C9A96E]/10 rounded-[1.25rem] py-5 px-8 outline-none focus:border-[#C9A96E]/60 transition-all font-medium text-lg dark:text-white resize-none"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C9A96E] hover:bg-[#D4B985] text-black font-black uppercase tracking-[0.3em] py-6 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 text-base shadow-2xl shadow-[#C9A96E]/20"
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send size={20} />
                            Transmit Inquiry
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-20 space-y-8"
                    >
                      <div className="w-24 h-24 bg-[#C9A96E]/20 text-[#C9A96E] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#C9A96E]/20">
                        <CheckCircle2 size={48} />
                      </div>
                      <h2 className="text-4xl font-black uppercase tracking-tight italic font-display">Transmission <br /> Successful</h2>
                      <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto text-lg leading-relaxed">
                        Your inquiry has been queued for institutional review. Expect a response at <span className="font-bold text-[#C9A96E] break-all">{formData.email}</span> within 24 hours.
                      </p>
                      <button 
                        onClick={() => setSubmitted(false)}
                        className="text-[#C9A96E] font-black uppercase tracking-[0.2em] text-sm hover:underline"
                      >
                        Send another transmission
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <SupportWidget />
    </PublicLayout>
  );
};
