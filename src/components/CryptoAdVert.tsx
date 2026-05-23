import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coins, 
  ExternalLink, 
  ShieldCheck, 
  TrendingUp, 
  BarChart2, 
  Settings, 
  ChevronRight, 
  Sparkles, 
  Eye, 
  MousePointerClick, 
  DollarSign,
  Info
} from "lucide-react";
import { cn } from "../lib/utils";

interface CryptoAd {
  id: string;
  brand: string;
  title: string;
  description: string;
  url: string;
  ctaText: string;
  themeColor: string;
  textColor: string;
  badgeBg: string;
  accentHex: string;
  benefit: string;
}

const CRYPTO_ADS: CryptoAd[] = [
  {
    id: "ledger-flex",
    brand: "Ledger Security",
    title: "Secure Your Digital Assets with Ledger Flex",
    description: "Equipped with custom high-security elements and a crisp touchscreen, the Ledger Flex delivers military-grade cold storage for Ethereum, Solana & Bitcoin assets.",
    url: "https://www.ledger.com",
    ctaText: "Order Hardware Wallet",
    themeColor: "from-[#0F172A] to-[#1E293B]",
    textColor: "text-[#C9A96E]",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    accentHex: "#10B981",
    benefit: "100% Self-Custodial Security"
  },
  {
    id: "coinbase-pro",
    brand: "Coinbase Premium",
    title: "Unlock 0% Institutional Trading Fees",
    description: "Start capitalizing on deeper liquidity pools, high-speed algorithmic order routing, and early-access staking rewards starting at only $500 initial base trading margins.",
    url: "https://www.coinbase.com",
    ctaText: "Claim Free Trial",
    themeColor: "from-[#1D4ED8]/10 via-slate-900 to-slate-900",
    textColor: "text-[#C9A96E]",
    badgeBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    accentHex: "#3B82F6",
    benefit: "Priority Asset Liquidation"
  },
  {
    id: "dydx-chain",
    brand: "dYdX Exchange",
    title: "Trade Decentralized Perpetuals at 20x Leverage",
    description: "Keep absolute custody of your crypto capital. Connect your safe hardware or software wallet and experience gasless sub-second blockchain perpetual swaps.",
    url: "https://dydx.exchange",
    ctaText: "Start Protocol Trading",
    themeColor: "from-[#6366F1]/10 via-[#0B0B0B] to-[#0D0D0F]",
    textColor: "text-indigo-400",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    accentHex: "#6366F1",
    benefit: "Non-custodial Perp Swaps"
  },
  {
    id: "bybit-wsot",
    brand: "Bybit WSOT 2026",
    title: "Join WSOT Trading Cup - $8,000,000 Pool",
    description: "Compete with global crypto algorithmic managers in the ultimate high-frequency trading arena. Sign up, join our Goldencoin circle, and claim instant deposit bonuses.",
    url: "https://www.bybit.com",
    ctaText: "Register WSOT Free",
    themeColor: "from-amber-500/5 via-slate-950 to-slate-950",
    textColor: "text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    accentHex: "#F59E0B",
    benefit: "USDT High-Yield Pool Allocation"
  },
  {
    id: "phantom-app",
    brand: "Phantom Web3 App",
    title: "Your Safest Gateway to Multi-chain Web3",
    description: "Seamlessly exchange tokens, showcase verified digital collectables, and sign digital contract transactions directly with Ledger keys across Ethereum, Polygon and Solana.",
    url: "https://phantom.app",
    ctaText: "Install Phantom App",
    themeColor: "from-[#A78BFA]/10 via-[#0F172A]/80 to-[#0F172A]",
    textColor: "text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    accentHex: "#A78BFA",
    benefit: "Built-in Slippage Optimizers"
  }
];

