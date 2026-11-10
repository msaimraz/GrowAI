import React from 'react';
import { Check } from 'lucide-react';

export interface ActionCardProps {
  id: string;
  icon: string | React.ReactNode;
  category?: 'water' | 'sunlight' | 'feeding' | 'inspect' | 'inspection' | 'harvest' | 'growth' | string;
  title: string;
  subtitle?: string;
  tag?: string;
  completed?: boolean;
  onToggle?: () => void;
  actionButtonLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

export function getSemanticCareColor(categoryOrIcon?: string, title?: string): {
  iconColor: string;
  bgSoft: string;
  borderSoft: string;
} {
  const str = `${categoryOrIcon || ''} ${title || ''}`.toLowerCase();

  // Water: Blue (#65A8D0) + Soft Surface (#E7F2F9)
  if (str.includes('water') || str.includes('💧') || str.includes('moist') || str.includes('drain')) {
    return {
      iconColor: 'text-[#1B5D88]',
      bgSoft: 'bg-[#E7F2F9]',
      borderSoft: 'border-[#65A8D0]/35',
    };
  }

  // Sunlight: Warm Yellow (#F0C04D) + Soft Surface (#FFF3D7)
  if (str.includes('sun') || str.includes('light') || str.includes('☀️') || str.includes('bright')) {
    return {
      iconColor: 'text-[#8A6400]',
      bgSoft: 'bg-[#FFF3D7]',
      borderSoft: 'border-[#F0C04D]/35',
    };
  }

  // Feeding: Leaf Green (#78A95A) + Soft Surface (#EAF1E4)
  if (str.includes('feed') || str.includes('fertiliz') || str.includes('nutrient') || str.includes('compost')) {
    return {
      iconColor: 'text-[#174C35]',
      bgSoft: 'bg-[#EAF1E4]',
      borderSoft: 'border-[#78A95A]/35',
    };
  }

  // Inspection: Forest / Sage (#174C35) + Soft Surface (#EAF1E4)
  if (str.includes('inspect') || str.includes('check') || str.includes('pest') || str.includes('bug')) {
    return {
      iconColor: 'text-[#174C35]',
      bgSoft: 'bg-[#EAF1E4]',
      borderSoft: 'border-[#174C35]/25',
    };
  }

  // Harvest: Coral (#E4775D) + Soft Surface (#FBE9E2)
  if (str.includes('harvest') || str.includes('snip') || str.includes('prune') || str.includes('✂️') || str.includes('fruit')) {
    return {
      iconColor: 'text-[#963A23]',
      bgSoft: 'bg-[#FBE9E2]',
      borderSoft: 'border-[#E4775D]/35',
    };
  }

  // Growth / General Care (Default): Fresh Green (#78A95A) + Soft Surface (#EAF1E4)
  return {
    iconColor: 'text-[#174C35]',
    bgSoft: 'bg-[#EAF1E4]',
    borderSoft: 'border-[#78A95A]/30',
  };
}

export function ActionCard({
  icon,
  category,
  title,
  subtitle,
  tag = 'Today',
  completed = false,
  onToggle,
  actionButtonLabel,
  onActionClick,
  className = '',
}: ActionCardProps) {
  const semantic = getSemanticCareColor(category || (typeof icon === 'string' ? icon : undefined), title);

  return (
    <div
      className={`rounded-2xl border transition-all duration-150 p-3.5 sm:p-4 lg:p-5 flex items-start sm:items-center justify-between gap-3.5 ${
        completed
          ? 'bg-[#EAF1E4]/50 border-[#E3DFD2] opacity-75'
          : 'bg-white border-[#E3DFD2] hover:border-[#174C35]/35 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        {/* Toggle Button — Strict >= 44px Touch Target */}
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer touch-manipulation select-none ${
              completed
                ? 'bg-[#174C35] text-white shadow-2xs'
                : `bg-[#F8F6EE] border-2 border-[#E3DFD2] hover:border-[#174C35] text-transparent hover:text-[#174C35]/40`
            }`}
            aria-label={`Mark task ${title} as ${completed ? 'incomplete' : 'complete'}`}
          >
            <Check size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <span
            className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-full ${semantic.bgSoft} border ${semantic.borderSoft} ${semantic.iconColor} flex items-center justify-center text-lg shrink-0 select-none`}
          >
            {icon}
          </span>
        )}

        {/* Task Hierarchy: Title, Short Instruction, Due Date */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`font-serif text-sm sm:text-base font-bold text-[#203027] leading-snug whitespace-normal break-words ${
                completed ? 'line-through text-[#68766C]' : ''
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
                    ? 'bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D]/35'
                    : tag.toLowerCase().includes('tomorrow')
                    ? 'bg-[#E7F2F9] text-[#1B5D88] border border-[#65A8D0]/35'
                    : 'bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/30'
                }`}
              >
                {tag}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#68766C] leading-relaxed whitespace-normal break-words">
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
          className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#EAF1E4] hover:bg-[#174C35] active:scale-95 text-[#174C35] hover:text-white transition-all cursor-pointer shrink-0 min-h-[40px] touch-manipulation"
        >
          {actionButtonLabel}
        </button>
      )}
    </div>
  );
}
