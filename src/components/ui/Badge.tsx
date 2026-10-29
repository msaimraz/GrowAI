import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sage' | 'forest' | 'amber' | 'terracotta' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'sage',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    sage: 'bg-[#e7efe7] text-[#1b5837] border border-[#cfdfcf]',
    forest: 'bg-[#144229] text-[#f4f8f4] border border-[#0f2e1d]',
    amber: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
    terracotta: 'bg-[#fbeee9] text-[#9a3412] border border-[#f8d7cb]',
    neutral: 'bg-[#f2eee3] text-[#44403c] border border-[#e2dcce]',
    outline: 'bg-transparent text-[#2a472b] border border-[#afc9af]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 font-medium rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
