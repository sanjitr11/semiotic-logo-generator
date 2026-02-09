"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BrandAnalysis } from "@/components/BrandAnalysis";
import { LogoGrid } from "@/components/LogoGrid";
import {
  BrandAnalysisSkeleton,
  LogoGridSkeleton,
} from "@/components/LoadingSkeleton";
import { LogoConcept, LogoType, BrandAnalysis as BrandAnalysisType } from "@/lib/types";

interface ProjectData {
  id: string;
  createdAt: string;
  status: string;
  brandAnalysis: BrandAnalysisType | null;
  logoConcepts: LogoConcept[];
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<LogoType | null>(null);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);

  // Fetch project data
  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/project/${projectId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load project");
        }

        setProject(data.project);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleRegenerate = useCallback(
    async (logoType: LogoType) => {
      if (regeneratingType || isRegeneratingAll) return;

      setRegeneratingType(logoType);

      try {
        const response = await fetch("/api/regenerate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, logoType }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to regenerate logo");
        }

        // Update the concept in state
        setProject((prev) => {
          if (!prev) return prev;

          const updatedConcepts = prev.logoConcepts.filter(
            (c) => c.logoType !== logoType
          );
          updatedConcepts.push(data.concept);

          return { ...prev, logoConcepts: updatedConcepts };
        });
      } catch (err) {
        console.error("Regeneration failed:", err);
        alert((err as Error).message);
      } finally {
        setRegeneratingType(null);
      }
    },
    [projectId, regeneratingType, isRegeneratingAll]
  );

  const handleRegenerateAll = useCallback(async () => {
    if (regeneratingType || isRegeneratingAll) return;

    setIsRegeneratingAll(true);

    try {
      const response = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, regenerateAll: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate logos");
      }

      // Update all concepts in state
      setProject((prev) => {
        if (!prev) return prev;
        return { ...prev, logoConcepts: data.concepts };
      });
    } catch (err) {
      console.error("Regeneration failed:", err);
      alert((err as Error).message);
    } finally {
      setIsRegeneratingAll(false);
    }
  }, [projectId, regeneratingType, isRegeneratingAll]);

  const handleToggleFavorite = useCallback(
    async (conceptId: string, isFavorite: boolean) => {
      // Optimistic update
      setProject((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          logoConcepts: prev.logoConcepts.map((c) =>
            c.id === conceptId ? { ...c, isFavorite } : c
          ),
        };
      });

      // TODO: Add API call to persist favorite status
    },
    []
  );

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <BrandAnalysisSkeleton />
          <div className="mt-8">
            <LogoGridSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              Error Loading Project
            </h2>
            <p className="text-red-400/80 mb-4">{error || "Project not found"}</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-[#1F1F1F] text-[#E8E4DE] rounded hover:bg-[#2a2a2a] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Brand Analysis */}
        {project.brandAnalysis && (
          <BrandAnalysis analysis={project.brandAnalysis} />
        )}

        {/* Logo Concepts */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-[#E8E4DE]">Logo Concepts</h2>
            <button
              onClick={handleRegenerateAll}
              disabled={isRegeneratingAll || regeneratingType !== null}
              className="px-4 py-2 bg-[#1F1F1F] text-[#E8E4DE] text-sm rounded hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRegeneratingAll ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Regenerating...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
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
                  Regenerate All
                </>
              )}
            </button>
          </div>

          {project.logoConcepts.length > 0 ? (
            <LogoGrid
              concepts={project.logoConcepts}
              onRegenerate={handleRegenerate}
              onToggleFavorite={handleToggleFavorite}
              regeneratingType={regeneratingType}
            />
          ) : (
            <div className="text-center py-12 text-[#6B6B6B]">
              <p>No logos generated yet.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[#E8E4DE] text-[#0A0A0A] font-medium rounded-lg hover:bg-white transition-colors"
          >
            New Project
          </Link>
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-[#1F1F1F]">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <svg
            viewBox="0 0 32 32"
            className="w-8 h-8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="14" stroke="#E8E4DE" strokeWidth="2" />
            <path
              d="M10 16h12M16 10v12"
              stroke="#E8E4DE"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[#E8E4DE] font-semibold">Semiotic</span>
        </Link>
      </div>
    </header>
  );
}
