-- Add user_id column to athletes table to link with users table
ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Create policy/index if needed (optional for now, focusing on schema)
CREATE INDEX IF NOT EXISTS idx_athletes_user_id ON athletes(user_id);
