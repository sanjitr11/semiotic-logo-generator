"use client";

import React from "react";

interface SvgRendererProps {
  svgCode: string;
  className?: string;
  size?: number;
}

function prepareSvg(svgCode: string): string {
  let svg = svgCode.trim();

  // Add xmlns if missing
  if (!svg.includes("xmlns=")) {
    svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Remove any existing width/height so the SVG scales to its container
  svg = svg.replace(/<svg([^>]*)>/, (match, attrs) => {
    const cleaned = attrs
      .replace(/\bwidth\s*=\s*["'][^"']*["']/g, "")
      .replace(/\bheight\s*=\s*["'][^"']*["']/g, "");
    return `<svg${cleaned}>`;
  });

  // Ensure preserveAspectRatio for proper scaling
  if (!svg.includes("preserveAspectRatio")) {
    svg = svg.replace("<svg", '<svg preserveAspectRatio="xMidYMid meet"');
  }

  return svg;
}

export function SvgRenderer({ svgCode, className = "", size }: SvgRendererProps) {
  const sanitizedSvg = React.useMemo(() => prepareSvg(svgCode), [svgCode]);

  return (
    <div
      className={`bg-white rounded-lg overflow-hidden ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <div
        className="w-full h-full p-4"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div
          className="w-full h-full"
          style={{ display: "block" }}
          dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
        />
      </div>
    </div>
  );
}

export function SvgThumbnail({ svgCode, size = 80 }: { svgCode: string; size?: number }) {
  const sanitizedSvg = React.useMemo(() => prepareSvg(svgCode), [svgCode]);

  return (
    <div
      className="bg-white rounded overflow-hidden"
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full p-1"
        dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
      />
    </div>
  );
}
