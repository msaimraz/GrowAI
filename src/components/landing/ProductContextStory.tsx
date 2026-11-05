import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export function ProductContextStory() {
  return (
    <section className="py-20 lg:py-32 bg-[#F6F1E8] border-b border-[#163A2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Large Editorial Typography & Short Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Tiny Terracotta Accent Near Heading */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-5 h-[2px] bg-[#C86B4A]" />
                <span className="text-[11px] font-mono tracking-widest text-[#687268] uppercase">
                  GROWER COPILOT
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#163A2A] tracking-tight leading-[1.12]">
                Don’t Just
                <br />
                Get Answers.
                <br />
                <span className="italic font-normal">Get Context.</span>
              </h2>
            </div>

            <p className="text-base text-[#263028]/85 leading-relaxed font-normal">
              Most assistants answer plant questions with generic web articles. The GrowAI Copilot reasons directly from your real garden context — cross-referencing temperature trends, container volume, feeding history, and active plan steps.
            </p>

            <div className="pt-2 space-y-3 text-xs font-mono text-[#687268]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C86B4A]" />
                <span>Reads active records before answering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#879B78]" />
                <span>Explicit confirmation gate before updating live data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#163A2A]" />
                <span>Evidence-grounded agronomic citations</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/app/grow-intelligence"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#163A2A] hover:text-[#C86B4A] transition-colors"
              >
                <span>Explore Copilot Architecture</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right Column: ONE Large Copilot UI Screenshot (Only Contained Element) */}
          <div className="lg:col-span-7">
            <div className="rounded-[6px] bg-[#FBF8F2] border border-[#163A2A]/12 shadow-[0_8px_30px_rgba(22,58,42,0.06)] overflow-hidden">
              {/* Header Bar */}
              <div className="px-5 py-3.5 border-b border-[#163A2A]/10 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#163A2A]" />
                  <span className="text-xs font-serif font-bold text-[#163A2A]">
                    Grower Copilot
                  </span>
                  <span className="text-[10px] font-mono text-[#687268]">
                    · Grounded in 3 Active Plants
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-[2px] bg-[#F6F1E8] text-[#163A2A] border border-[#163A2A]/10">
                  Live Session
                </span>
              </div>

              {/* Chat Stream */}
              <div className="p-5 sm:p-6 space-y-4 text-xs font-sans">
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="bg-[#163A2A] text-[#F6F1E8] rounded-[4px] px-4 py-2.5 max-w-[85%] font-medium">
                    What should I check on my plants today?
                  </div>
                </div>

                {/* Copilot Contextual Response */}
                <div className="flex justify-start">
                  <div className="bg-white border border-[#163A2A]/10 rounded-[4px] p-4 sm:p-5 max-w-[95%] space-y-3.5">
                    <p className="text-[#263028] leading-relaxed">
                      You have <strong>3 plants</strong> in your garden and <strong>2 priority actions</strong> due today based on your active records:
                    </p>

                    {/* Cited Tasks */}
                    <div className="space-y-2">
                      <div className="p-3 rounded-[3px] bg-[#F6F1E8]/70 border border-[#163A2A]/8 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-[#163A2A] font-serif">
                            Sweet Basil — Establishment Plan
                          </strong>
                          <span className="text-[10px] font-mono text-[#C86B4A] font-semibold">
                            Step 4 Actionable
                          </span>
                        </div>
                        <p className="text-[11px] text-[#687268] leading-normal">
                          Inspect drainage perforations for white root tips. Yesterday’s 29.4°C heat spike accelerated drying; bottom-watering is ready.
                        </p>
                      </div>

                      <div className="p-3 rounded-[3px] bg-[#F6F1E8]/70 border border-[#163A2A]/8 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-[#163A2A] font-serif">
                            Patio Peppermint — Health Follow-Up
                          </strong>
                          <span className="text-[10px] font-mono text-[#879B78] font-semibold">
                            Day 3 Observation
                          </span>
                        </div>
                        <p className="text-[11px] text-[#687268] leading-normal">
                          Follow-up #2 is due: verify lower stem discoloration has stabilized following the organic neem application.
                        </p>
                      </div>
                    </div>

                    {/* Consequential Action Confirmation Gate */}
                    <div className="p-3.5 rounded-[3px] border border-[#C86B4A]/30 bg-[#C86B4A]/5 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#C86B4A] font-semibold uppercase tracking-wider">
                        <AlertCircle size={13} />
                        <span>Action Requires Confirmation</span>
                      </div>
                      <p className="text-[11px] text-[#263028]">
                        Would you like me to record Step 4 on Sweet Basil as completed?
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-[3px] bg-[#163A2A] text-[#F6F1E8] text-[11px] font-medium transition-colors hover:bg-[#1f4e39] cursor-pointer"
                        >
                          Confirm & Complete
                        </button>
                        <button
                          type="button"
                          className="px-2.5 py-1.5 rounded-[3px] border border-[#163A2A]/20 text-[#687268] text-[11px] hover:text-[#163A2A] cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>

                    {/* Footer Provenance */}
                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#687268]">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={12} className="text-[#879B78]" />
                        Grounded in active garden state · Zero ungrounded guessing
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
