import React, { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

export const NewsletterSubscription = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (resp.ok) {
        toast.success("Subscribed to newsletter!");
        setEmail("");
      } else {
        const errorData = await resp.json().catch(() => ({}));
        console.error("Subscription failed:", errorData);
        toast.error(`Failed to subscribe: ${errorData.error || 'Unknown error'}`);
      }
    } catch (e) {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center my-12 px-6">
      <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-[#C9A96E]/20 w-full max-w-lg text-center shadow-xl">
        <h4 className="font-bold mb-4 text-[#C9A96E] uppercase tracking-widest text-sm">Join Our Newsletter</h4>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-xs italic">Stay updated with the latest trends & insights.</p>
        <form onSubmit={handleSubscribe} className="flex gap-2">
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-slate-100 dark:bg-slate-900 border border-[#C9A96E]/20 rounded-lg px-4 py-3 w-full text-sm outline-none focus:border-[#C9A96E]" 
          />
          <button 
            disabled={loading}
            className="bg-[#C9A96E] text-black px-6 py-3 rounded-lg text-sm font-black disabled:opacity-50 hover:bg-[#D4B985] transition-all"
          >
            {loading ? "..." : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};
