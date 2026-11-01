'use client';

import React from 'react';
import { PlantReference } from '@/types/plant';
import { FileText, ExternalLink, BookmarkCheck, Globe } from 'lucide-react';

interface PlantReferencesListProps {
  medicinalReferences: PlantReference[];
  horticulturalUrls: string[];
}

export function PlantReferencesList({
  medicinalReferences,
  horticulturalUrls,
}: PlantReferencesListProps) {
  return (
    <div className="space-y-6">
      {/* 1. Primary Pharmacological & Scientific References */}
      <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f0ebe0]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] flex items-center justify-center text-[#144229] shrink-0">
              <FileText size={20} />
            </span>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11]">
                7. Traceable Scientific & Regulatory References
              </h3>
              <p className="text-xs sm:text-sm text-[#5a7662]">
                Peer-reviewed citations, government agricultural extensions, and toxicology authorities.
              </p>
            </div>
          </div>

          <span className="text-xs sm:text-sm font-semibold text-[#144229] px-3 py-1 rounded-full bg-[#f4f8f4] border border-[#cfe0cf] self-start sm:self-auto">
            {medicinalReferences.length} Peer-Reviewed Citations
          </span>
        </div>

        {medicinalReferences.length > 0 ? (
          <ol className="divide-y divide-[#f0ebe0]">
            {medicinalReferences.map((ref, idx) => (
              <li key={idx} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#144229] bg-[#eef5ee] px-2.5 py-1 rounded-lg shrink-0 mt-0.5 border border-[#cfe0cf]">
                    [{idx + 1}]
                  </span>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-[#071c11] leading-snug">
                      {ref.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#2e4435]">
                      <span className="font-medium text-[#1c261e]">
                        {ref.authorOrOrg}
                      </span>
                      {ref.year && (
                        <span>• ({ref.year})</span>
                      )}
                      {ref.publication && (
                        <span className="italic text-[#5a7662]">
                          • {ref.publication}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#144229] hover:text-[#071c11] hover:underline"
                        >
                          <span>Access Primary Source Publication</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {ref.doi && (
                        <span className="text-xs font-mono text-[#5a7662]">
                          DOI: {ref.doi}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-base text-[#2e4435] italic p-4 bg-[#fbf9f4] rounded-2xl border border-[#ded5c5]">
            No individual pharmacological citations linked.
          </p>
        )}
      </div>

      {/* 2. Horticultural & Agronomic Sources */}
      {horticulturalUrls && horticulturalUrls.length > 0 && (
        <div className="bg-[#f7f5ed] rounded-3xl border border-[#ded5c5] p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#e2dbce]">
            <Globe size={18} className="text-[#144229]" />
            <h4 className="text-base sm:text-lg font-serif font-bold text-[#071c11]">
              Horticultural Extensions & Agronomic Resources
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {horticulturalUrls.map((url, i) => {
              let domain = url;
              try {
                domain = new URL(url).hostname.replace('www.', '');
              } catch {}

              return (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="p-3.5 bg-white rounded-2xl border border-[#ded5c5] hover:border-[#144229] hover:shadow-xs transition-all flex items-center justify-between gap-3 text-xs sm:text-sm text-[#144229] font-medium group"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-[#071c11] block truncate group-hover:text-[#144229]">
                      Source {i + 1}
                    </span>
                    <span className="text-xs text-[#5a7662] truncate block">
                      {domain}
                    </span>
                  </div>
                  <ExternalLink size={15} className="shrink-0 text-[#5a7662] group-hover:text-[#144229]" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
