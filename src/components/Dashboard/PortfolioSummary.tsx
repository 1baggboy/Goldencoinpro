import React from 'react';
import { Wallet, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PortfolioSummaryProps {
    usdBalance: number;
    tradingBalanceUsd: number;
    btcChange: number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({usdBalance, tradingBalanceUsd, btcChange}) => {
    const total = usdBalance + tradingBalanceUsd;
  return (
    <div className="bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#0B0B0B] dark:text-white">Portfolio Summary</h3>
             <Wallet className="text-[#C9A96E]" size={20} />
        </div>
        <div className="space-y-4">
            <div className="flex justify-between">
                <span className="text-gray-500">Total Value</span>
                <span className="font-bold text-white">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-500">24h Change</span>
                <span className={cn("font-bold", btcChange >= 0 ? "text-green-500" : "text-red-500")}>
                    {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%
                </span>
            </div>
        </div>
    </div>
  );
};
