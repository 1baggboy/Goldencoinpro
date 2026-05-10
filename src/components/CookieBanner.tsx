import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    functional: false,
    analytical: false,
    marketing: false,
  });

  useEffect(() => {
    const handleShowPreferences = () => {
      setIsVisible(true);
      setShowPreferences(true);
      document.body.style.overflow = "hidden";
    };

    window.addEventListener("show-cookie-preferences", handleShowPreferences);

    const consent = localStorage.getItem("goldencoin_cookie_consent_v2");
    if (!consent) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("show-cookie-preferences", handleShowPreferences);
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleConfirm = () => {
    localStorage.setItem("goldencoin_cookie_consent_v2", JSON.stringify({
      ...preferences,
      necessary: true,
      timestamp: Date.now()
    }));
    setIsVisible(false);
    setShowPreferences(false);
    document.body.style.overflow = "unset";
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAcceptAll = () => {
    const allOn = { functional: true, analytical: true, marketing: true };
    setPreferences(allOn);
    localStorage.setItem("goldencoin_cookie_consent_v2", JSON.stringify({
      ...allOn,
      necessary: true,
      timestamp: Date.now()
    }));
    setIsVisible(false);
    setShowPreferences(false);
    document.body.style.overflow = "unset";
  };

  const handleOnlyNecessary = () => {
    const allOff = { functional: false, analytical: false, marketing: false };
    setPreferences(allOff);
    localStorage.setItem("goldencoin_cookie_consent_v2", JSON.stringify({
      ...allOff,
      necessary: true,
      timestamp: Date.now()
    }));
    setIsVisible(false);
    setShowPreferences(false);
    document.body.style.overflow = "unset";
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {/* Universal Backdrop Blocker */}
      <motion.div 
        key="cookie-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-md"
      />

      {/* Main Banner */}
      {!showPreferences && (
        <motion.div
          key="main-cookie-banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[9998] bg-[#1A1A1B] border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-6 md:p-8"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-gray-200 text-lg md:text-xl font-medium">
                Goldencoin uses cookies to improve your browsing...
              </p>
              <Link to="/cookie-policy" className="text-[#C9A96E] hover:underline underline-offset-4 decoration-2 font-bold text-sm transition-all inline-block">
                Goldencoin cookies and tracking notice
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-8">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg border border-white/10 transition-all active:scale-95 text-base"
              >
                <Check size={18} />
                Accept all
              </button>

              <button
                type="button"
                onClick={handleOnlyNecessary}
                className="px-6 py-3 rounded-lg border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition-all active:scale-95 text-base"
              >
                Only necessary
              </button>

              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="text-gray-400 hover:text-white font-bold transition-colors text-base"
              >
                Preferences
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences Modal Overlay */}
      {showPreferences && (
        <div key="preferences-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            key="preferences-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#0F0F10]/95 backdrop-blur-xl"
            onClick={() => setShowPreferences(false)}
          />
          
          <motion.div
            key="preferences-modal"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative bg-slate-900/60 backdrop-blur-2xl w-full max-w-lg rounded-[2rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)] border border-[#C9A96E]/20"
          >
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase font-display italic">Cookie preferences</h2>
                <button 
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-500 hover:text-[#C9A96E] transition-colors p-1"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-5 text-gray-400 text-sm leading-relaxed mb-10">
                <p>
                  Because we value your privacy, you can select which cookies you allow.{" "}
                  <Link to="/cookie-policy" className="text-[#C9A96E] hover:underline underline-offset-4 decoration-2 font-bold transition-all">
                    Review our cookies and tracking notice
                  </Link>
                </p>
                <p>
                  Goldencoin tracks <span className="text-white font-black uppercase tracking-widest text-[10px] bg-[#C9A96E]/20 px-2 py-0.5 rounded border border-[#C9A96E]/30 mr-1">strictly necessary</span> cookies that are essential for our products to function, so you can't adjust these.
                </p>
              </div>

              <div className="space-y-6 mb-12">
                {/* Functional */}
                <div className="flex gap-5 cursor-pointer group select-none items-center" onClick={() => togglePreference("functional")}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${preferences.functional ? 'bg-[#C9A96E] border-[#C9A96E] shadow-[0_0_15px_rgba(201,169,110,0.4)]' : 'bg-transparent border-gray-700 group-hover:border-[#C9A96E]/50'}`}>
                    {preferences.functional && <Check size={16} className="text-[#0B0B0B] stroke-[4]" />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base leading-tight">Allow functional cookies</h4>
                    <p className="text-xs text-gray-500 mt-1">Provides enhanced functionality and personalization.</p>
                  </div>
                </div>

                {/* Analytical */}
                <div className="flex gap-5 cursor-pointer group select-none items-center" onClick={() => togglePreference("analytical")}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${preferences.analytical ? 'bg-[#C9A96E] border-[#C9A96E] shadow-[0_0_15px_rgba(201,169,110,0.4)]' : 'bg-transparent border-gray-700 group-hover:border-[#C9A96E]/50'}`}>
                    {preferences.analytical && <Check size={16} className="text-[#0B0B0B] stroke-[4]" />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base leading-tight">Allow analytical cookies</h4>
                    <p className="text-xs text-gray-500 mt-1">Measures usage to improve product performance.</p>
                  </div>
                </div>

                {/* Marketing */}
                <div className="flex gap-5 cursor-pointer group select-none items-center" onClick={() => togglePreference("marketing")}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${preferences.marketing ? 'bg-[#C9A96E] border-[#C9A96E] shadow-[0_0_15px_rgba(201,169,110,0.4)]' : 'bg-transparent border-gray-700 group-hover:border-[#C9A96E]/50'}`}>
                    {preferences.marketing && <Check size={16} className="text-[#0B0B0B] stroke-[4]" />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base leading-tight">Allow marketing cookies</h4>
                    <p className="text-xs text-gray-500 mt-1">Used for targeted advertising.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-8 items-center pt-6 border-t border-white/5">
                <button 
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-400 hover:text-white font-black uppercase tracking-widest text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  className="bg-[#C9A96E] hover:bg-[#D4B985] text-[#0B0B0B] font-black px-10 py-4 rounded-2xl transition-all active:scale-95 shadow-[0_8px_25px_rgba(201,169,110,0.3)] uppercase tracking-widest text-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
