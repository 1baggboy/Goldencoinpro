import React, { useState } from 'react';
import { usePrices } from '../../PriceContext';
import { Bell, BellOff, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const PriceAlertsCard = () => {
    const { alerts, addAlert, removeAlert, toggleAlert, prices, pulsingAlertIds } = usePrices();
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState<'alerts' | 'history'>('alerts');
    const [asset, setAsset] = useState('BTC');
    const [condition, setCondition] = useState<'above' | 'below'>('above');
    const [price, setPrice] = useState('');
    const [soundProfile, setSoundProfile] = useState<'default' | 'chime' | 'bell' | 'synthetic'>('default');
    const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

    const isPulsing = pulsingAlertIds.length > 0;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!price || isNaN(Number(price))) return;
        addAlert({
            asset,
            condition,
            targetPrice: Number(price),
            soundProfile: soundProfile
        });
        setIsAdding(false);
        setPrice('');
        setSoundProfile('default');
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedAlerts);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedAlerts(newSelected);
    };

    const handleBulkDelete = () => {
        selectedAlerts.forEach(id => removeAlert(id));
        setSelectedAlerts(new Set());
    };

    const handleBulkPause = () => {
        selectedAlerts.forEach(id => {
            const alert = alerts.find(a => a.id === id);
            if (alert && alert.isActive) toggleAlert(id);
        });
        setSelectedAlerts(new Set());
    };

    return (
        <motion.div 
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-[#C9A96E]/20 rounded-2xl p-4 sm:p-6 shadow-sm"
            animate={{ scale: isPulsing ? [1, 1.01, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isPulsing ? Infinity : 0 }}
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Price Alerts</h3>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => setActiveTab('alerts')} className={cn("text-xs transition-colors", activeTab === 'alerts' ? "text-indigo-500 font-bold" : "text-gray-500")}>Active Alerts</button>
                            <button onClick={() => setActiveTab('history')} className={cn("text-xs transition-colors", activeTab === 'history' ? "text-indigo-500 font-bold" : "text-gray-500")}>History</button>
                        </div>
                    </div>
                </div>
                {!isAdding && activeTab === 'alerts' && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="p-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>

            {activeTab === 'alerts' ? (
                <>
                    {selectedAlerts.size > 0 && (
                        <div className="flex items-center justify-between bg-indigo-500/10 rounded-xl p-3 mb-4 border border-indigo-500/20">
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{selectedAlerts.size} selected</span>
                            <div className="flex gap-2">
                                <button onClick={handleBulkPause} className="text-xs font-bold px-3 py-1.5 bg-yellow-500/20 text-yellow-600 rounded-lg hover:bg-yellow-500/30 transition-colors">Pause</button>
                                <button onClick={handleBulkDelete} className="text-xs font-bold px-3 py-1.5 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors">Delete</button>
                            </div>
                        </div>
                    )}

            <AnimatePresence>
                {isAdding && (
                    <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAdd} 
                        className="mb-4 overflow-hidden"
                    >
                        <div className="flex gap-2 mb-3">
                            <select 
                                value={asset} 
                                onChange={e => setAsset(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-[#C9A96E]/20 rounded-lg px-3 py-2 text-sm outline-none flex-1 text-slate-900 dark:text-white"
                            >
                                <option value="BTC">BTC</option>
                                <option value="ETH">ETH</option>
                                <option value="SOL">SOL</option>
                            </select>
                            <select 
                                value={condition} 
                                onChange={e => setCondition(e.target.value as any)}
                                className="bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-[#C9A96E]/20 rounded-lg px-3 py-2 text-sm outline-none flex-1 text-slate-900 dark:text-white"
                            >
                                <option value="above">Goes Above</option>
                                <option value="below">Goes Below</option>
                            </select>
                        </div>
                        <div className="flex gap-2 mb-3">
                            <select 
                                value={soundProfile} 
                                onChange={e => setSoundProfile(e.target.value as any)}
                                className="bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-[#C9A96E]/20 rounded-lg px-3 py-2 text-sm outline-none w-full text-slate-900 dark:text-white"
                            >
                                <option value="default">Default Sound</option>
                                <option value="chime">Chime</option>
                                <option value="bell">Digital Bell</option>
                                <option value="synthetic">Synthetic</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                placeholder="Target Price ($)"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-[#C9A96E]/20 rounded-lg px-3 py-2 text-sm outline-none flex-[2] text-slate-900 dark:text-white"
                                required
                            />
                            <div className="flex flex-1 gap-1">
                                <button type="submit" className="flex-1 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600">
                                    Set
                                </button>
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-slate-700">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {alerts.length === 0 && !isAdding ? (
                    <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                        No alerts set.
                    </div>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.id} className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer",
                            selectedAlerts.has(alert.id) ? "border-indigo-500 bg-indigo-500/5" : "",
                            alert.isActive 
                                ? "bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5" 
                                : "bg-gray-50 dark:bg-slate-900/50 opacity-60"
                        )} onClick={() => toggleSelection(alert.id)}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-4 h-4 rounded flex items-center justify-center border",
                                    selectedAlerts.has(alert.id) ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-300 dark:border-gray-600"
                                )}>
                                    {selectedAlerts.has(alert.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">{alert.asset}</span>
                                        <span className="text-xs text-gray-500">
                                            {alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                        Current: ${prices?.[alert.asset.toLowerCase()]?.usd?.toLocaleString() || '---'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleAlert(alert.id); }}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        alert.isActive 
                                            ? "text-indigo-500 bg-indigo-500/10" 
                                            : "text-gray-400 bg-gray-200 dark:bg-slate-800"
                                    )}
                                >
                                    {alert.isActive ? <Bell size={14} /> : <BellOff size={14} />}
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeAlert(alert.id); }}
                                    className="p-1.5 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    ) : (
        <div className="space-y-3">
            {[...alerts].flatMap(alert => alert.history.map(h => ({ ...h, asset: alert.asset }))).length === 0 ? (
                 <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                    No history yet.
                </div>
            ) : (
                [...alerts].flatMap(alert => alert.history.map(h => ({ ...h, asset: alert.asset }))).sort((a,b) => b.timestamp - a.timestamp).map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 text-sm">
                        <span className="font-bold text-slate-900 dark:text-white">{h.asset}</span>
                        <span className="text-gray-500 text-xs">{new Date(h.timestamp).toLocaleString()}</span>
                        <span className="font-mono text-slate-900 dark:text-white">${h.price.toLocaleString()}</span>
                    </div>
                ))
            )}
        </div>
    )}
        </motion.div>
    );
};
