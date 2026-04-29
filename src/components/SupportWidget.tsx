import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User, Headset } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../AuthContext";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, updateDoc, doc, getDocs } from "firebase/firestore";
import { cn } from "../lib/utils";

import { handleFirestoreError, OperationType } from "../lib/firestoreErrorHandler";

export const SupportWidget = () => {
  const { user: authUser, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnonDisabled, setIsAnonDisabled] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle Anonymous Auth for guests
  useEffect(() => {
    if (authUser) {
      setChatUserId(authUser.uid);
    } else {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setChatUserId(user.uid);
        } else {
          const attemptSignIn = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
              try {
                const cred = await signInAnonymously(auth);
                setChatUserId(cred.user.uid);
                setIsAnonDisabled(false);
                return;
              } catch (error: any) {
                if (error.code === 'auth/admin-restricted-operation') {
                  setIsAnonDisabled(true);
                  console.warn("Anonymous authentication is disabled in Firebase Console. Please enable it to allow guest support chat.");
                  return;
                }
                if (i < retries - 1) {
                  await new Promise(r => setTimeout(r, 2000));
                  continue;
                }
                setIsAnonDisabled(true);
                console.warn("Guest chat currently unavailable:", error.message);
              }
            }
          };
          attemptSignIn();
        }
      });
      return () => unsub();
    }
  }, [authUser]);

  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;

    const q = query(
      collection(db, "support_chats"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "support_chats");
    });

    return () => unsub();
  }, [auth.currentUser, isOpen, chatUserId]);

  // Listen for unread messages from admin
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "support_chats"),
      where("userId", "==", auth.currentUser.uid),
      where("sender", "==", "admin"),
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.docs.length);
    }, (error) => {
      // Silent fail for unread count if permissions are tricky
    });

    return () => unsub();
  }, [auth.currentUser, chatUserId]);

  // Mark as read when opened
  useEffect(() => {
    if (isOpen && unreadCount > 0 && auth.currentUser) {
      const q = query(
        collection(db, "support_chats"),
        where("userId", "==", auth.currentUser.uid),
        where("sender", "==", "admin"),
        where("read", "==", false)
      );
      
      getDocs(q).then(snap => {
        snap.docs.forEach(d => {
          updateDoc(doc(db, "support_chats", d.id), { read: true });
        });
      }).catch(err => console.error("Error marking as read:", err));
    }
  }, [isOpen, unreadCount, auth.currentUser, chatUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !auth.currentUser) return;
    if (!authUser && (!guestName.trim() || !guestEmail.trim())) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "support_chats"), {
        userId: auth.currentUser.uid,
        userName: authUser ? profile?.displayName : guestName,
        userEmail: authUser ? authUser.email : guestEmail,
        text: message,
        sender: "user",
        read: false,
        createdAt: serverTimestamp(),
      });

      // Add notification for admin
      await addDoc(collection(db, "notifications"), {
        userId: "admin",
        title: "New Support Message",
        message: `Support message from ${authUser ? profile?.displayName : guestName || 'Guest'}`,
        type: "info",
        read: false,
        timestamp: new Date().toISOString(),
      });

      setMessage("");
    } catch (error) {
      console.error("Support message error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-32px)] md:w-[400px] h-[calc(100vh-120px)] md:h-[500px] max-h-[600px] bg-slate-900 border border-[#C9A96E]/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#C9A96E] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-950/10 rounded-full flex items-center justify-center text-[#0B0B0B]">
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
              {isAnonDisabled && !authUser && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-red-400 font-medium">Guest chat is currently unavailable.</p>
                  <p className="text-[10px] text-gray-500">Please sign in to your account to contact support, or wait for the administrator to enable guest access.</p>
                </div>
              )}
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
                        : msg.sender === 'system'
                          ? "bg-slate-800/50 text-gray-400 italic text-center w-full rounded-none border-none"
                          : "bg-slate-800 text-white border border-[#C9A96E]/10 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                    {msg.sender !== 'system' && (
                      <span className="text-[10px] text-gray-500 mt-1">
                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-[#C9A96E]/10 space-y-2">
              {!authUser && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your Name"
                    className="bg-slate-900 border border-[#C9A96E]/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-[#C9A96E]/40"
                    required
                  />
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Your Email"
                    className="bg-slate-900 border border-[#C9A96E]/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-[#C9A96E]/40"
                    required
                  />
                </div>
              )}
              <div className="relative">
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-slate-900 border border-[#C9A96E]/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                />
                <button 
                  type="submit"
                  disabled={loading || !message.trim() || (!authUser && (!guestName.trim() || !guestEmail.trim()))}
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
        className={cn(
          "bg-[#C9A96E] text-[#0B0B0B] shadow-2xl flex items-center justify-center hover:bg-[#D4B985] transition-all relative",
          isOpen ? "w-14 h-14 rounded-full" : "h-14 md:w-14 px-5 md:px-0 rounded-full md:rounded-full gap-2"
        )}
      >
        {isOpen ? <X size={24} /> : (
          <>
            <MessageSquare size={24} />
            <span className="md:hidden font-bold text-sm">Chat with us</span>
          </>
        )}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
            {unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
};
