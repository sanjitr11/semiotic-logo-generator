-- Semiotic Logo Generator Database Schema
-- Run this in your Supabase SQL Editor

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  transcript JSONB NOT NULL,
  brand_analysis JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'generating', 'complete', 'error'))
);

-- Logo concepts table
CREATE TABLE IF NOT EXISTS logo_concepts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  concept_name TEXT NOT NULL,
  logo_type TEXT NOT NULL CHECK (logo_type IN ('wordmark', 'pictorial', 'abstract')),
  rationale TEXT NOT NULL,
  svg_code TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logo_concepts_project_id ON logo_concepts(project_id);
CREATE INDEX IF NOT EXISTS idx_logo_concepts_logo_type ON logo_concepts(logo_type);

-- Row Level Security (open - no auth required per spec)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE logo_concepts ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no authentication required)
CREATE POLICY "Allow all access to projects" ON projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to logo_concepts" ON logo_concepts
  FOR ALL
  USING (true)
  WITH CHECK (true);
