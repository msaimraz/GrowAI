import React from 'react';
import { Sun, Droplets, Sprout, Thermometer, Box } from 'lucide-react';

interface CareBadgeProps {
  type: 'sun' | 'water' | 'difficulty' | 'temp' | 'container' | 'custom';
  label: string;
  icon?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CareBadge({
  type,
  label,
  icon,
  sublabel,
  size = 'md',
  className = '',
}: CareBadgeProps) {
  const getBadgeStyle = () => {
    switch (type) {
      case 'sun':
        return {
          bg: 'bg-[#FFF0D8]',
          text: 'text-[#9A5B00]',
          border: 'border-[#FDE3B8]',
          defaultIcon: '☀️',
        };
      case 'water':
        return {
          bg: 'bg-[#E3EFFB]',
          text: 'text-[#1D63A8]',
          border: 'border-[#C8E1F8]',
          defaultIcon: '💧',
        };
      case 'difficulty':
        return {
          bg: 'bg-[#E6F0E3]',
          text: 'text-[#1E6B3E]',
          border: 'border-[#CEE4C9]',
          defaultIcon: '🌱',
        };
      case 'temp':
        return {
          bg: 'bg-[#FBE4DC]',
          text: 'text-[#A84A2A]',
          border: 'border-[#F8CEC1]',
          defaultIcon: '🌡️',
        };
      case 'container':
        return {
          bg: 'bg-[#EEE8F6]',
          text: 'text-[#5C3FA3]',
          border: 'border-[#DDD2EE]',
          defaultIcon: '🪴',
        };
      default:
        return {
          bg: 'bg-[#F3F6EC]',
          text: 'text-[#263E2E]',
          border: 'border-[#DFE7D4]',
          defaultIcon: '✨',
        };
    }
  };

  const style = getBadgeStyle();
  const displayIcon = icon || style.defaultIcon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]} ${className} transition-all`}
    >
      <span className="shrink-0 select-none text-[1.1em]">{displayIcon}</span>
      <span className="truncate">{label}</span>
      {sublabel && (
        <span className="opacity-70 text-[0.85em] font-normal truncate">
          · {sublabel}
        </span>
      )}
    </span>
  );
}

