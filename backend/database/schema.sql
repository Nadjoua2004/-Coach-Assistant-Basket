-- Coach Assistant Basket - Database Schema for Supabase (PostgreSQL)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('coach', 'adjoint', 'admin', 'joueur', 'parent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Athletes table
CREATE TABLE IF NOT EXISTS athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    sexe VARCHAR(1) NOT NULL CHECK (sexe IN ('M', 'F')),
    date_naissance DATE NOT NULL,
    taille INTEGER, -- in cm
    poids DECIMAL(5,2), -- in kg
    poste INTEGER CHECK (poste BETWEEN 1 AND 5),
    photo_url TEXT,
    numero_licence VARCHAR(100),
    contact_parent VARCHAR(255),
    groupe VARCHAR(100),
    blesse BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    allergies TEXT,
    blessures_cours TEXT,
    antecedents TEXT,
    certificat_date DATE,
    certificat_pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- shoot, dribble, defense, system, physical, mental
    subcategory VARCHAR(100),
    duration INTEGER, -- in minutes
    players_min INTEGER DEFAULT 1,
    players_max INTEGER DEFAULT 12,
    equipment TEXT,
    video_url TEXT, -- This will now store the URL from the video library or external source
    video_id UUID, -- Optional: reference to the video in the videos table
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Library table (Admin managed)
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

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    total_duration INTEGER NOT NULL, -- in minutes
    warmup TEXT,
    main_content TEXT,
    cooldown TEXT,
    exercises JSONB, -- Array of exercise IDs with order
    status VARCHAR(50) DEFAULT 'planifiée' CHECK (status IN ('planifiée', 'en_cours', 'terminée', 'annulée')),
    date DATE,
    heure TIME,
    lieu VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planning table (weekly schedule)
CREATE TABLE IF NOT EXISTS planning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    heure TIME NOT NULL,
    duree INTEGER NOT NULL, -- in minutes
    lieu VARCHAR(255) NOT NULL,
    theme VARCHAR(255) NOT NULL,
    session_id UUID REFERENCES sessions(id),
    published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planning athletes (many-to-many)
CREATE TABLE IF NOT EXISTS planning_athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planning_id UUID REFERENCES planning(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(planning_id, athlete_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    athlete_id UUID REFERENCES athletes(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'retard', 'excuse')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_athletes_groupe ON athletes(groupe);
CREATE INDEX IF NOT EXISTS idx_athletes_sexe ON athletes(sexe);
CREATE INDEX IF NOT EXISTS idx_athletes_poste ON athletes(poste);
CREATE INDEX IF NOT EXISTS idx_athletes_blesse ON athletes(blesse);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_planning_date ON planning(date);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_athlete ON attendance(athlete_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athletes_updated_at BEFORE UPDATE ON athletes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planning_updated_at BEFORE UPDATE ON planning
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

