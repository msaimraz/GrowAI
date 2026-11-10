import React from 'react';

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
          bg: 'bg-[#FFF3D7]',
          text: 'text-[#8A6400]',
          border: 'border-[#F0C04D]/35',
          defaultIcon: '☀️',
        };
      case 'water':
        return {
          bg: 'bg-[#E7F2F9]',
          text: 'text-[#1B5D88]',
          border: 'border-[#65A8D0]/35',
          defaultIcon: '💧',
        };
      case 'difficulty':
        return {
          bg: 'bg-[#EAF1E4]',
          text: 'text-[#174C35]',
          border: 'border-[#78A95A]/35',
          defaultIcon: '🌱',
        };
      case 'temp':
        return {
          bg: 'bg-[#FBE9E2]',
          text: 'text-[#963A23]',
          border: 'border-[#E4775D]/35',
          defaultIcon: '🌡️',
        };
      case 'container':
        return {
          bg: 'bg-[#F0ECF7]',
          text: 'text-[#594186]',
          border: 'border-[#9A83C5]/35',
          defaultIcon: '🪴',
        };
      default:
        return {
          bg: 'bg-[#EAF1E4]',
          text: 'text-[#203027]',
          border: 'border-[#E3DFD2]',
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
