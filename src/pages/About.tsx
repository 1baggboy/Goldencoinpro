import React from "react";
import { Info } from "lucide-react";
import { LegalLayout } from "./Legal";

export const About = () => (
  <LegalLayout title="About Goldencoin" icon={Info}>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Our Mission
      </h2>
      <p>
        Goldencoin Limited is a leading digital asset management platform providing secure and transparent Bitcoin solutions. We believe in empowering individuals to take control of their financial future through innovative cryptocurrency tools.
      </p>
    </section>
    
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#C9A96E] rounded-full"></div>
        Who We Are
      </h2>
      <p>
        Founded by a team of blockchain enthusiasts and financial experts, Goldencoin bridges the gap between traditional finance and the decentralized world. Our platform is designed for both beginners and experienced traders, offering a seamless experience for managing digital assets.
      </p>
    </section>
  </LegalLayout>
);
