-- ==============================================
-- TaskPulse — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ==============================================

-- 1. Developers table
CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#e8754a',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL,
  ticket_number TEXT NOT NULL,
  full_ticket TEXT NOT NULL,
  description TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  assigned_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'selected',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ticket types table
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefix TEXT UNIQUE NOT NULL
);

-- 4. Seed default ticket types
INSERT INTO ticket_types (prefix) VALUES ('ZST'), ('WP'), ('NET'), ('MOB'), ('CMS');

-- 5. Enable Row Level Security with public access
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access" ON developers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON ticket_types FOR ALL USING (true) WITH CHECK (true);

-- 6. Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE developers;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_types;
