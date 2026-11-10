import React from 'react';
import { Check } from 'lucide-react';

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
      className={`rounded-2xl border transition-all duration-150 p-3.5 sm:p-4 lg:p-5 flex items-start sm:items-center justify-between gap-3.5 ${
        completed
          ? 'bg-[#F3F6EC]/80 border-[#CEE4C9] opacity-75'
          : 'bg-white border-[#E8E4DA] hover:border-[#174C35]/30 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        {/* Toggle Button — Strict ≥ 44px Touch Target */}
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer touch-manipulation select-none ${
              completed
                ? 'bg-[#174C35] text-white shadow-2xs'
                : 'bg-[#FBF9F4] border-2 border-[#D8D2C4] hover:border-[#174C35] text-transparent hover:text-[#174C35]/40'
            }`}
            aria-label={`Mark task ${title} as ${completed ? 'incomplete' : 'complete'}`}
          >
            <Check size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <span className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[#FFF0D8] border border-[#FDE3B8] flex items-center justify-center text-lg shrink-0 select-none">
            {icon}
          </span>
        )}

        {/* Task Hierarchy: Title, Short Instruction, Due Date */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`font-serif text-sm sm:text-base font-bold text-[#1F2A23] leading-snug whitespace-normal break-words ${
                completed ? 'line-through text-[#68736B]' : ''
              }`}
              style={{ overflowWrap: 'anywhere' }}
            >
              <span className="mr-1">{icon}</span>
              {title}
            </h4>
            {tag && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                  tag.toLowerCase() === 'today'
                    ? 'bg-[#FFF0D8] text-[#9A5B00] border border-[#FDE3B8]'
                    : tag.toLowerCase().includes('tomorrow')
                    ? 'bg-[#EBF3FC] text-[#2262A6] border border-[#D3E4F8]'
                    : 'bg-[#F3F6EC] text-[#526A57] border border-[#E0EBE0]'
                }`}
              >
                {tag}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#68736B] leading-relaxed whitespace-normal break-words">
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
          className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#E6F0E3] hover:bg-[#174C35] active:scale-95 text-[#174C35] hover:text-white transition-all cursor-pointer shrink-0 min-h-[40px] touch-manipulation"
        >
          {actionButtonLabel}
        </button>
      )}
    </div>
  );
}
