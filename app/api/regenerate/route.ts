import { NextRequest, NextResponse } from "next/server";
import { generateLogo, generateAllLogos } from "@/lib/anthropic";
import {
  getProject,
  createLogoConcept,
  deleteLogoConceptsByType,
  getProjectWithLogos,
} from "@/lib/supabase";
import { LogoType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, logoType, regenerateAll } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing required field: projectId" },
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
        { error: "Project has no brand analysis" },
        { status: 400 }
      );
    }

    if (regenerateAll) {
      // Delete all existing logos and regenerate
      const logoTypes: LogoType[] = ["wordmark", "pictorial", "abstract"];
      for (const type of logoTypes) {
        await deleteLogoConceptsByType(projectId, type);
      }

      // Generate all logos
      const logos = await generateAllLogos(project.brandAnalysis);

      // Save new logos
      const savedLogos = [];
      for (const logo of logos) {
        const concept = await createLogoConcept(projectId, {
          conceptName: logo.name,
          logoType: logo.type,
          rationale: logo.rationale,
          svgCode: logo.svg,
          isFavorite: false,
        });
        savedLogos.push(concept);
      }

      return NextResponse.json({
        concepts: savedLogos.map((logo) => ({
          id: logo.id,
          conceptName: logo.conceptName,
          logoType: logo.logoType,
          rationale: logo.rationale,
          svgCode: logo.svgCode,
          isFavorite: logo.isFavorite,
        })),
      });
    } else {
      // Regenerate single logo type
      if (!logoType) {
        return NextResponse.json(
          { error: "Missing logoType for single regeneration" },
          { status: 400 }
        );
      }

      const validTypes: LogoType[] = ["wordmark", "pictorial", "abstract"];
      if (!validTypes.includes(logoType)) {
        return NextResponse.json(
          { error: "Invalid logoType" },
          { status: 400 }
        );
      }

      // Delete existing logo of this type
      await deleteLogoConceptsByType(projectId, logoType);

      // Generate new logo
      const logo = await generateLogo(logoType, project.brandAnalysis);

      // Save new logo
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
    }
  } catch (error) {
    console.error("Regeneration error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate logo", details: (error as Error).message },
      { status: 500 }
    );
  }
}
