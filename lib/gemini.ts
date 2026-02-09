import { GoogleGenerativeAI } from "@google/generative-ai";
import { BrandAnalysis, ClaudeLogoResponse, LogoType, Transcript } from "./types";
import { TRANSCRIPT_ANALYSIS_PROMPT, getLogoPrompt } from "./prompts";

// Lazy initialization for Gemini client
let _genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (_genAI) return _genAI;

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_AI_API_KEY environment variable");
  }

  _genAI = new GoogleGenerativeAI(apiKey);
  return _genAI;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTranscript(transcript: Transcript): string {
  return transcript
    .map((entry) => {
      const timestamp = entry.timestamp ? `[${entry.timestamp}] ` : "";
      return `${timestamp}${entry.speaker}: ${entry.text}`;
    })
    .join("\n");
}

function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");

  // Try to find JSON in the response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return cleaned;
}

export async function analyzeTranscript(transcript: Transcript): Promise<BrandAnalysis> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const formattedTranscript = formatTranscript(transcript);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(
        `${TRANSCRIPT_ANALYSIS_PROMPT}\n\nTRANSCRIPT:\n${formattedTranscript}`
      );

      const response = result.response;
      const text = response.text();

      const jsonStr = extractJSON(text);
      const analysis = JSON.parse(jsonStr) as BrandAnalysis;

      // Validate required fields
      if (!analysis.companyName || !analysis.industry || !analysis.brandPersonality) {
        throw new Error("Missing required fields in analysis");
      }

      return analysis;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY * (attempt + 1));
      }
    }
  }

  throw new Error(`Failed to analyze transcript after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

export async function generateLogo(
  logoType: LogoType,
  brandAnalysis: BrandAnalysis
): Promise<ClaudeLogoResponse> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = getLogoPrompt(logoType, brandAnalysis);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonStr = extractJSON(text);
      const logoResponse = JSON.parse(jsonStr) as ClaudeLogoResponse;

      // Validate required fields
      if (!logoResponse.name || !logoResponse.type || !logoResponse.svg || !logoResponse.rationale) {
        throw new Error("Missing required fields in logo response");
      }

      // Validate SVG
      if (!logoResponse.svg.includes("<svg") || !logoResponse.svg.includes("</svg>")) {
        throw new Error("Invalid SVG in response");
      }

      // Clean up SVG - ensure proper quotes
      logoResponse.svg = logoResponse.svg
        .replace(/'/g, '"')
        .replace(/\n\s*/g, " ")
        .trim();

      return logoResponse;
    } catch (error) {
      lastError = error as Error;
      console.error(`Logo generation attempt ${attempt + 1} failed:`, error);
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY * (attempt + 1));
      }
    }
  }

  throw new Error(`Failed to generate ${logoType} logo after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

export async function generateAllLogos(
  brandAnalysis: BrandAnalysis
): Promise<ClaudeLogoResponse[]> {
  const logoTypes: LogoType[] = ["wordmark", "pictorial", "abstract"];

  // Generate all logos in parallel
  const results = await Promise.allSettled(
    logoTypes.map((type) => generateLogo(type, brandAnalysis))
  );

  const logos: ClaudeLogoResponse[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      logos.push(result.value);
    } else {
      errors.push(`${logoTypes[index]}: ${result.reason}`);
    }
  });

  if (logos.length === 0) {
    throw new Error(`All logo generations failed: ${errors.join("; ")}`);
  }

  return logos;
}
