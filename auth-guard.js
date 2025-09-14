// Authentication Guard - Protects pages from unauthorized access
class AuthGuard {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Add a small delay to ensure login page has time to save auth state
        setTimeout(() => {
            this.checkAuthStatus();
        }, 100);
    }

    checkAuthStatus() {
        const authState = localStorage.getItem('auth_state');
        console.log('Auth Guard: Checking auth status, current path:', window.location.pathname);
        console.log('Auth Guard: Auth state found:', !!authState);
        
        if (!authState) {
            // No authentication found, redirect to login
            console.log('Auth Guard: No auth state, redirecting to login');
            this.redirectToLogin();
            return false;
        }

        try {
            const user = JSON.parse(authState);
            this.currentUser = user;
            console.log('Auth Guard: User authenticated:', user.name, user.role);
            
            // Update UI with user info if elements exist
            this.updateUserUI();
            
            return true;
        } catch (error) {
            console.error('Error parsing auth state:', error);
            localStorage.removeItem('auth_state');
            this.redirectToLogin();
            return false;
        }
    }

    redirectToLogin() {
        // Don't redirect if already on login page
        if (window.location.pathname.includes('login.html')) {
            console.log('Auth Guard: Already on login page, not redirecting');
            return;
        }
        
        console.log('Auth Guard: Redirecting to login from:', window.location.pathname);
        
        // Store the current page to redirect back after login
        const currentPath = window.location.pathname;
        if (currentPath && currentPath !== '/' && currentPath !== '/index.html') {
            sessionStorage.setItem('redirect_after_login', currentPath);
        }
        
        window.location.href = 'login.html';
    }

    updateUserUI() {
        if (!this.currentUser) return;

        // Update user info in header if elements exist
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const userInfo = document.getElementById('userInfo');
        const loginBtn = document.getElementById('loginBtn');

        if (userName) userName.textContent = this.currentUser.name;
        if (userRole) {
            const roleText = this.currentUser.role.replace('_', ' ').toUpperCase();
            if (this.currentUser.role === 'admin') {
                userRole.innerHTML = `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">${roleText}</span>`;
            } else {
                userRole.textContent = roleText;
            }
        }
        if (userInfo) userInfo.classList.remove('hidden');
        if (loginBtn) loginBtn.classList.add('hidden');

        // Handle client selector based on user role
        this.updateClientSelector();
        
        // Handle navigation restrictions
        this.updateNavigation();
    }

    updateClientSelector() {
        const adminClientSelector = document.getElementById('adminClientSelector');
        const clientNameDisplay = document.getElementById('clientNameDisplay');

        if (this.canAccessAdmin()) {
            // Admin users can see client selector
            if (adminClientSelector) adminClientSelector.classList.remove('hidden');
            if (clientNameDisplay) clientNameDisplay.classList.add('hidden');
        } else {
            // Regular users see only their client name
            if (adminClientSelector) adminClientSelector.classList.add('hidden');
            if (clientNameDisplay) {
                clientNameDisplay.classList.remove('hidden');
                // Set client name based on user's client_id
                const clientName = this.getClientName(this.currentUser.client_id);
                clientNameDisplay.textContent = clientName;
            }
        }
    }

    getClientName(clientId) {
        // Map client IDs to display names
        const clientMap = {
            'demo': 'Sterling & Associates',
            'sterling-associates': 'Sterling & Associates',
            'acme-corp': 'Acme Corporation',
            'techstart-inc': 'TechStart Inc'
        };
        
        return clientMap[clientId] || 'Your Company';
    }

    updateNavigation() {
        // Hide admin link for non-admin users
        const adminLink = document.querySelector('a[href="admin.html"]');
        if (adminLink) {
            if (this.canAccessAdmin()) {
                adminLink.style.display = '';
            } else {
                adminLink.style.display = 'none';
            }
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('auth_state');
        sessionStorage.removeItem('redirect_after_login');
        
        // Show logout notification
        this.showNotification('You have been logged out successfully.', 'success');
        
        // Redirect to login after short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="w-5 h-5 mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Check if user has specific role
    hasRole(requiredRole) {
        if (!this.currentUser) return false;
        
        const roleHierarchy = {
            'viewer': 1,
            'team_lead': 2,
            'executive': 3,
            'admin': 4
        };
        
        const userLevel = roleHierarchy[this.currentUser.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        
        return userLevel >= requiredLevel;
    }

    // Check if user can access admin features
    canAccessAdmin() {
        return this.hasRole('admin');
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth guard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authGuard = new AuthGuard();
    
    // Add logout functionality if logout button exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.authGuard.logout();
        });
    }
});
