"use client";

import React from "react";

interface SvgRendererProps {
  svgCode: string;
  className?: string;
  size?: number;
}

export function SvgRenderer({ svgCode, className = "", size = 300 }: SvgRendererProps) {
  // Sanitize and prepare SVG for rendering
  const sanitizedSvg = React.useMemo(() => {
    // Ensure SVG has proper attributes
    let svg = svgCode.trim();

    // If SVG doesn't have xmlns, add it
    if (!svg.includes("xmlns=")) {
      svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    return svg;
  }, [svgCode]);

  return (
    <div
      className={`bg-white rounded-lg flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full flex items-center justify-center p-4"
        dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
      />
    </div>
  );
}

export function SvgThumbnail({ svgCode, size = 80 }: { svgCode: string; size?: number }) {
  return (
    <div
      className="bg-white rounded flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full flex items-center justify-center p-1"
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />
    </div>
  );
}
