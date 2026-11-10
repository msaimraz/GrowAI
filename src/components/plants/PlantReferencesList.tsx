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
      <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E3DFD2]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#EAF1E4] border border-[#E3DFD2] flex items-center justify-center text-[#174C35] shrink-0">
              <FileText size={20} />
            </span>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027]">
                7. Traceable Scientific & Regulatory References
              </h3>
              <p className="text-xs sm:text-sm text-[#5F6D63]">
                Peer-reviewed citations, government agricultural extensions, and toxicology authorities.
              </p>
            </div>
          </div>

          <span className="text-xs sm:text-sm font-semibold text-[#174C35] px-3 py-1 rounded-full bg-[#EAF1E4] border border-[#E3DFD2] self-start sm:self-auto">
            {medicinalReferences.length} Peer-Reviewed Citations
          </span>
        </div>

        {medicinalReferences.length > 0 ? (
          <ol className="divide-y divide-[#E3DFD2]">
            {medicinalReferences.map((ref, idx) => (
              <li key={idx} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#174C35] bg-[#EAF1E4] px-2.5 py-1 rounded-lg shrink-0 mt-0.5 border border-[#E3DFD2]">
                    [{idx + 1}]
                  </span>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-[#203027] leading-snug">
                      {ref.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#203027]">
                      <span className="font-medium text-[#203027]">
                        {ref.authorOrOrg}
                      </span>
                      {ref.year && (
                        <span>• ({ref.year})</span>
                      )}
                      {ref.publication && (
                        <span className="italic text-[#5F6D63]">
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
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#174C35] hover:text-[#203027] hover:underline"
                        >
                          <span>Access Primary Source Publication</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {ref.doi && (
                        <span className="text-xs font-mono text-[#5F6D63]">
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
          <p className="text-base text-[#203027] italic p-4 bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2]">
            No individual pharmacological citations linked.
          </p>
        )}
      </div>

      {/* 2. Horticultural & Agronomic Sources */}
      {horticulturalUrls && horticulturalUrls.length > 0 && (
        <div className="bg-[#F8F6EE] rounded-3xl border border-[#E3DFD2] p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3DFD2]">
            <Globe size={18} className="text-[#174C35]" />
            <h4 className="text-base sm:text-lg font-serif font-bold text-[#203027]">
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
                  className="p-3.5 bg-white rounded-2xl border border-[#E3DFD2] hover:border-[#174C35] hover:shadow-xs transition-all flex items-center justify-between gap-3 text-xs sm:text-sm text-[#174C35] font-medium group"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-[#203027] block truncate group-hover:text-[#174C35]">
                      Source {i + 1}
                    </span>
                    <span className="text-xs text-[#5F6D63] truncate block">
                      {domain}
                    </span>
                  </div>
                  <ExternalLink size={15} className="shrink-0 text-[#5F6D63] group-hover:text-[#174C35]" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
