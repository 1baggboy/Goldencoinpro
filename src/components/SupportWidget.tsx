import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User, Headset } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../AuthContext";
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { cn } from "../lib/utils";

export const SupportWidget = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      let id = localStorage.getItem("support_guest_id");
      if (!id) {
        id = "guest_" + Math.random().toString(36).substring(7);
        localStorage.setItem("support_guest_id", id);
      }
      setGuestId(id);
    }
  }, [user]);

  useEffect(() => {
    const chatUserId = user?.uid || guestId;
    if (!chatUserId || !isOpen) return;

    const q = query(
      collection(db, "support_chats"),
      where("userId", "==", chatUserId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const chatUserId = user?.uid || guestId;
    if (!message.trim() || !chatUserId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "support_chats"), {
        userId: chatUserId,
        userName: profile?.displayName || "Guest User",
        text: message,
        sender: "user",
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } catch (error) {
      console.error("Support message error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-[#121212] border border-[#C9A96E]/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#C9A96E] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0B0B0B]/10 rounded-full flex items-center justify-center text-[#0B0B0B]">
                  <Headset size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0B0B0B]">Customer Support</h3>
                  <p className="text-[10px] text-[#0B0B0B]/70 font-bold uppercase tracking-widest">Online 24/7</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[#0B0B0B]/10 rounded-full text-[#0B0B0B] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            >
              {messages.length === 0 ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto text-[#C9A96E]">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-sm text-gray-400 px-8">
                    Hello! How can we help you today? Send us a message and a representative will be with you shortly.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-2xl text-sm",
                      msg.sender === 'user' 
                        ? "bg-[#C9A96E] text-[#0B0B0B] rounded-tr-none" 
                        : "bg-[#1A1A1A] text-white border border-[#C9A96E]/10 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#0B0B0B] border-t border-[#C9A96E]/10">
              <div className="relative">
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-[#121212] border border-[#C9A96E]/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                />
                <button 
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#C9A96E] text-[#0B0B0B] rounded-lg hover:bg-[#D4B985] transition-all disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#C9A96E] text-[#0B0B0B] rounded-full shadow-2xl flex items-center justify-center hover:bg-[#D4B985] transition-all"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};
