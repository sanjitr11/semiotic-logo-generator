import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Project, ProjectWithLogos, LogoConcept, Transcript, BrandAnalysis, ProjectStatus } from "./types";

// Lazy initialization for Supabase clients
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  // Use service role key if available, otherwise fall back to anon key
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) {
    throw new Error("Missing Supabase API key");
  }

  _supabaseAdmin = createClient(supabaseUrl, key);
  return _supabaseAdmin;
}

// Export getter functions for lazy access
export const supabase = { get: getSupabaseClient };
export const supabaseAdmin = { get: getSupabaseAdmin };

// Project operations
export async function createProject(transcript: Transcript): Promise<Project> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("projects")
    .insert({
      transcript,
      status: "pending" as ProjectStatus,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create project: ${error.message}`);

  return {
    id: data.id,
    createdAt: data.created_at,
    transcript: data.transcript,
    brandAnalysis: data.brand_analysis,
    status: data.status,
  };
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<void> {
  const client = getSupabaseAdmin();
  const { error } = await client
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) throw new Error(`Failed to update project status: ${error.message}`);
}

export async function updateProjectAnalysis(
  projectId: string,
  brandAnalysis: BrandAnalysis
): Promise<void> {
  const client = getSupabaseAdmin();
  const { error } = await client
    .from("projects")
    .update({
      brand_analysis: brandAnalysis,
      status: "generating" as ProjectStatus,
    })
    .eq("id", projectId);

  if (error) throw new Error(`Failed to update project analysis: ${error.message}`);
}

export async function completeProject(projectId: string): Promise<void> {
  const client = getSupabaseAdmin();
  const { error } = await client
    .from("projects")
    .update({ status: "complete" as ProjectStatus })
    .eq("id", projectId);

  if (error) throw new Error(`Failed to complete project: ${error.message}`);
}

export async function getProject(projectId: string): Promise<Project | null> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to get project: ${error.message}`);
  }

  return {
    id: data.id,
    createdAt: data.created_at,
    transcript: data.transcript,
    brandAnalysis: data.brand_analysis,
    status: data.status,
  };
}

export async function getProjectWithLogos(projectId: string): Promise<ProjectWithLogos | null> {
  const client = getSupabaseAdmin();
  const { data: project, error: projectError } = await client
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError) {
    if (projectError.code === "PGRST116") return null;
    throw new Error(`Failed to get project: ${projectError.message}`);
  }

  const { data: logos, error: logosError } = await client
    .from("logo_concepts")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (logosError) throw new Error(`Failed to get logos: ${logosError.message}`);

  return {
    id: project.id,
    createdAt: project.created_at,
    transcript: project.transcript,
    brandAnalysis: project.brand_analysis,
    status: project.status,
    logoConcepts: (logos || []).map((logo) => ({
      id: logo.id,
      projectId: logo.project_id,
      createdAt: logo.created_at,
      conceptName: logo.concept_name,
      logoType: logo.logo_type,
      rationale: logo.rationale,
      svgCode: logo.svg_code,
      isFavorite: logo.is_favorite,
    })),
  };
}

export async function getRecentProjects(limit = 10): Promise<ProjectWithLogos[]> {
  const client = getSupabaseAdmin();
  const { data: projects, error: projectsError } = await client
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (projectsError) throw new Error(`Failed to get projects: ${projectsError.message}`);

  const projectsWithLogos: ProjectWithLogos[] = [];

  for (const project of projects || []) {
    const { data: logos } = await client
      .from("logo_concepts")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    projectsWithLogos.push({
      id: project.id,
      createdAt: project.created_at,
      transcript: project.transcript,
      brandAnalysis: project.brand_analysis,
      status: project.status,
      logoConcepts: (logos || []).map((logo) => ({
        id: logo.id,
        projectId: logo.project_id,
        createdAt: logo.created_at,
        conceptName: logo.concept_name,
        logoType: logo.logo_type,
        rationale: logo.rationale,
        svgCode: logo.svg_code,
        isFavorite: logo.is_favorite,
      })),
    });
  }

  return projectsWithLogos;
}

// Logo concept operations
export async function createLogoConcept(
  projectId: string,
  concept: Omit<LogoConcept, "id" | "projectId" | "createdAt">
): Promise<LogoConcept> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("logo_concepts")
    .insert({
      project_id: projectId,
      concept_name: concept.conceptName,
      logo_type: concept.logoType,
      rationale: concept.rationale,
      svg_code: concept.svgCode,
      is_favorite: concept.isFavorite || false,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create logo concept: ${error.message}`);

  return {
    id: data.id,
    projectId: data.project_id,
    createdAt: data.created_at,
    conceptName: data.concept_name,
    logoType: data.logo_type,
    rationale: data.rationale,
    svgCode: data.svg_code,
    isFavorite: data.is_favorite,
  };
}

export async function updateLogoConceptFavorite(
  conceptId: string,
  isFavorite: boolean
): Promise<void> {
  const client = getSupabaseAdmin();
  const { error } = await client
    .from("logo_concepts")
    .update({ is_favorite: isFavorite })
    .eq("id", conceptId);

  if (error) throw new Error(`Failed to update favorite: ${error.message}`);
}

export async function deleteLogoConcept(conceptId: string): Promise<void> {
  const client = getSupabaseAdmin();
  const { error } = await client
    .from("logo_concepts")
    .delete()
    .eq("id", conceptId);

  if (error) throw new Error(`Failed to delete logo concept: ${error.message}`);
}

export async function deleteLogoConceptsByType(
  projectId: string,
  logoType: string
): Promise<void> {
  const client = getSupabaseAdmin();
  const { error } = await client
    .from("logo_concepts")
    .delete()
    .eq("project_id", projectId)
    .eq("logo_type", logoType);

  if (error) throw new Error(`Failed to delete logo concepts: ${error.message}`);
}
