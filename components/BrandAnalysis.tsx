"use client";

import React from "react";
import { BrandAnalysis as BrandAnalysisType } from "@/lib/types";

interface BrandAnalysisProps {
  analysis: BrandAnalysisType;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2 py-1 bg-[#1F1F1F] text-[#E8E4DE] text-xs font-mono rounded">
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[#6B6B6B] text-xs font-mono uppercase tracking-wider mb-1">
        {label}
      </dt>
      <dd className="text-[#E8E4DE]">{children}</dd>
    </div>
  );
}

export function BrandAnalysis({ analysis }: BrandAnalysisProps) {
  return (
    <div className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-[#E8E4DE] mb-6 flex items-center gap-3">
        {analysis.companyName}
        <span className="text-sm font-normal text-[#6B6B6B]">Brand Analysis</span>
      </h2>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Industry">
          <Badge>{analysis.industry}</Badge>
        </Field>

        <Field label="Target Audience">{analysis.targetAudience}</Field>

        <Field label="Brand Personality">
          <div className="flex flex-wrap gap-2">
            {analysis.brandPersonality.map((trait, i) => (
              <Badge key={i}>{trait}</Badge>
            ))}
          </div>
        </Field>

        <Field label="Key Differentiators">
          <ul className="space-y-1">
            {analysis.keyDifferentiators.map((diff, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-[#6B6B6B] mt-1">-</span>
                {diff}
              </li>
            ))}
          </ul>
        </Field>

        {analysis.visualPreferences.length > 0 && (
          <Field label="Visual Preferences">
            <div className="flex flex-wrap gap-2">
              {analysis.visualPreferences.map((pref, i) => (
                <Badge key={i}>{pref}</Badge>
              ))}
            </div>
          </Field>
        )}

        {analysis.antiPreferences.length > 0 && (
          <Field label="Avoid">
            <div className="flex flex-wrap gap-2">
              {analysis.antiPreferences.map((anti, i) => (
                <span
                  key={i}
                  className="inline-block px-2 py-1 bg-red-900/30 text-red-400 text-xs font-mono rounded"
                >
                  {anti}
                </span>
              ))}
            </div>
          </Field>
        )}

        <div className="md:col-span-2">
          <Field label="Suggested Direction">
            <div className="flex items-start gap-3">
              <Badge>{analysis.suggestedDirection.type}</Badge>
              <p className="text-sm text-[#6B6B6B]">
                {analysis.suggestedDirection.reasoning}
              </p>
            </div>
          </Field>
        </div>
      </dl>
    </div>
  );
}
