import { NextRequest, NextResponse } from "next/server";
import { generateLogo } from "@/lib/anthropic";
import { getProject, createLogoConcept } from "@/lib/supabase";
import { LogoType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, logoType } = body;

    if (!projectId || !logoType) {
      return NextResponse.json(
        { error: "Missing required fields: projectId and logoType" },
        { status: 400 }
      );
    }

    const validTypes: LogoType[] = ["wordmark", "pictorial", "abstract"];
    if (!validTypes.includes(logoType)) {
      return NextResponse.json(
        { error: "Invalid logoType. Must be: wordmark, pictorial, or abstract" },
        { status: 400 }
      );
    }

    // Get project and brand analysis
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.brandAnalysis) {
      return NextResponse.json(
        { error: "Project has no brand analysis. Analyze the transcript first." },
        { status: 400 }
      );
    }

    // Generate logo
    const logo = await generateLogo(logoType, project.brandAnalysis);

    // Save to database
    const concept = await createLogoConcept(projectId, {
      conceptName: logo.name,
      logoType: logo.type,
      rationale: logo.rationale,
      svgCode: logo.svg,
      isFavorite: false,
    });

    return NextResponse.json({
      concept: {
        id: concept.id,
        conceptName: concept.conceptName,
        logoType: concept.logoType,
        rationale: concept.rationale,
        svgCode: concept.svgCode,
        isFavorite: concept.isFavorite,
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate logo", details: (error as Error).message },
      { status: 500 }
    );
  }
}
