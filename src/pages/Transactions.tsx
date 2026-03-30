import React, { useEffect, useState } from "react";
import { 
  History, 
  Search, 
  Filter, 
  ArrowDownCircle, 
  ArrowUpCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

export const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
      setLoading(false);
    }, (error) => {
      console.error("Transactions fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center text-[#C9A96E]">
            <History size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Transaction History</h1>
            <p className="text-gray-400">View and track all your account activities.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C9A96E] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search TXID..."
              className="bg-[#121212] border border-[#C9A96E]/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-[#C9A96E]/40 transition-all w-64"
            />
          </div>
          <button className="p-2.5 bg-[#121212] border border-[#C9A96E]/10 rounded-xl text-gray-400 hover:text-[#C9A96E] transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0B0B]/50 border-b border-[#C9A96E]/10">
                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">TXID</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A96E]/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">No transactions found.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#C9A96E]/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          tx.type === 'deposit' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                          {tx.type === 'deposit' ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                        </div>
                        <span className="text-sm font-semibold text-white capitalize">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className={cn("text-sm font-bold", tx.type === 'deposit' ? "text-green-500" : "text-red-500")}>
                          {tx.type === 'deposit' ? '+' : '-'}{(tx.amountBtc || tx.amount).toFixed(4)} BTC
                        </span>
                        {tx.amountUsd && (
                          <span className="text-[10px] text-gray-500">
                            ≈ ${tx.amountUsd.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                          tx.status === 'confirmed' ? "bg-green-500/10 text-green-500 border border-green-500/20" : 
                          tx.status === 'pending' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : 
                          "bg-red-500/10 text-red-500 border border-red-500/20"
                        )}>
                          {tx.status}
                        </span>
                        {tx.status === 'failed' && tx.rejectionReason && (
                          <span className="text-[10px] text-red-400 mt-1 italic">Reason: {tx.rejectionReason}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-gray-400">{format(new Date(tx.timestamp), "MMM dd, yyyy HH:mm")}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-mono text-gray-500 group-hover:text-gray-300 transition-colors">
                        {tx.txHash ? `${tx.txHash.substring(0, 8)}...${tx.txHash.substring(tx.txHash.length - 8)}` : "---"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setSelectedTx(tx)}
                        className="p-2 text-gray-500 hover:text-[#C9A96E] transition-colors"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-[#0B0B0B]/30 border-t border-[#C9A96E]/10 flex items-center justify-between">
          <p className="text-xs text-gray-500">Showing {transactions.length} transactions</p>
          <div className="flex gap-2">
            <button className="p-2 bg-[#121212] border border-[#C9A96E]/10 rounded-lg text-gray-500 hover:text-[#C9A96E] disabled:opacity-30" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="p-2 bg-[#121212] border border-[#C9A96E]/10 rounded-lg text-gray-500 hover:text-[#C9A96E] disabled:opacity-30" disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedTx(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#121212] border border-[#C9A96E]/20 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#C9A96E]/10 flex items-center justify-between bg-[#0B0B0B]/50">
                <h3 className="text-xl font-bold text-white">Transaction Receipt</h3>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Icon & Amount */}
              <div className="p-8 text-center border-b border-[#C9A96E]/10">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                  selectedTx.status === 'confirmed' ? "bg-green-500/10 text-green-500" : 
                  selectedTx.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" : 
                  "bg-red-500/10 text-red-500"
                )}>
                  {selectedTx.status === 'confirmed' ? <CheckCircle size={32} /> : 
                   selectedTx.status === 'pending' ? <Clock size={32} /> : 
                   <AlertCircle size={32} />}
                </div>
                <h4 className="text-3xl font-bold text-white mb-1">
                  {selectedTx.type === 'deposit' ? '+' : '-'}{(selectedTx.amountBtc || selectedTx.amount).toFixed(4)} BTC
                </h4>
                {selectedTx.amountUsd && (
                  <p className="text-gray-500">≈ ${selectedTx.amountUsd.toLocaleString()}</p>
                )}
                
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-4",
                  selectedTx.status === 'confirmed' ? "bg-green-500/10 text-green-500 border border-green-500/20" : 
                  selectedTx.status === 'pending' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : 
                  "bg-red-500/10 text-red-500 border border-red-500/20"
                )}>
                  {selectedTx.status}
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4 bg-[#0B0B0B]/20">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-gray-500">Type</span>
                  <span className="text-sm font-semibold text-white capitalize">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-gray-500">Date</span>
                  <span className="text-sm font-semibold text-white">{format(new Date(selectedTx.timestamp), "MMM dd, yyyy HH:mm")}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-gray-500">Transaction ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-300">
                      {selectedTx.txHash ? `${selectedTx.txHash.substring(0, 12)}...` : "N/A"}
                    </span>
                    {selectedTx.txHash && (
                      <button 
                        onClick={() => navigator.clipboard.writeText(selectedTx.txHash)}
                        className="text-gray-500 hover:text-[#C9A96E] transition-colors"
                        title="Copy TXID"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {selectedTx.status === 'failed' && selectedTx.rejectionReason && (
                  <div className="flex justify-between items-start py-2 border-b border-white/5">
                    <span className="text-sm text-gray-500">Reason</span>
                    <span className="text-sm font-semibold text-red-400 text-right max-w-[200px]">{selectedTx.rejectionReason}</span>
                  </div>
                )}
                {selectedTx.walletAddress && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-gray-500">Wallet Address</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-300">
                        {`${selectedTx.walletAddress.substring(0, 8)}...${selectedTx.walletAddress.substring(selectedTx.walletAddress.length - 8)}`}
                      </span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(selectedTx.walletAddress)}
                        className="text-gray-500 hover:text-[#C9A96E] transition-colors"
                        title="Copy Address"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-6 bg-[#0B0B0B]/50">
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="w-full py-3 bg-[#121212] border border-[#C9A96E]/20 text-white font-bold rounded-xl hover:bg-[#C9A96E]/10 transition-all"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
