"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TranscriptInput } from "@/components/TranscriptInput";
import { ProjectList } from "@/components/ProjectList";
import { Transcript } from "@/lib/types";

interface ProjectSummary {
  id: string;
  createdAt: string;
  companyName: string;
  status: string;
  logoCount: number;
  logos: {
    id: string;
    logoType: string;
    svgCode: string;
  }[];
}

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Fetch recent projects on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setIsLoadingProjects(false);
      }
    }

    fetchProjects();
  }, []);

  const handleSubmit = useCallback(
    async (transcript: Transcript) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to analyze transcript");
        }

        // Navigate to project page
        router.push(`/project/${data.projectId}`);
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
      }
    },
    [router]
  );

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#1F1F1F]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#E8E4DE] mb-4">
            Logo Generator
          </h1>
          <p className="text-[#6B6B6B] text-lg">
            Paste a meeting transcript. Get logo concepts.
          </p>
        </div>

        <TranscriptInput onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <div className="max-w-3xl mx-auto mt-4">
            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}
      </section>

      {/* Recent Projects Section */}
      <section className="py-12 px-6 border-t border-[#1F1F1F]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-medium text-[#E8E4DE] mb-6">
            Recent Projects
          </h2>

          {isLoadingProjects ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-4 animate-pulse"
                >
                  <div className="flex gap-2 mb-3">
                    <div className="w-[60px] h-[60px] bg-[#1F1F1F] rounded" />
                    <div className="w-[60px] h-[60px] bg-[#1F1F1F] rounded" />
                    <div className="w-[60px] h-[60px] bg-[#1F1F1F] rounded" />
                  </div>
                  <div className="h-4 bg-[#1F1F1F] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#1F1F1F] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <ProjectList projects={projects} />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] py-6 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#6B6B6B] text-sm">
            Built with Claude AI by Semiotic
          </p>
        </div>
      </footer>
    </main>
  );
}
