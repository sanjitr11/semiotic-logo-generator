"use client";

import React, { useState, useCallback } from "react";
import { LogoConcept, LogoType } from "@/lib/types";
import { SvgRenderer } from "./SvgRenderer";

interface LogoCardProps {
  concept: LogoConcept;
  onRegenerate?: (logoType: LogoType) => void;
  onToggleFavorite?: (conceptId: string, isFavorite: boolean) => void;
  isRegenerating?: boolean;
}

function LogoTypeBadge({ type }: { type: LogoType }) {
  const labels: Record<LogoType, string> = {
    wordmark: "Wordmark",
    pictorial: "Pictorial",
    abstract: "Abstract",
  };

  return (
    <span className="px-2 py-0.5 bg-[#1F1F1F] text-[#6B6B6B] text-xs font-mono rounded">
      {labels[type]}
    </span>
  );
}

export function LogoCard({
  concept,
  onRegenerate,
  onToggleFavorite,
  isRegenerating = false,
}: LogoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);

  const handleDownload = useCallback(() => {
    const blob = new Blob([concept.svgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${concept.conceptName.toLowerCase().replace(/\s+/g, "-")}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowDownloadConfirm(true);
    setTimeout(() => setShowDownloadConfirm(false), 2000);
  }, [concept.svgCode, concept.conceptName]);

  const handleFavorite = useCallback(() => {
    if (concept.id && onToggleFavorite) {
      onToggleFavorite(concept.id, !concept.isFavorite);
    }
  }, [concept.id, concept.isFavorite, onToggleFavorite]);

  return (
    <div
      className={`bg-[#141414] border border-[#1F1F1F] rounded-lg overflow-hidden transition-transform hover:scale-[1.02] ${
        isRegenerating ? "opacity-50" : ""
      }`}
    >
      {/* SVG Display */}
      <div className="relative group">
        <SvgRenderer svgCode={concept.svgCode} className="w-full aspect-square" />

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              title="Download SVG"
            >
              {showDownloadConfirm ? (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              )}
            </button>

            {onRegenerate && (
              <button
                onClick={() => onRegenerate(concept.logoType)}
                disabled={isRegenerating}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Regenerate"
              >
                <svg
                  className={`w-5 h-5 text-gray-700 ${isRegenerating ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-[#E8E4DE]">{concept.conceptName}</h3>
          <div className="flex items-center gap-2">
            <LogoTypeBadge type={concept.logoType} />
            {onToggleFavorite && (
              <button
                onClick={handleFavorite}
                className="p-1 hover:bg-[#1F1F1F] rounded transition-colors"
                title={concept.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  className={`w-4 h-4 transition-colors ${
                    concept.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-[#6B6B6B]"
                  }`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className={`text-sm text-[#6B6B6B] ${isExpanded ? "" : "line-clamp-2"}`}>
          {concept.rationale}
        </div>

        {concept.rationale.length > 100 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-[#6B6B6B] hover:text-[#E8E4DE] mt-2 transition-colors"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
}
