// Transcript types
export interface TranscriptEntry {
  text: string;
  speaker: string;
  timestamp?: string;
}

export type Transcript = TranscriptEntry[];

// Brand analysis types
export interface BrandAnalysis {
  companyName: string;
  industry: string;
  brandPersonality: string[];
  keyDifferentiators: string[];
  targetAudience: string;
  visualPreferences: string[];
  antiPreferences: string[];
  suggestedDirection: {
    type: "wordmark" | "pictorial" | "abstract";
    reasoning: string;
  };
}

// Logo concept types
export type LogoType = "wordmark" | "pictorial" | "abstract";

export interface LogoConcept {
  id?: string;
  projectId?: string;
  createdAt?: string;
  conceptName: string;
  logoType: LogoType;
  rationale: string;
  svgCode: string;
  isFavorite?: boolean;
}

// Project types
export type ProjectStatus = "pending" | "analyzing" | "generating" | "complete" | "error";

export interface Project {
  id: string;
  createdAt: string;
  transcript: Transcript;
  brandAnalysis: BrandAnalysis | null;
  status: ProjectStatus;
}

export interface ProjectWithLogos extends Project {
  logoConcepts: LogoConcept[];
}

// API response types
export interface AnalyzeResponse {
  projectId: string;
  brandAnalysis: BrandAnalysis;
}

export interface GenerateResponse {
  concept: LogoConcept;
}

export interface ApiError {
  error: string;
  details?: string;
}

// Claude API response format for logo generation
export interface ClaudeLogoResponse {
  name: string;
  type: LogoType;
  rationale: string;
  svg: string;
}
