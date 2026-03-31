import React from "react";
import { useNotifications, Notification } from "../NotificationContext";
import { motion, AnimatePresence } from "motion/react";
import { Check, Info, AlertTriangle, XCircle, Clock, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../lib/utils";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <Check className="text-green-500" size={16} />;
      case "warning": return <AlertTriangle className="text-yellow-500" size={16} />;
      case "error": return <XCircle className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 md:w-96 bg-slate-900 border border-[#C9A96E]/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-[#C9A96E]/10 flex items-center justify-between bg-slate-950/50">
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-[#C9A96E] hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
                    <Clock size={24} />
                  </div>
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[#C9A96E]/5">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={cn(
                        "p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3",
                        !n.read && "bg-[#C9A96E]/5"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        n.type === 'success' ? "bg-green-500/10" : 
                        n.type === 'warning' ? "bg-yellow-500/10" : 
                        n.type === 'error' ? "bg-red-500/10" : "bg-blue-500/10"
                      )}>
                        {getIcon(n.type)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-white truncate">{n.title}</p>
                          <span className="text-[10px] text-gray-500 shrink-0">
                            {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#C9A96E]/10 bg-[#0B0B0B]/50 text-center">
              <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors">
                View all activity
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
