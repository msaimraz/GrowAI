import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface FriendlyEmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

export function FriendlyEmptyState({
  emoji = '🌱',
  title,
  description,
  actionHref,
  actionLabel,
  onActionClick,
  className = '',
}: FriendlyEmptyStateProps) {
  return (
    <div
      className={`rounded-3xl border border-[#E3DFD2] bg-gradient-to-b from-[#F8F6EE] to-[#EAF1E4] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-3xl bg-white border border-[#E3DFD2] flex items-center justify-center text-3xl mx-auto shadow-xs select-none">
        {emoji}
      </div>

      <div className="space-y-1.5">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#203027]">
          {title}
        </h3>
        <p className="text-sm text-[#68766C] leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {(actionHref || onActionClick) && actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center gap-2 font-medium bg-[#174C35] hover:bg-[#123C2A] text-white px-5 py-2.5 rounded-xl shadow-xs transition-colors min-h-[44px]"
            >
              <Plus size={16} />
              <span>{actionLabel}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center justify-center gap-2 font-medium bg-[#174C35] hover:bg-[#123C2A] text-white px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px]"
            >
              <Plus size={16} />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

