import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'sage'
    | 'forest'
    | 'leaf'
    | 'sunshine'
    | 'water'
    | 'coral'
    | 'lavender'
    | 'amber'
    | 'terracotta'
    | 'neutral'
    | 'outline';
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
    forest: 'bg-[#174C35] text-white border border-[#174C35]',
    sage: 'bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/35 font-medium',
    leaf: 'bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/40 font-semibold',
    sunshine: 'bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D]/35',
    amber: 'bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D]/35',
    water: 'bg-[#E7F2F9] text-[#1B5D88] border border-[#65A8D0]/35',
    coral: 'bg-[#FBE9E2] text-[#963A23] border border-[#E4775D]/35',
    terracotta: 'bg-[#FBE9E2] text-[#963A23] border border-[#E4775D]/35',
    lavender: 'bg-[#F0ECF7] text-[#594186] border border-[#9A83C5]/35',
    neutral: 'bg-white text-[#203027] border border-[#E3DFD2]',
    outline: 'bg-transparent text-[#174C35] border border-[#78A95A]/40',
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
