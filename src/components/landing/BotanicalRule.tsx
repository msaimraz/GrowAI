import React from 'react';

interface BotanicalRuleProps {
  className?: string;
  withNode?: boolean;
}

export function BotanicalRule({ className = '', withNode = true }: BotanicalRuleProps) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 ${className}`} aria-hidden="true">
      <div className="flex items-center justify-between text-[#163A2A]/20">
        <span className="text-[10px] font-mono tracking-widest text-[#687268]/60 select-none">
          +
        </span>
        <div className="flex-1 mx-4 flex items-center">
          <div className="flex-1 h-[1px] bg-[#163A2A]/10" />
          {withNode && (
            <div className="px-3 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#C86B4A]" />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-[#163A2A]/50 -rotate-45"
              >
                <path d="M12 22V12M12 12C12 7 7 4 2 4C2 9 5 12 12 12ZM12 12C12 7 17 4 22 4C22 9 19 12 12 12Z" />
              </svg>
              <span className="w-1 h-1 rounded-full bg-[#879B78]" />
            </div>
          )}
          <div className="flex-1 h-[1px] bg-[#163A2A]/10" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-[#687268]/60 select-none">
          +
        </span>
      </div>
    </div>
  );
}

