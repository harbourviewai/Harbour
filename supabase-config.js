// Supabase Configuration for Harbourview AI Strategy Dashboard
// This file contains the Supabase client configuration and API endpoints

// Supabase project configuration
const SUPABASE_CONFIG = {
    // Your actual Supabase project details
    url: 'https://npnygrxfrcfkpsnezllq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbnlncnhmcmNma3BzbmV6bGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzA1MzgsImV4cCI6MjA3MzMwNjUzOH0.qtpswhAHJjuIHEUhrcAlw3UY2yZpos_kCV6TQpRSziE',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbnlncnhmcmNma3BzbmV6bGxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzczMDUzOCwiZXhwIjoyMDczMzA2NTM4fQ.llkIXCQZ2LJdJMN3ibRGoGqR7R9Vv_i0C62-ySADC_Q'
};

// Initialize Supabase client
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Database table names (for consistency)
const TABLES = {
    CLIENTS: 'clients',
    USERS: 'users', 
    REPORTS: 'reports',
    FEEDBACK: 'feedback'
};

// User roles
const USER_ROLES = {
    EXECUTIVE: 'executive',
    TEAM_LEAD: 'team_lead', 
    VIEWER: 'viewer'
};

// Export for use in other modules
export { supabase, TABLES, USER_ROLES, SUPABASE_CONFIG };
