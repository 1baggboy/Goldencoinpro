import React from "react";
import { Shield, Lock, Smartphone, ExternalLink } from "lucide-react";
import { LegalLayout } from "./Legal";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export const Security = () => (
  <LegalLayout title="Security at Goldencoin" icon={Shield}>
    <div className="space-y-12">
      {/* Real-time Security CTA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#C9A96E]/5 border border-[#C9A96E]/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#C9A96E] text-[#0B0B0B] rounded-xl flex items-center justify-center shadow-lg shadow-[#C9A96E]/20">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Manage Your Account Security</h3>
            <p className="text-sm text-gray-400">View active logins and enable Two-Factor Authentication.</p>
          </div>
        </div>
        <Link 
          to="/profile" 
          className="px-6 py-3 bg-[#C9A96E] text-[#0B0B0B] font-bold rounded-xl hover:bg-[#D4B985] transition-all flex items-center gap-2 whitespace-nowrap"
        >
          Security Settings <ExternalLink size={16} />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        {
          title: "Institutional-Grade Asset Protection",
          content: "Your digital assets are secured using enterprise-grade encryption and multi-signature (Multi-Sig) logic. 100% of client treasury funds are stored in air-gapped cold storage facilities, ensuring they are disconnected from the network and protected from unauthorized access."
        },
        {
          title: "Security Audits & Compliance",
          content: "Goldencoin Limited adheres to ISO 27001 compliant security management procedures. We conduct regular external security audits and stress tests on our infrastructure to maintain the highest levels of platform integrity and resilience against emerging cyber threats."
        },
        {
          title: "Two-Factor Authentication (2FA)",
          content: "We strongly encourage all users to enable Two-Factor Authentication. This adds an extra layer of security to your account, requiring a time-sensitive code from your mobile device in addition to your password."
        },
        {
          title: "Continuous Monitoring",
          content: "Our security team monitors the platform 24/7 for suspicious activity. We utilize advanced threat detection systems to proactively identify and mitigate potential risks before they impact our users."
        }
      ].map((item, i) => (
        <motion.section 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
    </div>
  </LegalLayout>
);
