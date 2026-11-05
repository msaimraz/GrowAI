'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

interface CopilotInputProps {
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function CopilotInput({
  onSendMessage,
  isLoading,
  disabled = false,
  placeholder = 'Ask a question about your plants, health observations, or care...',
}: CopilotInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={text}
          disabled={disabled || isLoading}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm rounded-2xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] placeholder:text-[#8aa390] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] transition-all disabled:opacity-60 min-h-[48px]"
        />
        <div className="absolute right-3.5 top-3.5 hidden sm:flex items-center text-[10px] text-[#8aa390] pointer-events-none">
          <CornerDownLeft size={13} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!text.trim() || isLoading || disabled}
        className="px-5 py-3 rounded-2xl bg-[#144229] text-white text-xs sm:text-sm font-semibold hover:bg-[#1b5535] disabled:opacity-40 disabled:hover:bg-[#144229] transition-all flex items-center justify-center shrink-0 cursor-pointer min-h-[48px] shadow-xs"
        title="Send inquiry"
      >
        <Send size={15} />
      </button>
    </form>
  );
}

