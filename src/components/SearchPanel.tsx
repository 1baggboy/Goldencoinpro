import React, { useState, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export interface SearchItem {
  name: string;
  path: string;
}

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: SearchItem[];
  title: string;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  isOpen,
  onClose,
  items,
  title
}) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
        setQuery('');
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }
  }, [isOpen]);

  const addToRecent = (item: SearchItem) => {
    const updated = [item, ...recentSearches.filter(r => r.path !== item.path)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-slate-950/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-[#C9A96E]/20 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center p-4 border-b border-[#C9A96E]/10">
              <Search className="text-[#C9A96E] mr-3" size={20} />
              <input
                type="text"
                autoFocus
                placeholder={`Search ${title}...`}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredItems.length === 0 && !query && recentSearches.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No results found.</div>
              ) : (
                <>
                    {filteredItems.map((item, index) => (
                      <button
                        key={`item-${index}`}
                        onClick={() => {
                            addToRecent(item);
                            navigate(item.path);
                            onClose();
                        }}
                        className="w-full text-left p-4 hover:bg-[#C9A96E]/10 transition-colors border-b border-[#C9A96E]/5 last:border-b-0 text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        {item.name}
                      </button>
                    ))}
                    
                    {query === '' && recentSearches.length > 0 && (
                        <div className="mt-4">
                            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Searches</div>
                            {recentSearches.map((item, index) => (
                                <button
                                    key={`recent-${index}`}
                                    onClick={() => {
                                        addToRecent(item);
                                        navigate(item.path);
                                        onClose();
                                    }}
                                    className="w-full text-left p-4 hover:bg-[#C9A96E]/10 transition-colors border-b border-[#C9A96E]/5 last:border-b-0 text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-3"
                                >
                                    <Clock size={16} />
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