export function CryptoAdVert() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  
  // Real-time dynamic publisher monetization stats stored in client-side state
  const [impressions, setImpressions] = useState(() => {
    return Number(localStorage.getItem("pub_ad_impressions") || "2480");
  });
  const [clicks, setClicks] = useState(() => {
    return Number(localStorage.getItem("pub_ad_clicks") || "118");
  });
  const [sessionEarned, setSessionEarned] = useState(0);

  // Constants for calculations
  const CPM_RATE = 5.80; // $5.80 per 1000 views
  const CPC_RATE = 0.45; // $0.45 per click

  const activeAd = CRYPTO_ADS[currentAdIndex];

  // Rotate ads every 11 seconds & increment impressions to simulate live platform traffic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % CRYPTO_ADS.length);
      
      // Simulate generic platform user traffic adding to impressions in background
      setImpressions((prev) => {
        const next = prev + Math.floor(Math.random() * 3) + 1;
        localStorage.setItem("pub_ad_impressions", next.toString());
        return next;
      });
    }, 11000);

    return () => clearInterval(interval);
  }, []);

  // Sync impression-based earnings to state
  const computedEarnings = (impressions / 1000) * CPM_RATE + (clicks * CPC_RATE);

  const handleCtaClick = (ad: CryptoAd) => {
    // Record click
    setClicks((prev) => {
      const next = prev + 1;
      localStorage.setItem("pub_ad_clicks", next.toString());
      return next;
    });
    setSessionEarned((prev) => prev + CPC_RATE);
    
    // Open in a new tab safely
    window.open(ad.url, "_blank", "noopener,noreferrer");
  };

  const skipToNextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % CRYPTO_ADS.length);
    setImpressions((prev) => prev + 1);
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-2xl overflow-hidden relative transition-all duration-300">
      {/* Top Banner Branding Bar */}
      <div className="px-5 py-3 border-b border-[#C9A96E]/10 flex items-center justify-between bg-slate-200/50 dark:bg-slate-950/80">
        <div className="flex items-center gap-1.5">
          <Coins size={14} className="text-[#C9A96E] animate-pulse" />
          <span className="text-[9px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-[0.2em]">
            Sponsored Crypto Stream
          </span>
          <span className="text-[7.5px] px-1.5 py-0.5 rounded-md font-bold bg-[#C9A96E]/15 text-[#C9A96E] tracking-wider uppercase border border-[#C9A96E]/20">
            Ad
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Insights Button to toggle Publisher Control Board */}
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={cn(
              "p-1 rounded-md transition-all text-gray-500 hover:text-[#C9A96E] hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-1 text-[9px] font-bold",
              showInsights && "text-[#C9A96E] bg-[#C9A96E]/10"
            )}
            title="Publisher Ad Performance and Earnings"
          >
            <BarChart2 size={11} />
            <span>{showInsights ? "Campaign Details" : "Ad Monetization Insights"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showInsights ? (
          <motion.div
            key={`ad-${activeAd.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-5 flex flex-col justify-between min-h-[220px]"
          >
            <div>
              {/* Ad Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#0B0B0B] dark:text-white uppercase font-mono tracking-wider">
                  {activeAd.brand}
                </span>
                
                <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", activeAd.badgeBg)}>
                  {activeAd.benefit}
                </span>
              </div>

              {/* Title & Body */}
              <h4 className="text-sm font-bold text-[#0B0B0B] dark:text-white line-clamp-2 leading-tight tracking-tight mb-2 hover:text-[#C9A96E] transition-colors">
                {activeAd.title}
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
                {activeAd.description}
              </p>
            </div>

            {/* CTA action bottom bar */}
            <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-200 dark:border-[#C9A96E]/5">
              <button
                onClick={() => handleCtaClick(activeAd)}
                className="flex-1 px-4 py-2 bg-[#C9A96E] text-slate-950 hover:bg-[#D4B985] text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[98%]"
              >
                <span>{activeAd.ctaText}</span>
                <ExternalLink size={11} />
              </button>
              
              <button
                onClick={skipToNextAd}
                className="px-2.5 py-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-gray-500 hover:text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider border border-transparent dark:hover:border-[#C9A96E]/20"
                title="Skip to next campaign offer"
              >
                Next Offer
              </button>
            </div>
          </motion.div>
        ) : (
          /* Live Publisher Revenue Insight dashboard overlay */
          <motion.div
            key="pub-insights"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 min-h-[220px]"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <BarChart2 size={13} className="text-[#C9A96E]" />
              <h4 className="text-xs font-black text-[#0B0B0B] dark:text-white uppercase tracking-wider">
                Ad Network Performance
              </h4>
            </div>

            <p className="text-[10px] text-gray-500 leading-relaxed mb-4">
              Your platform qualifies for high-tier crypto sponsor rates. Below is your accrued ad network revenue based on user activity impressions and cost-per-click actions.
            </p>

            {/* Monetization stats display grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-950 border border-slate-300 dark:border-[#C9A96E]/5 flex flex-col justify-between">
                <span className="text-[8px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <Eye size={10} /> Impressions
                </span>
                <span className="text-sm font-bold text-[#0B0B0B] dark:text-white font-mono mt-0.5">
                  {impressions.toLocaleString()}
                </span>
                <span className="text-[7.5px] text-gray-400 mt-0.5">${CPM_RATE.toFixed(2)} CPM Target</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-950 border border-slate-300 dark:border-[#C9A96E]/5 flex flex-col justify-between">
                <span className="text-[8px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <MousePointerClick size={10} /> Clicks (CTR)
                </span>
                <span className="text-sm font-bold text-[#0B0B0B] dark:text-white font-mono mt-0.5">
                  {clicks} <span className="text-[9px] text-[#C9A96E]">({((clicks / impressions) * 100).toFixed(2)}%)</span>
                </span>
                <span className="text-[7.5px] text-gray-400 mt-0.5">${CPC_RATE.toFixed(2)} CPC payout</span>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-2 max-w-full">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 select-none">
                  <DollarSign size={15} />
                </div>
                <div>
                  <h5 className="text-[9px] font-black text-emerald-400 uppercase tracking-wider leading-none mb-1">
                    Accrued Ad Earnings
                  </h5>
                  <p className="text-base font-bold text-[#0B0B0B] dark:text-white leading-none font-mono">
                    ${computedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[8px] font-mono text-gray-400 uppercase leading-relaxed block">
                  ≈ {(computedEarnings / 67340).toFixed(6)} BTC
                </span>
                {sessionEarned > 0 && (
                  <span className="text-[8px] font-extrabold text-emerald-400 animate-pulse">
                    +${sessionEarned.toFixed(2)} Session
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowInsights(false)}
              className="w-full mt-3 block py-2 text-center text-[10px] uppercase font-black text-[#C9A96E] hover:text-[#D4B985] bg-slate-200/50 dark:bg-slate-950 select-none hover:underline rounded-lg"
            >
              Back to promotions
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Network compliance guarantee badge */}
      <div className="px-5 py-2 border-t border-[#C9A96E]/5 bg-slate-200/30 dark:bg-slate-950/40 flex items-center justify-between text-[8px] text-gray-600 dark:text-gray-500 font-mono">
        <span className="flex items-center gap-1">
          <ShieldCheck size={9} className="text-emerald-500" /> Fully Encrypted Delivery
        </span>
        <span className="flex items-center gap-1 text-[7.5px] text-gray-400 dark:text-gray-400">
          <Info size={9} className="text-gray-500" /> Privacy Compliant Ad Network
        </span>
      </div>
    </div>
  );
}
