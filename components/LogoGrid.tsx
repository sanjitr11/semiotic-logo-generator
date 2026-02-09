"use client";

import React from "react";
import { LogoConcept, LogoType } from "@/lib/types";
import { LogoCard } from "./LogoCard";

interface LogoGridProps {
  concepts: LogoConcept[];
  onRegenerate?: (logoType: LogoType) => void;
  onToggleFavorite?: (conceptId: string, isFavorite: boolean) => void;
  regeneratingType?: LogoType | null;
}

export function LogoGrid({
  concepts,
  onRegenerate,
  onToggleFavorite,
  regeneratingType,
}: LogoGridProps) {
  // Sort concepts by type order: wordmark, pictorial, abstract
  const typeOrder: LogoType[] = ["wordmark", "pictorial", "abstract"];
  const sortedConcepts = [...concepts].sort(
    (a, b) => typeOrder.indexOf(a.logoType) - typeOrder.indexOf(b.logoType)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {sortedConcepts.map((concept) => (
        <LogoCard
          key={concept.id || `${concept.logoType}-${concept.conceptName}`}
          concept={concept}
          onRegenerate={onRegenerate}
          onToggleFavorite={onToggleFavorite}
          isRegenerating={regeneratingType === concept.logoType}
        />
      ))}
    </div>
  );
}
