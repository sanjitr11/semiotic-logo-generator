"use client";

import React, { useState, useCallback } from "react";
import { Transcript } from "@/lib/types";

interface TranscriptInputProps {
  onSubmit: (transcript: Transcript) => void;
  isLoading?: boolean;
}

// Clean up common JSON issues
function cleanJsonString(text: string): string {
  return text
    .trim()
    // Replace smart quotes with straight quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Remove trailing commas before ] or }
    .replace(/,\s*([\]}])/g, "$1")
    // Normalize whitespace but preserve content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

// Format JSON nicely
function formatJson(text: string): string | null {
  try {
    const cleaned = cleanJsonString(text);
    const parsed = JSON.parse(cleaned);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return null;
  }
}

export function TranscriptInput({ onSubmit, isLoading = false }: TranscriptInputProps) {
  const [textValue, setTextValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const parseTranscript = useCallback((text: string): Transcript | null => {
    try {
      const cleaned = cleanJsonString(text);
      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) {
        setError("Transcript must be an array of entries");
        return null;
      }

      for (let i = 0; i < parsed.length; i++) {
        const entry = parsed[i];
        if (!entry.text || !entry.speaker) {
          setError(`Entry ${i + 1} is missing required fields (text, speaker)`);
          return null;
        }
      }

      setError(null);
      return parsed as Transcript;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      // Provide more helpful error messages
      if (msg.includes("Unexpected token")) {
        setError("Invalid JSON: Check for missing quotes or commas");
      } else if (msg.includes("Unexpected end")) {
        setError("Invalid JSON: Missing closing bracket or brace");
      } else {
        setError("Invalid JSON format. Click 'Format' to try auto-fix.");
      }
      return null;
    }
  }, []);

  const handleFormat = useCallback(() => {
    const formatted = formatJson(textValue);
    if (formatted) {
      setTextValue(formatted);
      setError(null);
    } else {
      setError("Could not auto-format. Please check your JSON syntax.");
    }
  }, [textValue]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const transcript = parseTranscript(textValue);
      if (transcript) {
        onSubmit(transcript);
      }
    },
    [textValue, parseTranscript, onSubmit]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const formatted = formatJson(content);
          setTextValue(formatted || content);
          if (formatted) setError(null);
        };
        reader.readAsText(file);
      }
    },
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const formatted = formatJson(content);
          setTextValue(formatted || content);
          if (formatted) setError(null);
        };
        reader.readAsText(file);
      }
    },
    []
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? "border-[#E8E4DE] bg-[#1F1F1F]"
            : "border-[#1F1F1F] hover:border-[#6B6B6B]"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <textarea
          value={textValue}
          onChange={(e) => {
            setTextValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder={`Paste your transcript JSON here...

Example:
[
  { "speaker": "Designer", "text": "Tell me about your company." },
  { "speaker": "Client", "text": "We build AI-powered tools..." }
]`}
          className="w-full h-64 bg-[#0A0A0A] text-[#E8E4DE] font-mono text-sm p-4 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#6B6B6B] placeholder:text-[#6B6B6B]"
          disabled={isLoading}
        />

        {isDragging && (
          <div className="absolute inset-0 bg-[#141414]/90 flex items-center justify-center rounded-lg">
            <p className="text-[#E8E4DE]">Drop your file here</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="cursor-pointer text-[#6B6B6B] hover:text-[#E8E4DE] text-sm transition-colors">
            <input
              type="file"
              accept=".json,.txt"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            Upload file
          </label>
          <button
            type="button"
            onClick={handleFormat}
            disabled={isLoading || !textValue.trim()}
            className="text-[#6B6B6B] hover:text-[#E8E4DE] text-sm transition-colors disabled:opacity-50"
          >
            Format JSON
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || !textValue.trim()}
          className="px-8 py-3 bg-[#E8E4DE] text-[#0A0A0A] font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Logos"
          )}
        </button>
      </div>
    </form>
  );
}
