'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sprout,
  ShieldAlert,
  Loader2,
  ArrowRight,
} from 'lucide-react';

/* ==========================================================================
   1. SECTION HEADER
   ========================================================================== */
interface SectionHeaderProps {
  category?: string;
  title: string;
  description?: string;
  badge?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function SectionHeader({
  category,
  title,
  description,
  badge,
  actionHref,
  actionLabel,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#E3DFD2]">
      <div className="space-y-1">
        {category && (
          <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#174C35] block">
            {category}
          </span>
        )}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#203027] tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] shrink-0">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm sm:text-base text-[#203027] leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#174C35] hover:underline shrink-0 min-h-[44px]"
        >
          <span>{actionLabel}</span>
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

/* ==========================================================================
   2. INFORMATION CARD
   ========================================================================== */
interface InformationCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function InformationCard({
  children,
  className = '',
  hoverEffect = true,
}: InformationCardProps) {
  return (
    <div
      className={`bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-7 shadow-xs ${
        hoverEffect ? 'hover:border-[#174C35]/40 hover:shadow-sm transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ==========================================================================
   3. BUTTONS
   ========================================================================== */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function PrimaryButton({
  children,
  icon,
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const sizeClasses =
    size === 'sm'
      ? 'min-h-[38px] px-3.5 py-1.5 text-xs'
      : size === 'lg'
      ? 'min-h-[50px] px-6 py-3 text-base'
      : 'min-h-[44px] px-5 py-2.5 text-sm';

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold bg-[#174C35] text-white hover:bg-[#203027] shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function SecondaryButton({
  children,
  icon,
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const sizeClasses =
    size === 'sm'
      ? 'min-h-[38px] px-3.5 py-1.5 text-xs'
      : size === 'lg'
      ? 'min-h-[50px] px-6 py-3 text-base'
      : 'min-h-[44px] px-5 py-2.5 text-sm';

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold bg-white text-[#174C35] border border-[#E3DFD2] hover:bg-[#F8F6EE] hover:border-[#174C35]/40 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

/* ==========================================================================
   4. EMPTY STATE
   ========================================================================== */
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon,
  actionHref,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#E3DFD2] p-8 sm:p-12 text-center space-y-4 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-[#EAF1E4] border border-[#E3DFD2] flex items-center justify-center mx-auto text-[#174C35] shadow-2xs">
        {icon || <Sprout size={32} />}
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="font-serif font-bold text-xl text-[#203027]">{title}</h3>
        <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
          {description}
        </p>
      </div>

      {(actionHref || onAction) && actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 font-semibold bg-[#174C35] text-white px-5 py-2.5 rounded-xl min-h-[44px] shadow-xs hover:bg-[#203027] transition-colors"
            >
              <span>{actionLabel}</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   5. LOADING & ERROR STATES
   ========================================================================== */
interface LoadingStateProps {
  message?: string;
  description?: string;
}

export function LoadingState({
  message = 'Loading botanical data...',
  description = 'Connecting to GrowAI agronomic records...',
}: LoadingStateProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#E3DFD2] p-10 text-center space-y-3 shadow-xs">
      <Loader2 size={32} className="animate-spin text-[#174C35] mx-auto" />
      <h4 className="font-serif font-bold text-lg text-[#203027]">{message}</h4>
      <p className="text-sm text-[#5F6D63]">{description}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Unable to Load Data',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="bg-[#FBE9E2] rounded-3xl border border-[#E4775D/30] p-6 sm:p-8 space-y-3.5 text-[#963A23] shadow-xs">
      <div className="flex items-center gap-2.5">
        <AlertTriangle size={22} className="text-[#963A23] shrink-0" />
        <h4 className="font-bold text-lg text-[#963A23]">{title}</h4>
      </div>
      <p className="text-sm sm:text-base leading-relaxed text-[#963A23]">
        {message}
      </p>
      {onRetry && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-[#FBE9E2] text-[#963A23] font-semibold text-xs border border-[#E4775D/30] hover:bg-white transition-colors cursor-pointer min-h-[40px]"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   6. EDUCATIONAL & SAFETY CALLOUTS
   ========================================================================== */
interface EducationalCalloutProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  tip?: string;
}

export function EducationalCallout({
  title,
  children,
  icon,
  tip,
}: EducationalCalloutProps) {
  return (
    <div className="bg-[#F8F6EE] rounded-3xl border border-[#E3DFD2] p-5 sm:p-6 space-y-3 shadow-xs">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-xl bg-white border border-[#E3DFD2] flex items-center justify-center text-[#174C35] shrink-0">
          {icon || <Lightbulb size={18} className="text-[#F0C04D]" />}
        </span>
        <h4 className="font-serif font-bold text-base sm:text-lg text-[#203027]">
          {title}
        </h4>
      </div>
      <div className="text-sm sm:text-base text-[#203027] leading-relaxed">
        {children}
      </div>
      {tip && (
        <p className="text-xs sm:text-sm text-[#5F6D63] bg-white p-3 rounded-xl border border-[#E3DFD2]">
          💡 <strong>Grower Note:</strong> {tip}
        </p>
      )}
    </div>
  );
}

interface SafetyWarningCardProps {
  title: string;
  message: string;
  level?: 'caution' | 'danger';
}

export function SafetyWarningCard({
  title,
  message,
  level = 'caution',
}: SafetyWarningCardProps) {
  const isDanger = level === 'danger';
  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 space-y-2.5 shadow-xs ${
        isDanger
          ? 'bg-[#FBE9E2]/60 border-[#E4775D] text-[#963A23]'
          : 'bg-[#FFF3D7]/60 border-[#F0C04D] text-[#8A6400]'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <ShieldAlert size={22} className={isDanger ? 'text-[#963A23]' : 'text-[#8A6400]'} />
        <h4 className="font-bold text-base sm:text-lg">
          {title}
        </h4>
      </div>
      <p className="text-sm sm:text-base leading-relaxed">
        {message}
      </p>
    </div>
  );
}
