import React from "react";
import { Shield } from "lucide-react";
import { LegalLayout } from "./Legal";

import { motion } from "motion/react";

export const Security = () => (
  <LegalLayout title="Security at Goldencoin" icon={Shield}>
    <div className="space-y-12">
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
  </LegalLayout>
);
