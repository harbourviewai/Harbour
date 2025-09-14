-- Harbourview AI Strategy Dashboard - Database Schema
-- Multi-tenant SaaS architecture for client-specific strategy reports

-- Enable Row Level Security
-- Note: JWT secret is managed by Supabase automatically

-- Create custom types
CREATE TYPE user_role AS ENUM ('executive', 'team_lead', 'viewer');

-- 1. CLIENTS TABLE - Stores client company information and branding
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    secondary_color VARCHAR(7) DEFAULT '#10B981', -- Hex color code
    industry VARCHAR(100),
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS TABLE - User accounts with role-based access
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'viewer',
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. REPORTS TABLE - Client-specific report data (JSON storage)
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    overview_json JSONB DEFAULT '{}',
    teams_json JSONB DEFAULT '{}',
    opportunities_json JSONB DEFAULT '{}',
    roadmap_json JSONB DEFAULT '{}',
    simulator_json JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FEEDBACK TABLE - User feedback and comments
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    page_section VARCHAR(100) NOT NULL, -- e.g., 'overview', 'teams', 'opportunities'
    comment TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_reports_client_id ON reports(client_id);
CREATE INDEX idx_feedback_client_id ON feedback(client_id);
CREATE INDEX idx_feedback_page_section ON feedback(page_section);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for CLIENTS table
CREATE POLICY "Users can view their own client data" ON clients
    FOR SELECT USING (
        id IN (
            SELECT client_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Executive users can update client data" ON clients
    FOR UPDATE USING (
        id IN (
            SELECT client_id FROM users 
            WHERE id = auth.uid() AND role = 'executive'
        )
    );

-- RLS Policies for USERS table
CREATE POLICY "Users can view users in their client" ON users
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Executive users can manage users in their client" ON users
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM users 
            WHERE id = auth.uid() AND role = 'executive'
        )
    );

-- RLS Policies for REPORTS table
CREATE POLICY "Users can view reports for their client" ON reports
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Executive users can update reports for their client" ON reports
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM users 
            WHERE id = auth.uid() AND role = 'executive'
        )
    );

-- RLS Policies for FEEDBACK table
CREATE POLICY "Users can view feedback for their client" ON feedback
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create feedback for their client" ON feedback
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT client_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own feedback" ON feedback
    FOR UPDATE USING (
        user_id = auth.uid() OR
        client_id IN (
            SELECT client_id FROM users 
            WHERE id = auth.uid() AND role = 'executive'
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional - remove in production)
INSERT INTO clients (company_name, industry, contact_email) VALUES 
('Sterling & Associates', 'Legal Services', 'contact@sterling.com'),
('TechCorp Solutions', 'Technology', 'admin@techcorp.com');

-- Insert sample users (these will need to be created through Supabase Auth)
-- Note: You'll need to create these users through the Supabase dashboard first
-- and then update the client_id references

-- Insert sample reports
INSERT INTO reports (client_id, overview_json, teams_json, opportunities_json) 
SELECT 
    c.id,
    '{
        "company_name": "Sterling & Associates",
        "vision_statement": "Leading the transformation of legal services through AI innovation",
        "key_metrics": {
            "total_insights": 7,
            "pain_points": 3,
            "opportunities": 4,
            "teams_analyzed": 4
        },
        "objectives": [
            {"title": "Increase Efficiency", "description": "Reduce manual processes by 40%"},
            {"title": "Improve Client Experience", "description": "Enhance transparency and communication"}
        ]
    }'::jsonb,
    '{
        "teams": [
            {"name": "Corporate Law", "pain_points": ["Manual document review"], "opportunities": ["AI document analysis"]},
            {"name": "Litigation", "pain_points": ["Time tracking inefficiencies"], "opportunities": ["Automated time tracking"]}
        ]
    }'::jsonb,
    '{
        "opportunities": [
            {"name": "AI Document Review", "impact": 9, "effort": 6, "priority": "high"},
            {"name": "Automated Time Tracking", "impact": 7, "effort": 4, "priority": "medium"}
        ]
    }'::jsonb
FROM clients c WHERE c.company_name = 'Sterling & Associates';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
