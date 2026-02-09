import { NextRequest, NextResponse } from "next/server";
import { analyzeTranscript, generateAllLogos } from "@/lib/anthropic";
import {
  createProject,
  updateProjectStatus,
  updateProjectAnalysis,
  createLogoConcept,
  completeProject,
} from "@/lib/supabase";
import { Transcript } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transcript = body.transcript as Transcript;

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: "Invalid transcript format. Expected array of transcript entries." },
        { status: 400 }
      );
    }

    // Validate transcript entries
    for (const entry of transcript) {
      if (!entry.text || !entry.speaker) {
        return NextResponse.json(
          { error: "Each transcript entry must have 'text' and 'speaker' fields." },
          { status: 400 }
        );
      }
    }

    // Create project
    const project = await createProject(transcript);

    // Update status to analyzing
    await updateProjectStatus(project.id, "analyzing");

    // Analyze transcript
    const brandAnalysis = await analyzeTranscript(transcript);

    // Update project with analysis
    await updateProjectAnalysis(project.id, brandAnalysis);

    // Generate all logos in parallel
    const logos = await generateAllLogos(brandAnalysis);

    // Save logos to database
    for (const logo of logos) {
      await createLogoConcept(project.id, {
        conceptName: logo.name,
        logoType: logo.type,
        rationale: logo.rationale,
        svgCode: logo.svg,
        isFavorite: false,
      });
    }

    // Mark project as complete
    await completeProject(project.id);

    return NextResponse.json({
      projectId: project.id,
      brandAnalysis,
      logos: logos.map((logo) => ({
        conceptName: logo.name,
        logoType: logo.type,
        rationale: logo.rationale,
        svgCode: logo.svg,
      })),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze transcript", details: (error as Error).message },
      { status: 500 }
    );
  }
}
