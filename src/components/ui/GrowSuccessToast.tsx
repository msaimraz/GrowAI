'use client';

import React from 'react';
import { useGrowToast, GrowToastItem } from '@/context/GrowToastContext';
import { X } from 'lucide-react';

export function GrowSuccessToastContainer() {
  const { toasts, dismissToast } = useGrowToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed z-50 flex flex-col gap-2.5 pointer-events-none transition-all duration-200
        bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md items-center sm:items-end"
    >
      {toasts.map((toast) => (
        <GrowSuccessToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  );
}

function GrowSuccessToastItem({
  toast,
  onDismiss,
}: {
  toast: GrowToastItem;
  onDismiss: () => void;
}) {
  const { title, message, icon = '🌱', variant = 'success' } = toast;

  // Variant styling accents
  const variantStyles = {
    success: {
      iconBg: 'bg-[#E6F0E3]',
      titleColor: 'text-[#174C35]',
      border: 'border-[#E8E4DA]',
    },
    info: {
      iconBg: 'bg-[#E1F0F5]',
      titleColor: 'text-[#1B576B]',
      border: 'border-[#CFE4EC]',
    },
    warning: {
      iconBg: 'bg-[#FFF0D8]',
      titleColor: 'text-[#9A5B00]',
      border: 'border-[#FDE3B8]',
    },
    error: {
      iconBg: 'bg-[#FBE4DC]',
      titleColor: 'text-[#9A3412]',
      border: 'border-[#F8CFC0]',
    },
  }[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto w-full sm:w-auto sm:min-w-[320px] max-w-[calc(100vw-24px)] sm:max-w-md
        bg-white rounded-2xl border ${variantStyles.border} p-3.5 sm:p-4 shadow-md shadow-[#174C35]/5
        flex items-start gap-3 transition-all duration-200 ease-out
        animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none motion-reduce:transition-none`}
    >
      {/* Botanical Icon Pill */}
      <span
        aria-hidden="true"
        className={`w-9 h-9 rounded-xl ${variantStyles.iconBg} flex items-center justify-center text-lg shrink-0 select-none`}
      >
        {icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1 pt-0.5">
        <h4 className={`font-serif font-bold text-sm sm:text-base leading-snug ${variantStyles.titleColor}`}>
          {title}
        </h4>
        <p className="text-xs text-[#526357] leading-relaxed mt-0.5 break-words">
          {message}
        </p>
      </div>

      {/* Accessible Dismiss Button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="w-11 h-11 -mr-1.5 -mt-1 rounded-xl flex items-center justify-center text-[#8A958D] hover:text-[#174C35] hover:bg-[#F3F6EC] transition-colors cursor-pointer shrink-0"
      >
        <X size={16} strokeWidth={2.25} />
      </button>
    </div>
  );
}

// Re-export context hook from component file for convenience
export { useGrowToast } from '@/context/GrowToastContext';

