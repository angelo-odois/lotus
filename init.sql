-- Lotus Proposta System Database Initialization
-- This file runs automatically when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS lotus;

-- Set default permissions
GRANT ALL PRIVILEGES ON SCHEMA lotus TO lotus;

-- Log initialization
INSERT INTO pg_stat_activity (query) VALUES ('Lotus Database initialized') ON CONFLICT DO NOTHING;
