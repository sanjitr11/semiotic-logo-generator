"use client";

import React from "react";

export function BrandAnalysisSkeleton() {
  return (
    <div className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-[#1F1F1F] rounded w-48 mb-6" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-[#1F1F1F] rounded w-24 mb-2" />
            <div className="h-5 bg-[#1F1F1F] rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogoCardSkeleton() {
  return (
    <div className="bg-[#141414] border border-[#1F1F1F] rounded-lg overflow-hidden animate-pulse">
      {/* SVG placeholder with drawing animation */}
      <div className="bg-white aspect-square flex items-center justify-center relative">
        <svg
          viewBox="0 0 200 200"
          className="w-3/4 h-3/4"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="2"
            strokeDasharray="377"
            strokeDashoffset="377"
            className="animate-[draw_2s_ease-in-out_infinite]"
          />
          <path
            d="M60 100 L100 60 L140 100 L100 140 Z"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="2"
            strokeDasharray="227"
            strokeDashoffset="227"
            className="animate-[draw_2s_ease-in-out_infinite_0.5s]"
          />
        </svg>
      </div>

      {/* Content placeholder */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 bg-[#1F1F1F] rounded w-32" />
          <div className="h-5 bg-[#1F1F1F] rounded w-16" />
        </div>
        <div className="h-4 bg-[#1F1F1F] rounded w-full mb-2" />
        <div className="h-4 bg-[#1F1F1F] rounded w-3/4" />
      </div>
    </div>
  );
}

export function LogoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <LogoCardSkeleton />
      <LogoCardSkeleton />
      <LogoCardSkeleton />
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <BrandAnalysisSkeleton />
      <div className="mt-8">
        <LogoGridSkeleton />
      </div>
    </div>
  );
}
