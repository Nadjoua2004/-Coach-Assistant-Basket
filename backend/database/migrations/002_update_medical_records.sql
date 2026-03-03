-- Update medical_records table with missing columns
ALTER TABLE medical_records 
ADD COLUMN IF NOT EXISTS groupe_sanguin TEXT,
ADD COLUMN IF NOT EXISTS traitements_en_cours TEXT,
ADD COLUMN IF NOT EXISTS aptitude_sportive BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notes_coach TEXT;

-- Refresh updated_at trigger if needed (usually stays on the table)
-- But ensuring columns exist is the priority for the current API error.
