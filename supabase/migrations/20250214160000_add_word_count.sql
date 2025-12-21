/*
  # Add Word Count Column
  Adds a word_count column to the documents table to track processing volume efficiently.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Table: documents
  - Column: word_count (INTEGER, DEFAULT 0)
*/

ALTER TABLE documents ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
