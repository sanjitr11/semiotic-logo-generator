import Anthropic from "@anthropic-ai/sdk";
import { BrandAnalysis, ClaudeLogoResponse, LogoType, Transcript } from "./types";
import { TRANSCRIPT_ANALYSIS_PROMPT, LOGO_GENERATION_SYSTEM_PROMPT, getLogoPrompt } from "./prompts";

// Lazy initialization for Anthropic client
let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (_anthropic) return _anthropic;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  }

  _anthropic = new Anthropic({ apiKey });
  return _anthropic;
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
  const anthropic = getAnthropicClient();
  const formattedTranscript = formatTranscript(transcript);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `${TRANSCRIPT_ANALYSIS_PROMPT}\n\nTRANSCRIPT:\n${formattedTranscript}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonStr = extractJSON(content.text);
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
  brandAnalysis: BrandAnalysis,
  variant: number = 1
): Promise<ClaudeLogoResponse> {
  const anthropic = getAnthropicClient();
  const prompt = getLogoPrompt(logoType, brandAnalysis, variant);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 8192,
        system: LOGO_GENERATION_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonStr = extractJSON(content.text);
      const logoResponse = JSON.parse(jsonStr) as ClaudeLogoResponse;

      // Validate required fields
      if (!logoResponse.name || !logoResponse.type || !logoResponse.svg || !logoResponse.rationale) {
        throw new Error("Missing required fields in logo response");
      }

      // Validate SVG
      if (!logoResponse.svg.includes("<svg") || !logoResponse.svg.includes("</svg>")) {
        throw new Error("Invalid SVG in response");
      }

      // Clean up SVG - ensure proper quotes (only in attributes, not text content)
      logoResponse.svg = logoResponse.svg
        .replace(/<([^>]*)'/g, (match) => match.replace(/'/g, '"'))
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
