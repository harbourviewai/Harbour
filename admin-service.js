// Admin Service for Harbourview AI Strategy Dashboard
// Handles user management, branding, and admin functionality

import { supabase, TABLES } from './supabase-config.js';

class AdminService {
    constructor() {
        this.currentClient = null;
        this.users = [];
        this.init();
    }

    async init() {
        // Get current client from auth service or localStorage
        const clientData = localStorage.getItem('currentClient');
        if (clientData) {
            this.currentClient = JSON.parse(clientData);
        }
        
        // Load users for current client
        await this.loadUsers();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Invite user modal
        document.getElementById('inviteUserBtn')?.addEventListener('click', () => {
            this.showInviteModal();
        });

        document.getElementById('closeInviteModal')?.addEventListener('click', () => {
            this.hideInviteModal();
        });

        document.getElementById('cancelInvite')?.addEventListener('click', () => {
            this.hideInviteModal();
        });

        // Invite user form
        document.getElementById('inviteUserForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.inviteUser();
        });

        // Close modal when clicking outside
        document.getElementById('inviteUserModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'inviteUserModal') {
                this.hideInviteModal();
            }
        });

        // Data management event listeners
        document.getElementById('exportDataBtn')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn')?.addEventListener('click', () => {
            this.showImportModal();
        });

        document.getElementById('loadSyntheticDataBtn')?.addEventListener('click', () => {
            this.loadSyntheticData();
        });

        // Data tabs
        document.querySelectorAll('.data-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchDataTab(e.target.dataset.tab);
            });
        });

        // Transcript upload
        this.setupTranscriptUpload();

        // Quick actions
        document.getElementById('exportPDFBtn')?.addEventListener('click', () => {
            this.exportPDFReport();
        });

        document.getElementById('generateLinkBtn')?.addEventListener('click', () => {
            this.generateShareableLink();
        });

        document.getElementById('refreshDataBtn')?.addEventListener('click', () => {
            this.refreshData();
        });

        // Feedback form
        document.getElementById('feedbackForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });
    }

    async loadUsers() {
        try {
            if (!this.currentClient) {
                console.log('No current client - using demo data');
                this.renderDemoUsers();
                return;
            }

            const { data: users, error } = await supabase
                .from(TABLES.USERS)
                .select('*')
                .eq('client_id', this.currentClient.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading users:', error);
                this.renderDemoUsers();
                return;
            }

            this.users = users || [];
            this.renderUsers();
        } catch (error) {
            console.error('Error in loadUsers:', error);
            this.renderDemoUsers();
        }
    }

    renderDemoUsers() {
        // Demo users for testing
        this.users = [
            {
                id: 'demo-1',
                email: 'john.smith@sterling.com',
                full_name: 'John Smith',
                role: 'executive',
                last_login: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            },
            {
                id: 'demo-2',
                email: 'sarah.johnson@sterling.com',
                full_name: 'Sarah Johnson',
                role: 'team_lead',
                last_login: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
                id: 'demo-3',
                email: 'mike.wilson@sterling.com',
                full_name: 'Mike Wilson',
                role: 'viewer',
                last_login: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            }
        ];
        this.renderUsers();
    }

    renderUsers() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        if (this.users.length === 0) {
            usersList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i data-lucide="users" class="w-8 h-8 mx-auto mb-2 text-gray-300"></i>
                    <p>No users found</p>
                    <p class="text-sm">Invite users to get started</p>
                </div>
            `;
            return;
        }

        usersList.innerHTML = this.users.map(user => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-medium text-sm">
                            ${user.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${user.full_name}</div>
                        <div class="text-sm text-gray-600">${user.email}</div>
                        <div class="flex items-center space-x-2 mt-1">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getRoleBadgeClass(user.role)}">
                                ${this.getRoleDisplayName(user.role)}
                            </span>
                            <span class="text-xs text-gray-500">
                                Last active: ${this.formatLastLogin(user.last_login)}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <select class="text-sm border border-gray-300 rounded px-2 py-1" 
                            data-user-id="${user.id}" 
                            onchange="adminService.updateUserRole('${user.id}', this.value)">
                        <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>Viewer</option>
                        <option value="team_lead" ${user.role === 'team_lead' ? 'selected' : ''}>Team Lead</option>
                        <option value="executive" ${user.role === 'executive' ? 'selected' : ''}>Executive</option>
                    </select>
                    <button onclick="adminService.removeUser('${user.id}')" 
                            class="text-red-500 hover:text-red-700 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    getRoleBadgeClass(role) {
        const classes = {
            executive: 'bg-purple-100 text-purple-800',
            team_lead: 'bg-blue-100 text-blue-800',
            viewer: 'bg-gray-100 text-gray-800'
        };
        return classes[role] || classes.viewer;
    }

    getRoleDisplayName(role) {
        const names = {
            executive: 'Executive',
            team_lead: 'Team Lead',
            viewer: 'Viewer'
        };
        return names[role] || 'Viewer';
    }

    formatLastLogin(lastLogin) {
        if (!lastLogin) return 'Never';
        
        const date = new Date(lastLogin);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    showInviteModal() {
        const modal = document.getElementById('inviteUserModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideInviteModal() {
        const modal = document.getElementById('inviteUserModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            this.resetInviteForm();
        }
    }

    resetInviteForm() {
        document.getElementById('inviteUserForm').reset();
    }

    async inviteUser() {
        const email = document.getElementById('userEmail').value;
        const fullName = document.getElementById('userFullName').value;
        const role = document.getElementById('userRole').value;

        try {
            // Show loading state
            const submitBtn = document.querySelector('#inviteUserForm button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            if (!this.currentClient) {
                // Demo mode - simulate invitation
                await this.simulateInvitation(email, fullName, role);
            } else {
                // Real mode - create user in database
                await this.createUser(email, fullName, role);
            }

            // Success feedback
            this.showNotification('Invitation sent successfully!', 'success');
            this.hideInviteModal();
            await this.loadUsers(); // Refresh users list

        } catch (error) {
            console.error('Error inviting user:', error);
            this.showNotification('Failed to send invitation. Please try again.', 'error');
        } finally {
            // Reset button state
            const submitBtn = document.querySelector('#inviteUserForm button[type="submit"]');
            submitBtn.textContent = 'Send Invitation';
            submitBtn.disabled = false;
        }
    }

    async simulateInvitation(email, fullName, role) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Add to demo users
        const newUser = {
            id: `demo-${Date.now()}`,
            email: email,
            full_name: fullName,
            role: role,
            last_login: null,
            created_at: new Date()
        };
        
        this.users.unshift(newUser);
        this.renderUsers();
    }

    async createUser(email, fullName, role) {
        const { data, error } = await supabase
            .from(TABLES.USERS)
            .insert({
                email: email,
                full_name: fullName,
                role: role,
                client_id: this.currentClient.id,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async updateUserRole(userId, newRole) {
        try {
            if (!this.currentClient) {
                // Demo mode
                const user = this.users.find(u => u.id === userId);
                if (user) {
                    user.role = newRole;
                    this.renderUsers();
                    this.showNotification(`Role updated to ${this.getRoleDisplayName(newRole)}`, 'success');
                }
                return;
            }

            // Real mode - update in database
            const { error } = await supabase
                .from(TABLES.USERS)
                .update({ role: newRole })
                .eq('id', userId)
                .eq('client_id', this.currentClient.id);

            if (error) {
                throw new Error(error.message);
            }

            this.showNotification(`Role updated to ${this.getRoleDisplayName(newRole)}`, 'success');
            await this.loadUsers(); // Refresh users list

        } catch (error) {
            console.error('Error updating user role:', error);
            this.showNotification('Failed to update role. Please try again.', 'error');
        }
    }

    async removeUser(userId) {
        if (!confirm('Are you sure you want to remove this user?')) {
            return;
        }

        try {
            if (!this.currentClient) {
                // Demo mode
                this.users = this.users.filter(u => u.id !== userId);
                this.renderUsers();
                this.showNotification('User removed successfully', 'success');
                return;
            }

            // Real mode - deactivate user in database
            const { error } = await supabase
                .from(TABLES.USERS)
                .update({ is_active: false })
                .eq('id', userId)
                .eq('client_id', this.currentClient.id);

            if (error) {
                throw new Error(error.message);
            }

            this.showNotification('User removed successfully', 'success');
            await this.loadUsers(); // Refresh users list

        } catch (error) {
            console.error('Error removing user:', error);
            this.showNotification('Failed to remove user. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const bgColor = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500'
        }[type] || 'bg-blue-500';

        notification.className += ` ${bgColor} text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Branding Management Methods
    async loadBranding() {
        try {
            if (!this.currentClient) {
                // Demo mode - load demo branding
                this.loadDemoBranding();
                return;
            }

            const { data: client, error } = await supabase
                .from(TABLES.CLIENTS)
                .select('*')
                .eq('id', this.currentClient.id)
                .single();

            if (error) {
                console.error('Error loading branding:', error);
                this.loadDemoBranding();
                return;
            }

            this.applyBrandingToForm(client);
        } catch (error) {
            console.error('Error in loadBranding:', error);
            this.loadDemoBranding();
        }
    }

    loadDemoBranding() {
        // Demo branding data
        const demoBranding = {
            company_name: 'Sterling & Associates',
            primary_color: '#3B82F6',
            secondary_color: '#10B981',
            logo_url: null
        };
        
        this.applyBrandingToForm(demoBranding);
    }

    applyBrandingToForm(branding) {
        // Update form fields
        const companyNameInput = document.getElementById('companyName');
        const primaryColorInput = document.getElementById('primaryColor');
        const secondaryColorInput = document.getElementById('secondaryColor');
        const primaryColorPreview = document.getElementById('primaryColorPreview');
        const secondaryColorPreview = document.getElementById('secondaryColorPreview');
        const primaryColorText = document.getElementById('primaryColorText');
        const secondaryColorText = document.getElementById('secondaryColorText');

        if (companyNameInput) companyNameInput.value = branding.company_name || '';
        if (primaryColorInput) primaryColorInput.value = branding.primary_color || '#3B82F6';
        if (secondaryColorInput) secondaryColorInput.value = branding.secondary_color || '#10B981';

        // Update previews
        if (primaryColorPreview) {
            primaryColorPreview.style.backgroundColor = branding.primary_color || '#3B82F6';
        }
        if (secondaryColorPreview) {
            secondaryColorPreview.style.backgroundColor = branding.secondary_color || '#10B981';
        }
        if (primaryColorText) {
            primaryColorText.textContent = branding.primary_color || '#3B82F6';
        }
        if (secondaryColorText) {
            secondaryColorText.textContent = branding.secondary_color || '#10B981';
        }

        // Update logo preview
        if (branding.logo_url) {
            this.updateLogoPreview(branding.logo_url);
        }
    }

    updateBranding() {
        // Update color previews in real-time
        const primaryColor = document.getElementById('primaryColor')?.value;
        const secondaryColor = document.getElementById('secondaryColor')?.value;
        
        if (primaryColor) {
            const primaryColorPreview = document.getElementById('primaryColorPreview');
            const primaryColorText = document.getElementById('primaryColorText');
            if (primaryColorPreview) primaryColorPreview.style.backgroundColor = primaryColor;
            if (primaryColorText) primaryColorText.textContent = primaryColor;
        }
        
        if (secondaryColor) {
            const secondaryColorPreview = document.getElementById('secondaryColorPreview');
            const secondaryColorText = document.getElementById('secondaryColorText');
            if (secondaryColorPreview) secondaryColorPreview.style.backgroundColor = secondaryColor;
            if (secondaryColorText) secondaryColorText.textContent = secondaryColor;
        }

        // Apply branding to current page
        this.applyBrandingToPage();
    }

    applyBrandingToPage() {
        const primaryColor = document.getElementById('primaryColor')?.value;
        const secondaryColor = document.getElementById('secondaryColor')?.value;
        const companyName = document.getElementById('companyName')?.value;

        // Apply CSS custom properties
        if (primaryColor) {
            document.documentElement.style.setProperty('--primary-color', primaryColor);
        }
        if (secondaryColor) {
            document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        }

        // Update page title
        if (companyName) {
            document.title = `${companyName} - AI Strategy Dashboard`;
        }

        // Update company name in header
        const companyNameElements = document.querySelectorAll('.company-name');
        companyNameElements.forEach(element => {
            element.textContent = companyName;
        });
    }

    async saveBranding() {
        try {
            const companyName = document.getElementById('companyName')?.value;
            const primaryColor = document.getElementById('primaryColor')?.value;
            const secondaryColor = document.getElementById('secondaryColor')?.value;

            if (!this.currentClient) {
                // Demo mode - just apply to page
                this.applyBrandingToPage();
                this.showNotification('Branding updated (demo mode)', 'success');
                return;
            }

            // Real mode - save to database
            const { error } = await supabase
                .from(TABLES.CLIENTS)
                .update({
                    company_name: companyName,
                    primary_color: primaryColor,
                    secondary_color: secondaryColor
                })
                .eq('id', this.currentClient.id);

            if (error) {
                throw new Error(error.message);
            }

            this.applyBrandingToPage();
            this.showNotification('Branding saved successfully', 'success');

        } catch (error) {
            console.error('Error saving branding:', error);
            this.showNotification('Failed to save branding. Please try again.', 'error');
        }
    }

    async handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            this.showNotification('File size must be less than 2MB', 'error');
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.updateLogoPreview(e.target.result);
            };
            reader.readAsDataURL(file);

            if (!this.currentClient) {
                // Demo mode - just show preview
                this.showNotification('Logo updated (demo mode)', 'success');
                return;
            }

            // Real mode - upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${this.currentClient.id}/logo.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('client-assets')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('client-assets')
                .getPublicUrl(fileName);

            // Update client record
            const { error: updateError } = await supabase
                .from(TABLES.CLIENTS)
                .update({ logo_url: publicUrl })
                .eq('id', this.currentClient.id);

            if (updateError) {
                throw new Error(updateError.message);
            }

            this.showNotification('Logo uploaded successfully', 'success');

        } catch (error) {
            console.error('Error uploading logo:', error);
            this.showNotification('Failed to upload logo. Please try again.', 'error');
        }
    }

    updateLogoPreview(imageUrl) {
        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview && imageUrl) {
            logoPreview.innerHTML = `<img src="${imageUrl}" alt="Logo Preview" class="w-full h-full object-contain rounded-lg">`;
        }
    }

    // Data Management Methods
    async exportData() {
        try {
            this.showNotification('Preparing data export...', 'info');
            
            if (!this.currentClient) {
                // Demo mode - create sample export
                await this.createDemoExport();
                return;
            }

            // Real mode - export from database
            await this.exportFromDatabase();

        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Failed to export data. Please try again.', 'error');
        }
    }

    async createDemoExport() {
        // Simulate export process
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create demo data
        const demoData = {
            opportunities: [
                { name: "AI Document Review", impact: 9, effort: 6, priority: "high" },
                { name: "Automated Time Tracking", impact: 7, effort: 4, priority: "medium" }
            ],
            teams: [
                { name: "Corporate Law", painPoints: ["Manual document review"], opportunities: ["AI document analysis"] },
                { name: "Litigation", painPoints: ["Time tracking inefficiencies"], opportunities: ["Automated time tracking"] }
            ],
            objectives: [
                { title: "Increase Efficiency", description: "Reduce manual processes by 40%" },
                { title: "Improve Client Experience", description: "Enhance transparency and communication" }
            ]
        };

        // Create and download JSON file
        const dataStr = JSON.stringify(demoData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `strategy-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully (demo mode)', 'success');
    }

    async exportFromDatabase() {
        // Export real data from Supabase
        const { data: reports, error } = await supabase
            .from(TABLES.REPORTS)
            .select('*')
            .eq('client_id', this.currentClient.id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        // Create and download JSON file
        const dataStr = JSON.stringify(reports, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `strategy-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully', 'success');
    }

    showImportModal() {
        // Create import modal dynamically
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-gray-900">Import Data</h4>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <i data-lucide="upload" class="w-8 h-8 text-gray-400 mx-auto mb-2"></i>
                        <p class="text-sm text-gray-600">Drop data files here or click to upload</p>
                        <p class="text-xs text-gray-500 mt-1">Supports .json, .csv files</p>
                        <input type="file" id="importFileInput" accept=".json,.csv" class="hidden">
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button onclick="this.closest('.fixed').remove()" class="btn-secondary">Cancel</button>
                        <button onclick="adminService.processImport()" class="btn-primary">Import</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup file input
        const fileInput = modal.querySelector('#importFileInput');
        const uploadArea = modal.querySelector('.border-dashed');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('border-blue-400', 'bg-blue-50');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
            fileInput.files = e.dataTransfer.files;
        });

        // Initialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    async processImport() {
        const fileInput = document.querySelector('#importFileInput');
        const file = fileInput?.files[0];
        
        if (!file) {
            this.showNotification('Please select a file to import', 'error');
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!this.currentClient) {
                // Demo mode
                this.showNotification('Data imported successfully (demo mode)', 'success');
            } else {
                // Real mode - save to database
                await this.saveImportedData(data);
            }
            
            // Close modal
            document.querySelector('.fixed.inset-0').remove();
            
        } catch (error) {
            console.error('Error importing data:', error);
            this.showNotification('Failed to import data. Please check file format.', 'error');
        }
    }

    async saveImportedData(data) {
        const { error } = await supabase
            .from(TABLES.REPORTS)
            .upsert({
                client_id: this.currentClient.id,
                overview_json: data.overview || {},
                teams_json: data.teams || {},
                opportunities_json: data.opportunities || {},
                roadmap_json: data.roadmap || {},
                simulator_json: data.simulator || {}
            });

        if (error) {
            throw new Error(error.message);
        }

        this.showNotification('Data imported successfully', 'success');
    }

    async loadSyntheticData() {
        try {
            const btn = document.getElementById('loadSyntheticDataBtn');
            const originalText = btn.textContent;
            
            btn.classList.add('btn-loading');
            btn.disabled = true;
            btn.textContent = 'Loading...';

            // Simulate AI processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (!this.currentClient) {
                // Demo mode - simulate synthetic data generation
                this.generateSyntheticData();
            } else {
                // Real mode - use AI to generate insights
                await this.generateAIIInsights();
            }

            btn.classList.remove('btn-loading');
            btn.disabled = false;
            btn.textContent = originalText;

            this.showNotification('Synthetic data loaded successfully', 'success');

        } catch (error) {
            console.error('Error loading synthetic data:', error);
            this.showNotification('Failed to load synthetic data', 'error');
        }
    }

    generateSyntheticData() {
        // Update metrics with synthetic data
        const opportunitiesCount = document.getElementById('opportunitiesCount');
        const teamsCount = document.getElementById('teamsCount');
        const objectivesCount = document.getElementById('objectivesCount');

        if (opportunitiesCount) opportunitiesCount.textContent = '15';
        if (teamsCount) teamsCount.textContent = '6';
        if (objectivesCount) objectivesCount.textContent = '5';

        // Simulate data generation
        console.log('Generated synthetic data for demo');
    }

    async generateAIIInsights() {
        // This would integrate with AI service to generate insights from transcripts
        console.log('Generating AI insights from interview data...');
    }

    switchDataTab(tabName) {
        // Remove active class from all tabs
        document.querySelectorAll('.data-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to clicked tab
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show corresponding content
        const contentElement = document.getElementById(`${tabName}-content`);
        if (contentElement) {
            contentElement.classList.add('active');
        }

        // Load data for the specific tab
        this.loadTabData(tabName);

        console.log(`Switched to ${tabName} tab`);
    }

    async loadTabData(tabName) {
        try {
            switch (tabName) {
                case 'overview':
                    await this.loadOverviewData();
                    break;
                case 'client-info':
                    await this.loadClientInfoData();
                    break;
                case 'teams':
                    await this.loadTeamsData();
                    break;
                case 'opportunities':
                    await this.loadOpportunitiesData();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${tabName} data:`, error);
        }
    }

    async loadOverviewData() {
        if (!this.currentClient) {
            // Demo mode - data is already in HTML
            return;
        }

        // Real mode - load from database
        const { data: client, error } = await supabase
            .from(TABLES.CLIENTS)
            .select('*')
            .eq('id', this.currentClient.id)
            .single();

        if (error) {
            console.error('Error loading client data:', error);
            return;
        }

        // Update overview fields
        document.getElementById('overviewClient').textContent = client.company_name;
        document.getElementById('overviewSector').textContent = client.industry || 'Legal Services';
        document.getElementById('overviewReportDate').textContent = new Date().toISOString().split('T')[0];
        document.getElementById('overviewNorthStar').textContent = client.objective || 'Become the premier firm delivering faster legal services through AI integration';
        document.getElementById('overviewExecutiveSummary').textContent = client.executive_summary || 'Executive summary will be generated based on AI analysis.';
    }

    async loadClientInfoData() {
        if (!this.currentClient) {
            // Demo mode - data is already in HTML
            return;
        }

        // Real mode - load from database
        const { data: client, error } = await supabase
            .from(TABLES.CLIENTS)
            .select('*')
            .eq('id', this.currentClient.id)
            .single();

        if (error) {
            console.error('Error loading client data:', error);
            return;
        }

        // Update form fields
        document.getElementById('clientName').value = client.company_name;
        document.getElementById('clientSector').value = client.industry || 'Legal Services';
        document.getElementById('clientObjective').value = client.objective || 'Become the premier firm delivering faster legal services through AI integration';
        document.getElementById('clientEmail').value = client.contact_email || '';
        document.getElementById('clientPhone').value = client.contact_phone || '';
    }

    async loadTeamsData() {
        // This would load team data from database
        // For now, using static data from HTML
        console.log('Loading teams data...');
    }

    async loadOpportunitiesData() {
        // This would load opportunities data from database
        // For now, using static data from HTML
        console.log('Loading opportunities data...');
    }

    async updateClientInfo() {
        try {
            if (!this.currentClient) {
                this.showNotification('Client info updated (demo mode)', 'success');
                return;
            }

            const clientData = {
                company_name: document.getElementById('clientName').value,
                industry: document.getElementById('clientSector').value,
                contact_email: document.getElementById('clientEmail').value,
                contact_phone: document.getElementById('clientPhone').value,
                objective: document.getElementById('clientObjective')?.value || '',
                executive_summary: 'Executive summary will be generated based on AI analysis.'
            };

            const { error } = await supabase
                .from(TABLES.CLIENTS)
                .update(clientData)
                .eq('id', this.currentClient.id);

            if (error) {
                throw new Error(error.message);
            }

            this.showNotification('Client information updated successfully', 'success');

            // Update overview tab if it's visible
            if (document.getElementById('overview-content').classList.contains('active')) {
                await this.loadOverviewData();
            }

        } catch (error) {
            console.error('Error updating client info:', error);
            this.showNotification('Failed to update client information', 'error');
        }
    }

    setupTranscriptUpload() {
        const uploadArea = document.getElementById('transcriptUploadArea');
        const fileInput = document.getElementById('transcriptFileInput');

        if (!uploadArea || !fileInput) return;

        uploadArea.addEventListener('click', () => fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            fileInput.files = e.dataTransfer.files;
            this.processTranscriptFiles(Array.from(e.dataTransfer.files));
        });

        fileInput.addEventListener('change', (e) => {
            this.processTranscriptFiles(Array.from(e.target.files));
        });
    }

    async processTranscriptFiles(files) {
        for (const file of files) {
            try {
                const text = await this.extractTextFromFile(file);
                console.log(`Processing transcript: ${file.name}`);
                
                if (!this.currentClient) {
                    // Demo mode - simulate processing
                    this.showNotification(`Processed ${file.name} (demo mode)`, 'success');
                } else {
                    // Real mode - process with AI
                    await this.processTranscriptWithAI(text, file.name);
                }
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                this.showNotification(`Failed to process ${file.name}`, 'error');
            }
        }
    }

    async extractTextFromFile(file) {
        // Simple text extraction (in real app, you'd use proper libraries)
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async processTranscriptWithAI(text, fileName) {
        // This would integrate with AI service to extract insights
        console.log(`Processing ${fileName} with AI...`);
        
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showNotification(`Processed ${fileName} with AI`, 'success');
    }

    // Quick Actions Methods
    async exportPDFReport() {
        try {
            this.showNotification('Generating PDF report...', 'info');
            
            // Simulate PDF generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In a real implementation, this would call a PDF generation service
            this.showNotification('PDF report generated successfully', 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showNotification('Failed to generate PDF report', 'error');
        }
    }

    async generateShareableLink() {
        try {
            if (!this.currentClient) {
                // Demo mode
                const demoLink = 'https://dashboard.harbourview.ai/share/demo-link-123';
                await navigator.clipboard.writeText(demoLink);
                this.showNotification('Shareable link copied to clipboard (demo)', 'success');
                return;
            }

            // Real mode - generate signed URL
            const shareableLink = await this.createShareableLink();
            await navigator.clipboard.writeText(shareableLink);
            this.showNotification('Shareable link copied to clipboard', 'success');
            
        } catch (error) {
            console.error('Error generating shareable link:', error);
            this.showNotification('Failed to generate shareable link', 'error');
        }
    }

    async createShareableLink() {
        // This would create a time-limited signed URL
        const baseUrl = window.location.origin;
        const clientId = this.currentClient.id;
        const token = 'demo-token'; // In real implementation, generate proper token
        
        return `${baseUrl}/shared/${clientId}?token=${token}`;
    }

    async refreshData() {
        try {
            const btn = document.getElementById('refreshDataBtn');
            const icon = btn.querySelector('i');
            
            // Add loading animation
            icon.classList.add('animate-spin');
            
            // Refresh all data
            await Promise.all([
                this.loadUsers(),
                this.loadBranding(),
                this.loadFeedback()
            ]);
            
            // Remove loading animation
            icon.classList.remove('animate-spin');
            
            this.showNotification('Data refreshed successfully', 'success');
            
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showNotification('Failed to refresh data', 'error');
        }
    }

    // Feedback Methods
    async submitFeedback() {
        try {
            const feedbackText = document.getElementById('feedbackText').value;
            const isAnonymous = document.getElementById('anonymousFeedback').checked;
            
            if (!feedbackText.trim()) {
                this.showNotification('Please enter a comment', 'error');
                return;
            }

            if (!this.currentClient) {
                // Demo mode
                this.addDemoFeedback(feedbackText, isAnonymous);
                this.showNotification('Feedback submitted (demo mode)', 'success');
            } else {
                // Real mode - save to database
                await this.saveFeedback(feedbackText, isAnonymous);
                this.showNotification('Feedback submitted successfully', 'success');
            }
            
            // Clear form
            document.getElementById('feedbackForm').reset();
            await this.loadFeedback();
            
        } catch (error) {
            console.error('Error submitting feedback:', error);
            this.showNotification('Failed to submit feedback', 'error');
        }
    }

    addDemoFeedback(text, isAnonymous) {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;
        
        const newComment = document.createElement('div');
        newComment.className = 'p-3 bg-gray-50 rounded-lg fade-in';
        newComment.innerHTML = `
            <div class="text-sm text-gray-700">"${text}"</div>
            <div class="text-xs text-gray-500 mt-1">- ${isAnonymous ? 'Anonymous' : 'You'}, just now</div>
        `;
        
        commentsList.insertBefore(newComment, commentsList.firstChild);
    }

    async saveFeedback(text, isAnonymous) {
        const { error } = await supabase
            .from(TABLES.FEEDBACK)
            .insert({
                client_id: this.currentClient.id,
                user_id: isAnonymous ? null : 'current-user-id', // In real app, get from auth
                page_section: 'admin',
                comment: text,
                is_anonymous: isAnonymous
            });

        if (error) {
            throw new Error(error.message);
        }
    }

    async loadFeedback() {
        try {
            const commentsList = document.getElementById('commentsList');
            if (!commentsList) return;

            if (!this.currentClient) {
                // Demo mode - show demo comments
                commentsList.innerHTML = `
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <div class="text-sm text-gray-700">"The simulator is very helpful for understanding impact"</div>
                        <div class="text-xs text-gray-500 mt-1">- John Smith, 2 hours ago</div>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <div class="text-sm text-gray-700">"Would like to see more detailed cost breakdowns"</div>
                        <div class="text-xs text-gray-500 mt-1">- Sarah Johnson, 1 day ago</div>
                    </div>
                `;
                return;
            }

            // Real mode - load from database
            const { data: feedback, error } = await supabase
                .from(TABLES.FEEDBACK)
                .select('*')
                .eq('client_id', this.currentClient.id)
                .eq('page_section', 'admin')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error loading feedback:', error);
                return;
            }

            if (feedback && feedback.length > 0) {
                commentsList.innerHTML = feedback.map(f => `
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <div class="text-sm text-gray-700">"${f.comment}"</div>
                        <div class="text-xs text-gray-500 mt-1">- ${f.is_anonymous ? 'Anonymous' : 'User'}, ${this.formatLastLogin(f.created_at)}</div>
                    </div>
                `).join('');
            } else {
                commentsList.innerHTML = '<p class="text-sm text-gray-500">No comments yet</p>';
            }

        } catch (error) {
            console.error('Error in loadFeedback:', error);
        }
    }

    // Getters
    get currentUsers() {
        return this.users;
    }

    get currentClient() {
        return this.currentClient;
    }
}

// Create global instance
const adminService = new AdminService();

// Export for use in other modules
export default adminService;
