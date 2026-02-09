import { NextResponse } from "next/server";
import { getRecentProjects } from "@/lib/supabase";

export async function GET() {
  try {
    const projects = await getRecentProjects(20);

    return NextResponse.json({
      projects: projects.map((project) => ({
        id: project.id,
        createdAt: project.createdAt,
        companyName: project.brandAnalysis?.companyName || "Untitled Project",
        status: project.status,
        logoCount: project.logoConcepts.length,
        logos: project.logoConcepts.slice(0, 3).map((logo) => ({
          id: logo.id,
          logoType: logo.logoType,
          svgCode: logo.svgCode,
        })),
      })),
    });
  } catch (error) {
    console.error("Failed to get projects:", error);
    return NextResponse.json(
      { error: "Failed to get projects", details: (error as Error).message },
      { status: 500 }
    );
  }
}
