import React from 'react';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-[#0B0B0B] dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => window.location.reload()}
                className="p-4 bg-slate-200 dark:bg-slate-950 rounded-xl hover:bg-[#C9A96E]/20 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
            >
                <Zap size={20} className="text-[#C9A96E]" />
                <span className="text-xs font-bold uppercase">Check Price</span>
            </button>
            <button 
                onClick={() => navigate('/transactions')}
                className="p-4 bg-slate-200 dark:bg-slate-950 rounded-xl hover:bg-[#C9A96E]/20 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
            >
                <Clock size={20} className="text-[#C9A96E]" />
                <span className="text-xs font-bold uppercase">Last Transaction</span>
            </button>
        </div>
    </div>
  );
};
