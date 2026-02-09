import { NextRequest, NextResponse } from "next/server";
import { getProjectWithLogos } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const project = await getProjectWithLogos(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        id: project.id,
        createdAt: project.createdAt,
        status: project.status,
        brandAnalysis: project.brandAnalysis,
        logoConcepts: project.logoConcepts.map((logo) => ({
          id: logo.id,
          conceptName: logo.conceptName,
          logoType: logo.logoType,
          rationale: logo.rationale,
          svgCode: logo.svgCode,
          isFavorite: logo.isFavorite,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to get project:", error);
    return NextResponse.json(
      { error: "Failed to get project", details: (error as Error).message },
      { status: 500 }
    );
  }
}
