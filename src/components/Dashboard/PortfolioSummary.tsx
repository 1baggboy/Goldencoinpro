import React, { useEffect } from 'react';
import { Wallet, Maximize2, Minimize2, ArrowLeftRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

interface PortfolioSummaryProps {
    usdBalance: number;
    tradingBalanceUsd: number;
    btcChange: number;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    onSwap?: () => void;
}

const AnimatedTotal = ({ value }: { value: number }) => {
    const count = useMotionValue(0);
    const displayValue = useTransform(count, (latest) => 
        latest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );

    useEffect(() => {
        const controls = animate(count, value, { duration: 1, ease: 'easeOut' });
        return () => controls.stop();
    }, [value, count]);

    return <motion.span>{displayValue}</motion.span>;
};

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({usdBalance, tradingBalanceUsd, btcChange, isExpanded, onToggleExpand, onSwap}) => {
    // They are mirrors now, so total is just the usdBalance
    const total = usdBalance;
  return (
    <div className={cn("bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6 transition-all", isExpanded ? "md:col-span-2" : "")}>
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <Wallet className="text-[#C9A96E]" size={20} />
                <h3 className="text-xl font-bold text-[#0B0B0B] dark:text-white">Portfolio Summary</h3>
            </div>
            <div className="flex items-center gap-2">
                {onSwap && (
                    <button 
                        onClick={onSwap}
                        className="p-1.5 bg-slate-200 dark:bg-slate-800 text-gray-500 rounded-lg hover:text-[#C9A96E] transition-colors"
                        title="Reorder Widget"
                    >
                        <ArrowLeftRight size={16} />
                    </button>
                )}
                {onToggleExpand && (
                    <button 
                        onClick={onToggleExpand}
                        className="p-1.5 bg-slate-200 dark:bg-slate-800 text-gray-500 rounded-lg hover:text-[#C9A96E] transition-colors"
                        title={isExpanded ? "Collapse Widget" : "Expand Widget"}
                    >
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                )}
            </div>
        </div>
        <div className={cn("gap-4", isExpanded ? "grid grid-cols-2" : "space-y-4")}>
            <div className="flex justify-between bg-white dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                <span className="text-gray-500">Total Value</span>
                <span className="font-bold text-slate-900 dark:text-white">$<AnimatedTotal value={total} /></span>
            </div>
            <div className="flex justify-between bg-white dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                <span className="text-gray-500">24h Change</span>
                <span className={cn("font-bold", btcChange >= 0 ? "text-green-500" : "text-red-500")}>
                    {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%
                </span>
            </div>
        </div>
    </div>
  );
};
