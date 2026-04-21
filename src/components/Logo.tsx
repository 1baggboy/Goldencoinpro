import React from "react";
import { LOGO_BASE64 } from "../LogoAsset";
import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "custom";
}

export const Logo: React.FC<LogoProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-12 w-auto",
    xl: "h-16 w-auto",
    custom: "",
  };

  return (
    <img 
      src={LOGO_BASE64} 
      alt="GOLDENCOIN" 
      className={cn(sizeClasses[size], className)} 
      referrerPolicy="no-referrer"
    />
  );
};
