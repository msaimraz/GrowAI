import React from 'react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';

interface LogoProps {
  href?: string;
  className?: string;
  variant?: 'light' | 'dark' | 'brand';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({
  href = '/',
  className = '',
  variant = 'brand',
  size = 'md',
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg gap-1.5',
    md: 'text-xl gap-2',
    lg: 'text-2xl gap-2.5',
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 28,
  };

  const colorClasses = {
    brand: 'text-[#123C2A]',
    dark: 'text-white',
    light: 'text-[#174C35]',
  };

  const content = (
    <div className={`inline-flex items-center font-bold tracking-tight ${sizeClasses[size]} ${colorClasses[variant]} ${className}`}>
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#174C35] text-[#EAF1E4] shadow-sm">
        <Sprout size={iconSizes[size]} className="stroke-[2.2]" />
      </span>
      <span className={`font-serif font-bold tracking-tight ${variant === 'dark' ? 'text-white' : 'text-[#123C2A]'}`}>
        Grow<span className={`${variant === 'dark' ? 'text-[#78A95A]' : 'text-[#174C35]'} font-sans font-semibold`}>AI</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus-visible:ring-2 focus-visible:ring-[#174C35] rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
