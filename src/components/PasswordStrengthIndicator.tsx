import React from 'react';
import { cn } from '../lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const evaluateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const score = evaluateStrength(password);
  
  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  };

  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ];

  if (password.length === 0) return null;

  return (
    <div className="mt-2 text-xs">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 w-1/4 rounded-full transition-all duration-300",
              index <= score ? strengthColors[score - 1] : "bg-gray-700"
            )}
          />
        ))}
      </div>
      <p className={cn("font-medium", `text-${strengthColors[score - 1]?.split('-')[1] || 'gray'}-400`)}>
        {getStrengthLabel(score)}
      </p>
    </div>
  );
};
