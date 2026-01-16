-- Run this in your Supabase SQL Editor to create the missing videos table

CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    storage_key VARCHAR(255), -- Key in Cloudflare R2
    size INTEGER, -- in bytes
    duration INTEGER, -- in seconds
    mime_type VARCHAR(100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for auto-updating timestamp
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
