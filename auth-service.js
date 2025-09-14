// Authentication Service for Harbourview AI Strategy Dashboard
// Handles user authentication, session management, and role-based access

import { supabase, USER_ROLES } from './supabase-config.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.currentClient = null;
        this.init();
    }

    async init() {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await this.loadUserProfile(session.user);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await this.loadUserProfile(session.user);
                this.onSignIn();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.currentClient = null;
                this.onSignOut();
            }
        });
    }

    async loadUserProfile(user) {
        try {
            // Get user profile from our users table
            const { data: userProfile, error } = await supabase
                .from('users')
                .select(`
                    *,
                    clients (
                        id,
                        company_name,
                        logo_url,
                        primary_color,
                        secondary_color,
                        industry
                    )
                `)
                .eq('email', user.email)
                .single();

            if (error) {
                console.error('Error loading user profile:', error);
                return;
            }

            this.currentUser = userProfile;
            this.currentClient = userProfile.clients;

            // Apply client branding
            this.applyClientBranding();

        } catch (error) {
            console.error('Error in loadUserProfile:', error);
        }
    }

    applyClientBranding() {
        if (!this.currentClient) return;

        // Update page title
        document.title = `${this.currentClient.company_name} - AI Strategy Dashboard`;

        // Apply primary color
        if (this.currentClient.primary_color) {
            document.documentElement.style.setProperty('--primary-color', this.currentClient.primary_color);
        }

        // Apply secondary color
        if (this.currentClient.secondary_color) {
            document.documentElement.style.setProperty('--secondary-color', this.currentClient.secondary_color);
        }

        // Update company logo if available
        const logoElement = document.querySelector('.company-logo');
        if (logoElement && this.currentClient.logo_url) {
            logoElement.src = this.currentClient.logo_url;
            logoElement.alt = `${this.currentClient.company_name} Logo`;
        }

        // Update company name throughout the page
        const companyNameElements = document.querySelectorAll('.company-name');
        companyNameElements.forEach(element => {
            element.textContent = this.currentClient.company_name;
        });
    }

    // Authentication methods
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async signUp(email, password, fullName, clientId, role = USER_ROLES.VIEWER) {
        // First create the auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) {
            throw new Error(authError.message);
        }

        // Then create the user profile in our users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                email,
                full_name: fullName,
                client_id: clientId,
                role: role
            })
            .select()
            .single();

        if (userError) {
            throw new Error(userError.message);
        }

        return { authData, userData };
    }

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
    }

    async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            throw new Error(error.message);
        }
    }

    // User management methods (for executives)
    async inviteUser(email, fullName, role = USER_ROLES.VIEWER) {
        if (!this.hasRole(USER_ROLES.EXECUTIVE)) {
            throw new Error('Insufficient permissions');
        }

        // Generate a temporary password (in production, use a proper invitation system)
        const tempPassword = this.generateTempPassword();

        return await this.signUp(email, tempPassword, fullName, this.currentClient.id, role);
    }

    async updateUserRole(userId, newRole) {
        if (!this.hasRole(USER_ROLES.EXECUTIVE)) {
            throw new Error('Insufficient permissions');
        }

        const { data, error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId)
            .eq('client_id', this.currentClient.id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async getUsers() {
        if (!this.hasRole(USER_ROLES.EXECUTIVE)) {
            throw new Error('Insufficient permissions');
        }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('client_id', this.currentClient.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    // Permission checking
    hasRole(requiredRole) {
        if (!this.currentUser) return false;

        const roleHierarchy = {
            [USER_ROLES.VIEWER]: 1,
            [USER_ROLES.TEAM_LEAD]: 2,
            [USER_ROLES.EXECUTIVE]: 3
        };

        return roleHierarchy[this.currentUser.role] >= roleHierarchy[requiredRole];
    }

    canAccessPage(pageName) {
        if (!this.currentUser) return false;

        // Define page access rules
        const pageAccess = {
            'overview': [USER_ROLES.VIEWER, USER_ROLES.TEAM_LEAD, USER_ROLES.EXECUTIVE],
            'teams': [USER_ROLES.VIEWER, USER_ROLES.TEAM_LEAD, USER_ROLES.EXECUTIVE],
            'opportunities': [USER_ROLES.VIEWER, USER_ROLES.TEAM_LEAD, USER_ROLES.EXECUTIVE],
            'simulator': [USER_ROLES.VIEWER, USER_ROLES.TEAM_LEAD, USER_ROLES.EXECUTIVE],
            'roadmap': [USER_ROLES.VIEWER, USER_ROLES.TEAM_LEAD, USER_ROLES.EXECUTIVE],
            'admin': [USER_ROLES.EXECUTIVE]
        };

        return pageAccess[pageName]?.includes(this.currentUser.role) || false;
    }

    // Utility methods
    generateTempPassword() {
        return Math.random().toString(36).slice(-8) + 'Temp!';
    }

    onSignIn() {
        // Custom event for when user signs in
        window.dispatchEvent(new CustomEvent('auth:signin', {
            detail: { user: this.currentUser, client: this.currentClient }
        }));
    }

    onSignOut() {
        // Custom event for when user signs out
        window.dispatchEvent(new CustomEvent('auth:signout'));
    }

    // Getters
    get isAuthenticated() {
        return !!this.currentUser;
    }

    get user() {
        return this.currentUser;
    }

    get client() {
        return this.currentClient;
    }
}

// Create global instance
const authService = new AuthService();

// Export for use in other modules
export default authService;
