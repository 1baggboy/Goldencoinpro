import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  MessageSquare, 
  Search, 
  Send, 
  User, 
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, where, doc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { cn } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";

export const AdminSupport = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get("user");
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialUserId);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch all unique chat users
  useEffect(() => {
    const q = query(collection(db, "support_chats"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const allMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Group by userId to get unique chats
      const uniqueChats: any = {};
      allMsgs.forEach((msg: any) => {
        if (!uniqueChats[msg.userId]) {
          uniqueChats[msg.userId] = {
            userId: msg.userId,
            userName: msg.userName,
            lastMessage: msg.text,
            lastTimestamp: msg.createdAt,
            unread: msg.sender === 'user' // Simple logic for now
          };
        }
      });
      
      const chatList = Object.values(uniqueChats);
      setChats(chatList);

      // If we have an initialUserId but it's not in the chat list yet (new chat), 
      // we might need to fetch the user name or just wait for them to send a message.
      // For now, if it's selected, it will show the ID.
    });

    return () => unsub();
  }, []);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChatId) return;

    const q = query(
      collection(db, "support_chats"),
      where("userId", "==", selectedChatId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [selectedChatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedChatId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "support_chats"), {
        userId: selectedChatId,
        userName: "Support Agent",
        text: reply,
        sender: "admin",
        createdAt: serverTimestamp(),
      });
      setReply("");
    } catch (error) {
      console.error("Reply error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(c => 
    c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChat = chats.find(c => c.userId === selectedChatId);

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6">
      {/* Chat List */}
      <div className="w-80 bg-slate-900 border border-[#C9A96E]/10 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#C9A96E]/10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-[#C9A96E]" />
            Support Chats
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-[#C9A96E]/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-[#C9A96E]/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs">
              No active chats found.
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.userId}
                onClick={() => setSelectedChatId(chat.userId)}
                className={cn(
                  "w-full p-4 flex items-start gap-3 border-b border-[#C9A96E]/5 transition-colors text-left",
                  selectedChatId === chat.userId ? "bg-[#C9A96E]/10" : "hover:bg-[#C9A96E]/5"
                )}
              >
                <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-full flex items-center justify-center text-[#C9A96E] shrink-0">
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-white truncate">{chat.userName || "Guest"}</p>
                    {chat.lastTimestamp && (
                      <span className="text-[10px] text-gray-500">
                        {formatDistanceToNow(chat.lastTimestamp.toDate ? chat.lastTimestamp.toDate() : new Date())}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread && (
                  <div className="w-2 h-2 bg-[#C9A96E] rounded-full mt-2"></div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-slate-900 border border-[#C9A96E]/10 rounded-2xl flex flex-col overflow-hidden">
        {selectedChatId ? (
          <>
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-[#C9A96E]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-full flex items-center justify-center text-[#C9A96E]">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{selectedChat?.userName || "Guest User"}</h3>
                  <p className="text-[10px] text-gray-500 font-mono">{selectedChatId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20">
                  ACTIVE SESSION
                </span>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-slate-950/30"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    msg.sender === 'admin' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.sender === 'admin' 
                      ? "bg-[#C9A96E] text-[#0B0B0B] rounded-tr-none" 
                      : "bg-slate-800 text-white border border-[#C9A96E]/10 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 px-1">
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : 'Sending...'}
                  </span>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendReply} className="p-4 bg-slate-950 border-t border-[#C9A96E]/10">
              <div className="relative flex gap-3">
                <input 
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 bg-slate-900 border border-[#C9A96E]/10 rounded-xl py-4 px-6 text-sm text-white outline-none focus:border-[#C9A96E]/40 transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={loading || !reply.trim()}
                  className="px-8 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={18} />
                  Reply
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-[#C9A96E]/5 rounded-full flex items-center justify-center text-[#C9A96E] mb-6">
              <MessageSquare size={48} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Chat Selected</h3>
            <p className="text-gray-500 max-w-xs">
              Select a conversation from the sidebar to start communicating with members.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
