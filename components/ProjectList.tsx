"use client";

import React from "react";
import Link from "next/link";
import { SvgThumbnail } from "./SvgRenderer";

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

interface ProjectListProps {
  projects: ProjectSummary[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    complete: "bg-green-900/30 text-green-400",
    generating: "bg-yellow-900/30 text-yellow-400",
    analyzing: "bg-blue-900/30 text-blue-400",
    pending: "bg-gray-900/30 text-gray-400",
    error: "bg-red-900/30 text-red-400",
  };

  return (
    <span
      className={`px-2 py-0.5 text-xs font-mono rounded ${styles[status] || styles.pending}`}
    >
      {status}
    </span>
  );
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-[#6B6B6B]">
        <p>No projects yet. Generate your first logo above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/project/${project.id}`}
          className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-4 hover:border-[#6B6B6B] transition-colors group"
        >
          {/* Logo thumbnails */}
          <div className="flex gap-2 mb-3">
            {project.logos.length > 0 ? (
              project.logos.map((logo) => (
                <SvgThumbnail key={logo.id} svgCode={logo.svgCode} size={60} />
              ))
            ) : (
              <div className="w-[60px] h-[60px] bg-[#1F1F1F] rounded flex items-center justify-center">
                <span className="text-[#6B6B6B] text-xs">-</span>
              </div>
            )}
          </div>

          {/* Project info */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-[#E8E4DE] text-sm truncate group-hover:text-white transition-colors">
              {project.companyName}
            </h3>
            <StatusBadge status={project.status} />
          </div>

          <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
            <span>{formatDate(project.createdAt)}</span>
            <span>{project.logoCount} logo{project.logoCount !== 1 ? "s" : ""}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
