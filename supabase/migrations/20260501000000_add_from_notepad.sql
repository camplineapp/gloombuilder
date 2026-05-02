-- Add from_notepad flag to beatdowns for the Notepad creation surface (Cluster C / Item 12).
-- Backfills all existing rows to false; only freshly-saved Notepad beatdowns flip this true.

ALTER TABLE beatdowns
ADD COLUMN IF NOT EXISTS from_notepad boolean NOT NULL DEFAULT false;
