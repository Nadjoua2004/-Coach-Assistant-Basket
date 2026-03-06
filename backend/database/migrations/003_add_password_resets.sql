-- Create password_resets table
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- Index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);
