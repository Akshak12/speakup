-- Supabase Schema for SpeakUp — AI Communication Skills Trainer

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Public mirror for auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'guest',
  topic TEXT NOT NULL,
  transcript TEXT NOT NULL,
  relevance INT NOT NULL CHECK (relevance >= 1 AND relevance <= 10),
  depth INT NOT NULL CHECK (depth >= 1 AND depth <= 10),
  clarity INT NOT NULL CHECK (clarity >= 1 AND clarity <= 10),
  fluency INT NOT NULL CHECK (fluency >= 1 AND fluency <= 10),
  filler_count INT NOT NULL DEFAULT 0,
  wpm INT NOT NULL DEFAULT 0,
  audio_url TEXT DEFAULT '',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Allow read & insert access for authenticated users & anonymous guests
CREATE POLICY "Allow public read access to sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to sessions" ON public.sessions FOR INSERT WITH CHECK (true);
