import React from 'react';
import { Check, CheckCircle2, Circle } from 'lucide-react';

interface ActionCardProps {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  tag?: string;
  completed?: boolean;
  onToggle?: () => void;
  actionButtonLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

export function ActionCard({
  icon,
  title,
  subtitle,
  tag = 'Today',
  completed = false,
  onToggle,
  actionButtonLabel,
  onActionClick,
  className = '',
}: ActionCardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-150 p-4 sm:p-5 flex items-center justify-between gap-3 ${
        completed
          ? 'bg-[#F3F6EC]/80 border-[#CEE4C9] opacity-75'
          : 'bg-white border-[#E8E4DA] hover:border-[#174C35]/30 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Toggle Button */}
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              completed
                ? 'bg-[#174C35] text-white'
                : 'bg-[#FBF9F4] border-2 border-[#E8E4DA] hover:border-[#174C35] text-transparent hover:text-[#174C35]/40'
            }`}
            aria-label={`Mark task ${title} as ${completed ? 'incomplete' : 'complete'}`}
          >
            <Check size={18} strokeWidth={2.5} />
          </button>
        ) : (
          <span className="w-9 h-9 rounded-full bg-[#FFF0D8] border border-[#FDE3B8] flex items-center justify-center text-lg shrink-0 select-none">
            {icon}
          </span>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`font-serif text-sm sm:text-base font-bold text-[#1F2A23] truncate ${
                completed ? 'line-through text-[#68736B]' : ''
              }`}
            >
              {icon} {title}
            </h4>
            {tag && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                  tag.toLowerCase() === 'today'
                    ? 'bg-[#FFF0D8] text-[#9A5B00]'
                    : 'bg-[#F3F6EC] text-[#68736B]'
                }`}
              >
                {tag}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#68736B] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Optional Right Action */}
      {actionButtonLabel && onActionClick && !completed && (
        <button
          type="button"
          onClick={onActionClick}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E6F0E3] hover:bg-[#174C35] text-[#174C35] hover:text-white transition-colors cursor-pointer shrink-0"
        >
          {actionButtonLabel}
        </button>
      )}
    </div>
  );
}

