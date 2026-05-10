import React from "react";
import { Zap } from "lucide-react";
import { LegalLayout } from "./Legal";

import { motion } from "motion/react";

export const Features = () => (
  <LegalLayout title="Platform Features" icon={Zap}>
    <div className="space-y-12">
      {[
        {
          title: "Streamlined Asset Settlement",
          content: "Experience efficient transaction handling. Our systemized monitoring ensures your BTC deposits are recognized after industry-standard network confirmations, with withdrawal requests processed through secondary security reviews."
        },
        {
          title: "Advanced Analytics",
          content: "Track your portfolio performance with real-time charts, detailed transaction history, and comprehensive reporting tools designed to give you deep insights into your investments."
        },
        {
          title: "Referral Program",
          content: "Invite your friends and family to join Goldencoin. When they sign up and make their first deposit, you'll receive a cash bonus credited directly to your account."
        }
      ].map((item, i) => (
        <motion.section 
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
            {item.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {item.content}
          </p>
        </motion.section>
      ))}
    </div>
  </LegalLayout>
);
