import { supabase, TABLES } from './supabase-config.js';

class OverviewService {
    constructor() {
        this.currentClient = null;
        this.clientData = null;
        this.opportunitiesData = [];
        this.teamsData = [];
        this.insightsData = [];
        this.isDemoMode = true; // Start in demo mode
    }

    async init() {
        try {
            // Try to get current client from localStorage or URL params
            const clientId = this.getClientId();
            
            if (clientId) {
                await this.loadClientData(clientId);
                this.isDemoMode = false;
            } else {
                await this.loadDemoData();
                this.isDemoMode = true;
            }

        await this.loadAllData();
        this.updateUI();
        this.setupClientSelector();
        await this.updateClientSelector();
        
    } catch (error) {
            console.error('Error initializing overview service:', error);
            // Fallback to demo mode
            await this.loadDemoData();
            this.updateUI();
        }
    }

    getClientId() {
        // Check URL params first
        const urlParams = new URLSearchParams(window.location.search);
        const clientId = urlParams.get('client_id');
        
        if (clientId) {
            return clientId;
        }

        // Check localStorage
        const storedClient = localStorage.getItem('currentClient');
        if (storedClient) {
            try {
                return JSON.parse(storedClient).id;
            } catch (e) {
                return null;
            }
        }

        return null;
    }

    async loadClientData(clientId) {
        try {
            const { data: client, error } = await supabase
                .from(TABLES.CLIENTS)
                .select('*')
                .eq('id', clientId)
                .single();

            if (error) {
                throw new Error(error.message);
            }

            this.currentClient = client;
            this.clientData = client;
            
        } catch (error) {
            console.error('Error loading client data:', error);
            throw error;
        }
    }

    async loadAllData() {
        if (this.isDemoMode) {
            return; // Demo data is already loaded
        }

        try {
            // Load opportunities
            const { data: opportunities, error: oppError } = await supabase
                .from(TABLES.REPORTS)
                .select('*')
                .eq('client_id', this.currentClient.id)
                .eq('report_type', 'opportunities');

            if (!oppError && opportunities) {
                this.opportunitiesData = opportunities;
            }

            // Load teams data
            const { data: teams, error: teamsError } = await supabase
                .from(TABLES.REPORTS)
                .select('*')
                .eq('client_id', this.currentClient.id)
                .eq('report_type', 'teams');

            if (!teamsError && teams) {
                this.teamsData = teams;
            }

            // Load insights data
            const { data: insights, error: insightsError } = await supabase
                .from(TABLES.REPORTS)
                .select('*')
                .eq('client_id', this.currentClient.id)
                .eq('report_type', 'insights');

            if (!insightsError && insights) {
                this.insightsData = insights;
            }

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadDemoData() {
        // Demo client data
        this.clientData = {
            id: 'demo-client',
            company_name: 'Sterling & Associates',
            industry: 'Legal Services',
            objective: 'Become the premier firm delivering faster legal services through AI integration',
            executive_summary: 'AI integration transforms Sterling & Associates from traditional law practice into an AI-enabled legal powerhouse. Strategic implementation of document automation, case prediction, and client communication tools positions the firm for 40% efficiency gains and enhanced client satisfaction.',
            contact_email: 'contact@sterlinglaw.com',
            contact_phone: '+1 (555) 123-4567'
        };

        // Demo opportunities data
        this.opportunitiesData = [
            {
                id: 'demo-1',
                title: 'AI Document Review Assistant',
                impact_score: 9,
                time_saved_hours: 10,
                effort_level: 'high',
                priority_score: 82,
                description: 'AI system that automatically reviews, categorizes, and flags relevant documents for litigation discovery and due diligence processes.',
                benefits: [
                    '75% faster document review and discovery process',
                    'Improved accuracy in identifying relevant documents'
                ]
            },
            {
                id: 'demo-2',
                title: 'Automated Time Tracking System',
                impact_score: 8,
                time_saved_hours: 7,
                effort_level: 'medium',
                priority_score: 75,
                description: 'AI-powered time tracking system that automatically captures billable hours and categorizes work activities without manual entry.',
                benefits: [
                    'Accurate billable hour capture without manual entry',
                    'Improved billing accuracy and client transparency'
                ]
            },
            {
                id: 'demo-3',
                title: 'Legal Research AI Assistant',
                impact_score: 9,
                time_saved_hours: 8,
                effort_level: 'high',
                priority_score: 88,
                description: 'Advanced AI research tool that provides comprehensive case law analysis, precedent identification, and legal argument suggestions.',
                benefits: [
                    '90% faster legal precedent research',
                    'More comprehensive case law analysis'
                ]
            },
            {
                id: 'demo-4',
                title: 'Contract Analysis Engine',
                impact_score: 8,
                time_saved_hours: 6,
                effort_level: 'high',
                priority_score: 79,
                description: 'AI-powered contract analysis system that automatically identifies risks, clauses, and compliance issues in legal documents.',
                benefits: [
                    'Automated risk assessment and clause analysis',
                    'Standardized contract review and reporting'
                ]
            }
        ];

        // Demo teams data
        this.teamsData = [
            {
                id: 'demo-team-1',
                name: 'Corporate Law Team',
                member_count: 8,
                insights_count: 2,
                confidence: 92,
                status: 'analyzed'
            },
            {
                id: 'demo-team-2',
                name: 'Litigation Team',
                member_count: 6,
                insights_count: 2,
                confidence: 94,
                status: 'analyzed'
            },
            {
                id: 'demo-team-3',
                name: 'Client Services Team',
                member_count: 3,
                insights_count: 2,
                confidence: 90,
                status: 'analyzed'
            },
            {
                id: 'demo-team-4',
                name: 'Business Development Team',
                member_count: 2,
                insights_count: 1,
                confidence: 88,
                status: 'analyzed'
            }
        ];

        // Demo insights data
        this.insightsData = [
            {
                id: 'demo-insight-1',
                title: 'Document Discovery Volume Unmanageable',
                description: 'Current class action case has 2.8M documents requiring 8+ months of manual review by 10-person team',
                team: 'Litigation Team',
                confidence: 96,
                type: 'pain_point',
                priority: 'high'
            },
            {
                id: 'demo-insight-2',
                title: 'Manual Document Review Overwhelming Attorneys',
                description: 'Senior attorneys spend 8-10 hours per deal reviewing 200+ documents manually, representing poor use of $400/hour resources',
                team: 'Corporate Law Team',
                confidence: 94,
                type: 'pain_point',
                priority: 'high'
            },
            {
                id: 'demo-insight-3',
                title: 'Legal Research Consuming Excessive Billable Hours',
                description: 'Attorneys spend 20+ hours per motion on research that could be significantly automated with AI assistance',
                team: 'Litigation Team',
                confidence: 92,
                type: 'opportunity',
                priority: 'medium'
            },
            {
                id: 'demo-insight-4',
                title: 'Inconsistent Time Tracking Leading to Billing Disputes',
                description: 'Attorneys inconsistent time tracking causes 20% of bills to generate disputes and delays payment collection to 65 days',
                team: 'Client Services Team',
                confidence: 91,
                type: 'pain_point',
                priority: 'high'
            },
            {
                id: 'demo-insight-5',
                title: 'Contract Template Inconsistency Across Team',
                description: 'Different partners use different language for similar provisions, creating inconsistent work product and client confusion',
                team: 'Corporate Law Team',
                confidence: 89,
                type: 'opportunity',
                priority: 'medium'
            },
            {
                id: 'demo-insight-6',
                title: 'Clients Expect Real-Time Transparency Like Other Industries',
                description: 'Clients accustomed to real-time tracking from other services expect similar transparency from law firm',
                team: 'Client Services Team',
                confidence: 87,
                type: 'opportunity',
                priority: 'low'
            }
        ];
    }

    async loadDemoDataForClient(clientId) {
        // Load different demo data based on client ID
        switch (clientId) {
            case 'demo-acme':
                this.clientData = {
                    id: 'demo-acme',
                    company_name: 'Acme Corporation',
                    industry: 'Technology',
                    objective: 'Become the leading AI-powered enterprise software provider',
                    executive_summary: 'Acme Corporation transforms enterprise operations through strategic AI implementation, focusing on automation, predictive analytics, and intelligent workflow optimization to drive 50% efficiency gains.',
                    contact_email: 'contact@acme.com',
                    contact_phone: '+1 (555) 987-6543'
                };
                break;
            case 'demo-techstart':
                this.clientData = {
                    id: 'demo-techstart',
                    company_name: 'TechStart Inc',
                    industry: 'Startup',
                    objective: 'Scale rapidly using AI-driven growth strategies',
                    executive_summary: 'TechStart Inc leverages AI to accelerate product development, optimize customer acquisition, and build scalable operational processes for rapid market expansion and 300% growth.',
                    contact_email: 'hello@techstart.io',
                    contact_phone: '+1 (555) 456-7890'
                };
                break;
            default: // 'demo' - Sterling & Associates
                this.clientData = {
                    id: 'demo-client',
                    company_name: 'Sterling & Associates',
                    industry: 'Legal Services',
                    objective: 'Become the premier firm delivering faster legal services through AI integration',
                    executive_summary: 'AI integration transforms Sterling & Associates from traditional law practice into an AI-enabled legal powerhouse. Strategic implementation of document automation, case prediction, and client communication tools positions the firm for 40% efficiency gains and enhanced client satisfaction.',
                    contact_email: 'contact@sterlinglaw.com',
                    contact_phone: '+1 (555) 123-4567'
                };
                break;
        }

        // Load demo opportunities and other data (same for all demo clients for now)
        await this.loadDemoOpportunitiesAndTeams();
    }

    async loadDemoOpportunitiesAndTeams() {
        // Demo opportunities data (same for all demo clients)
        this.opportunitiesData = [
            {
                id: 'demo-1',
                title: 'AI Document Review Assistant',
                impact_score: 9,
                time_saved_hours: 10,
                effort_level: 'high',
                priority_score: 82,
                description: 'AI system that automatically reviews, categorizes, and flags relevant documents for litigation discovery and due diligence processes.',
                benefits: [
                    '75% faster document review and discovery process',
                    'Improved accuracy in identifying relevant documents'
                ]
            },
            {
                id: 'demo-2',
                title: 'Automated Time Tracking System',
                impact_score: 8,
                time_saved_hours: 7,
                effort_level: 'medium',
                priority_score: 75,
                description: 'AI-powered time tracking system that automatically captures billable hours and categorizes work activities without manual entry.',
                benefits: [
                    'Accurate billable hour capture without manual entry',
                    'Improved billing accuracy and client transparency'
                ]
            },
            {
                id: 'demo-3',
                title: 'Legal Research AI Assistant',
                impact_score: 9,
                time_saved_hours: 8,
                effort_level: 'high',
                priority_score: 88,
                description: 'Advanced AI research tool that provides comprehensive case law analysis, precedent identification, and legal argument suggestions.',
                benefits: [
                    '90% faster legal precedent research',
                    'More comprehensive case law analysis'
                ]
            },
            {
                id: 'demo-4',
                title: 'Contract Analysis Engine',
                impact_score: 8,
                time_saved_hours: 6,
                effort_level: 'high',
                priority_score: 79,
                description: 'AI-powered contract analysis system that automatically identifies risks, clauses, and compliance issues in legal documents.',
                benefits: [
                    'Automated risk assessment and clause analysis',
                    'Standardized contract review and reporting'
                ]
            }
        ];

        // Demo teams data
        this.teamsData = [
            {
                id: 'demo-team-1',
                name: this.clientData.industry === 'Technology' ? 'Engineering Team' : 
                      this.clientData.industry === 'Startup' ? 'Product Team' : 'Corporate Law Team',
                member_count: 8,
                insights_count: 2,
                confidence: 92,
                status: 'analyzed'
            },
            {
                id: 'demo-team-2',
                name: this.clientData.industry === 'Technology' ? 'Sales Team' : 
                      this.clientData.industry === 'Startup' ? 'Marketing Team' : 'Litigation Team',
                member_count: 6,
                insights_count: 2,
                confidence: 94,
                status: 'analyzed'
            },
            {
                id: 'demo-team-3',
                name: this.clientData.industry === 'Technology' ? 'Support Team' : 
                      this.clientData.industry === 'Startup' ? 'Operations Team' : 'Client Services Team',
                member_count: 3,
                insights_count: 2,
                confidence: 90,
                status: 'analyzed'
            },
            {
                id: 'demo-team-4',
                name: this.clientData.industry === 'Technology' ? 'Product Team' : 
                      this.clientData.industry === 'Startup' ? 'Growth Team' : 'Business Development Team',
                member_count: 2,
                insights_count: 1,
                confidence: 88,
                status: 'analyzed'
            }
        ];

        // Demo insights data (industry-specific)
        this.insightsData = this.generateIndustrySpecificInsights();
    }

    generateIndustrySpecificInsights() {
        const industry = this.clientData.industry;
        
        if (industry === 'Technology') {
            return [
                {
                    id: 'demo-insight-1',
                    title: 'Manual Code Review Process Slowing Development',
                    description: 'Engineering team spends 40% of time on manual code reviews, creating bottlenecks in the development pipeline',
                    team: 'Engineering Team',
                    confidence: 96,
                    type: 'pain_point',
                    priority: 'high'
                },
                {
                    id: 'demo-insight-2',
                    title: 'Customer Support Tickets Overwhelming Team',
                    description: 'Support team receives 500+ tickets daily, with 60% being repetitive queries that could be automated',
                    team: 'Support Team',
                    confidence: 94,
                    type: 'pain_point',
                    priority: 'high'
                },
                {
                    id: 'demo-insight-3',
                    title: 'Sales Process Lacks AI-Driven Lead Scoring',
                    description: 'Sales team manually qualifies leads, resulting in 30% lower conversion rates compared to AI-powered scoring',
                    team: 'Sales Team',
                    confidence: 92,
                    type: 'opportunity',
                    priority: 'medium'
                }
            ];
        } else if (industry === 'Startup') {
            return [
                {
                    id: 'demo-insight-1',
                    title: 'Product Development Cycle Too Long',
                    description: 'Current product development takes 6 months average, while competitors ship in 3 months using AI-assisted development',
                    team: 'Product Team',
                    confidence: 95,
                    type: 'pain_point',
                    priority: 'high'
                },
                {
                    id: 'demo-insight-2',
                    title: 'Marketing Campaign ROI Tracking Manual',
                    description: 'Marketing team spends 15 hours weekly manually tracking campaign performance across platforms',
                    team: 'Marketing Team',
                    confidence: 93,
                    type: 'pain_point',
                    priority: 'high'
                },
                {
                    id: 'demo-insight-3',
                    title: 'Customer Acquisition Cost Rising',
                    description: 'CAC has increased 40% in Q4 due to lack of predictive analytics for targeting and optimization',
                    team: 'Growth Team',
                    confidence: 91,
                    type: 'opportunity',
                    priority: 'medium'
                }
            ];
        } else { // Legal Services (default)
            return [
                {
                    id: 'demo-insight-1',
                    title: 'Document Discovery Volume Unmanageable',
                    description: 'Current class action case has 2.8M documents requiring 8+ months of manual review by 10-person team',
                    team: 'Litigation Team',
                    confidence: 96,
                    type: 'pain_point',
                    priority: 'high'
                },
                {
                    id: 'demo-insight-2',
                    title: 'Manual Document Review Overwhelming Attorneys',
                    description: 'Senior attorneys spend 8-10 hours per deal reviewing 200+ documents manually, representing poor use of $400/hour resources',
                    team: 'Corporate Law Team',
                    confidence: 94,
                    type: 'pain_point',
                    priority: 'high'
                },
                {
                    id: 'demo-insight-3',
                    title: 'Legal Research Consuming Excessive Billable Hours',
                    description: 'Attorneys spend 20+ hours per motion on research that could be significantly automated with AI assistance',
                    team: 'Litigation Team',
                    confidence: 92,
                    type: 'opportunity',
                    priority: 'medium'
                }
            ];
        }
    }

    updateUI() {
        this.updateClientHeader();
        this.updateKeyInsights();
        this.updateExpectedImpact();
        this.updateOpportunityCards();
        this.updateTeamInsights();
        this.updateHighestConfidenceInsights();
        this.updateScatterPlot();
    }

    updateClientHeader() {
        if (!this.clientData) return;

        // Update client name
        const clientNameElement = document.querySelector('h1');
        if (clientNameElement) {
            clientNameElement.textContent = this.clientData.company_name;
        }

        // Update industry/sector
        const sectorElement = document.querySelector('.flex.items-center.space-x-2 span:last-child');
        if (sectorElement) {
            sectorElement.textContent = this.clientData.industry || this.clientData.sector || 'Legal Services';
        }

        // Update description
        const descriptionElement = document.querySelector('.text-white.text-lg.mb-8');
        if (descriptionElement) {
            descriptionElement.textContent = this.clientData.executive_summary;
        }

        // Update vision banner
        const visionElement = document.querySelector('.bg-gradient-to-br.from-green-600 h2');
        if (visionElement) {
            visionElement.textContent = `Vision: ${this.clientData.objective}`;
        }
    }

    updateKeyInsights() {
        // Calculate insights from data
        const totalInsights = this.insightsData.length;
        const painPoints = this.insightsData.filter(i => i.type === 'pain_point').length;
        const opportunities = this.insightsData.filter(i => i.type === 'opportunity').length;
        const teamsAnalyzed = this.teamsData.length;

        // Update insight cards
        const insightCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6 > div');
        
        if (insightCards[0]) {
            const timeWastedElement = insightCards[0].querySelector('.text-3xl');
            if (timeWastedElement) {
                timeWastedElement.textContent = '73%';
            }
        }

        if (insightCards[1]) {
            const hoursLostElement = insightCards[1].querySelector('.text-3xl');
            if (hoursLostElement) {
                hoursLostElement.textContent = '18.5';
            }
        }

        if (insightCards[2]) {
            const communicationElement = insightCards[2].querySelector('.text-3xl');
            if (communicationElement) {
                communicationElement.textContent = '42%';
            }
        }

        if (insightCards[3]) {
            const automationElement = insightCards[3].querySelector('.text-3xl');
            if (automationElement) {
                automationElement.textContent = '89%';
            }
        }
    }

    updateExpectedImpact() {
        // Calculate impact metrics
        const totalTimeSaved = this.opportunitiesData.reduce((sum, opp) => sum + opp.time_saved_hours, 0);
        const avgImpactScore = this.opportunitiesData.reduce((sum, opp) => sum + opp.impact_score, 0) / this.opportunitiesData.length;
        const teamsImpacted = this.teamsData.length;
        const topOpportunities = this.opportunitiesData.filter(opp => opp.priority_score > 75).length;

        // Update impact cards
        const impactCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6 > div');
        
        if (impactCards[4]) {
            const timeSavedElement = impactCards[4].querySelector('.text-3xl');
            if (timeSavedElement) {
                timeSavedElement.textContent = `${totalTimeSaved}h`;
            }
        }

        if (impactCards[5]) {
            const impactScoreElement = impactCards[5].querySelector('.text-3xl');
            if (impactScoreElement) {
                impactScoreElement.textContent = `${avgImpactScore.toFixed(1)}/10`;
            }
        }

        if (impactCards[6]) {
            const teamsElement = impactCards[6].querySelector('.text-3xl');
            if (teamsElement) {
                teamsElement.textContent = teamsImpacted;
            }
        }

        if (impactCards[7]) {
            const opportunitiesElement = impactCards[7].querySelector('.text-3xl');
            if (opportunitiesElement) {
                opportunitiesElement.textContent = topOpportunities;
            }
        }
    }

    updateOpportunityCards() {
        // Update opportunity cards with dynamic data
        const opportunityCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.gap-6 > div');
        
        this.opportunitiesData.forEach((opp, index) => {
            if (opportunityCards[index]) {
                // Update title
                const titleElement = opportunityCards[index].querySelector('h3');
                if (titleElement) {
                    titleElement.textContent = opp.title;
                }

                // Update impact score
                const impactElement = opportunityCards[index].querySelector('.text-2xl.font-bold.text-blue-600');
                if (impactElement) {
                    impactElement.textContent = `${opp.impact_score}/10`;
                }

                // Update time saved
                const timeElement = opportunityCards[index].querySelector('.text-2xl.font-bold.text-green-600');
                if (timeElement) {
                    timeElement.textContent = `${opp.time_saved_hours}h`;
                }

                // Update effort level
                const effortElement = opportunityCards[index].querySelector('.bg-gray-100');
                if (effortElement) {
                    effortElement.textContent = opp.effort_level;
                }

                // Update benefits
                const benefitsList = opportunityCards[index].querySelectorAll('.text-sm.text-gray-700');
                opp.benefits.forEach((benefit, benefitIndex) => {
                    if (benefitsList[benefitIndex]) {
                        benefitsList[benefitIndex].textContent = `• ${benefit}`;
                    }
                });
            }
        });
    }

    updateTeamInsights() {
        const totalInsights = this.insightsData.length;
        const painPoints = this.insightsData.filter(i => i.type === 'pain_point').length;
        const opportunities = this.insightsData.filter(i => i.type === 'opportunity').length;
        const teamsAnalyzed = this.teamsData.length;

        // Update summary cards
        const summaryCards = document.querySelectorAll('.grid.grid-cols-2.md\\:grid-cols-4.gap-4.mb-8 > div');
        
        if (summaryCards[0]) {
            const totalElement = summaryCards[0].querySelector('.text-3xl');
            if (totalElement) {
                totalElement.textContent = totalInsights;
            }
        }

        if (summaryCards[1]) {
            const painPointsElement = summaryCards[1].querySelector('.text-3xl');
            if (painPointsElement) {
                painPointsElement.textContent = painPoints;
            }
        }

        if (summaryCards[2]) {
            const opportunitiesElement = summaryCards[2].querySelector('.text-3xl');
            if (opportunitiesElement) {
                opportunitiesElement.textContent = opportunities;
            }
        }

        if (summaryCards[3]) {
            const teamsElement = summaryCards[3].querySelector('.text-3xl');
            if (teamsElement) {
                teamsElement.textContent = teamsAnalyzed;
            }
        }

        // Update team analysis
        const teamItems = document.querySelectorAll('.space-y-4 > div');
        this.teamsData.forEach((team, index) => {
            if (teamItems[index]) {
                const nameElement = teamItems[index].querySelector('h4');
                if (nameElement) {
                    nameElement.textContent = team.name;
                }

                const insightsElement = teamItems[index].querySelector('.text-sm.text-gray-600');
                if (insightsElement) {
                    insightsElement.textContent = `${team.insights_count} insights generated`;
                }

                const confidenceElement = teamItems[index].querySelector('.text-sm.text-gray-600.mb-1');
                if (confidenceElement) {
                    confidenceElement.textContent = `Confidence: ${team.confidence}%`;
                }

                const progressBar = teamItems[index].querySelector('.bg-blue-600.h-2.rounded-full');
                if (progressBar) {
                    progressBar.style.width = `${team.confidence}%`;
                }
            }
        });
    }

    updateHighestConfidenceInsights() {
        const insightsContainer = document.querySelector('.space-y-4');
        if (!insightsContainer) return;

        // Clear existing insights
        insightsContainer.innerHTML = '';

        // Sort insights by confidence and take top 6
        const sortedInsights = [...this.insightsData].sort((a, b) => b.confidence - a.confidence).slice(0, 6);

        sortedInsights.forEach(insight => {
            const insightElement = document.createElement('div');
            insightElement.className = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6';
            
            const iconClass = insight.type === 'pain_point' ? 'alert-triangle' : 'info';
            const iconColor = insight.type === 'pain_point' ? 'red' : 'blue';
            const badgeColor = insight.type === 'pain_point' ? 'red' : 'blue';

            insightElement.innerHTML = `
                <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-${iconColor}-50 rounded-lg flex items-center justify-center">
                            <i data-lucide="${iconClass}" class="w-4 h-4 text-${iconColor}-600"></i>
                        </div>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900 mb-2">${insight.title}</h3>
                        <p class="text-gray-600 text-sm mb-3">${insight.description}</p>
                        <div class="flex items-center justify-between">
                            <span class="bg-${badgeColor}-100 text-${badgeColor}-800 px-3 py-1 rounded-full text-xs font-medium">${insight.team}</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-16 bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${insight.confidence}%"></div>
                                </div>
                                <span class="text-sm font-medium text-gray-900">${insight.confidence}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            insightsContainer.appendChild(insightElement);
        });

        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    updateScatterPlot() {
        // Update scatter plot with dynamic opportunity data
        const opportunities = this.opportunitiesData.map(opp => ({
            name: opp.title,
            impact: opp.impact_score,
            timeSaved: opp.time_saved_hours,
            effort: opp.effort_level,
            color: opp.effort_level === 'low' ? 'green' : opp.effort_level === 'medium' ? 'yellow' : 'red',
            description: opp.description,
            benefits: opp.benefits
        }));

        // Store opportunities for scatter plot script
        window.dynamicOpportunities = opportunities;
        
        // Re-create scatter plot if function exists
        if (typeof createScatterPlot === 'function') {
            createScatterPlot();
        }
    }

    // Utility methods
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    setupClientSelector() {
        const clientSelector = document.getElementById('clientSelector');
        if (!clientSelector) return;

        // Set current selection
        if (this.isDemoMode) {
            clientSelector.value = 'demo';
        } else if (this.currentClient) {
            clientSelector.value = this.currentClient.id;
        }

        // Add event listener
        clientSelector.addEventListener('change', async (e) => {
            const selectedClientId = e.target.value;
            
            if (selectedClientId.startsWith('demo')) {
                await this.loadDemoDataForClient(selectedClientId);
                this.isDemoMode = true;
            } else {
                try {
                    await this.loadClientData(selectedClientId);
                    this.isDemoMode = false;
                } catch (error) {
                    this.showNotification('Error loading client data', 'error');
                    return;
                }
            }

            await this.loadAllData();
            this.updateUI();
            this.showNotification(`Switched to ${this.clientData.company_name}`, 'success');
        });
    }

    async loadAvailableClients() {
        try {
            const { data: clients, error } = await supabase
                .from(TABLES.CLIENTS)
                .select('id, company_name')
                .order('company_name');

            if (error) {
                throw new Error(error.message);
            }

            // Add demo clients to the list
            const demoClients = [
                { id: 'demo', company_name: 'Sterling & Associates (Demo)' },
                { id: 'demo-acme', company_name: 'Acme Corporation (Demo)' },
                { id: 'demo-techstart', company_name: 'TechStart Inc (Demo)' }
            ];

            return [...demoClients, ...(clients || [])];
        } catch (error) {
            console.error('Error loading clients:', error);
            // Return demo clients as fallback
            return [
                { id: 'demo', company_name: 'Sterling & Associates (Demo)' },
                { id: 'demo-acme', company_name: 'Acme Corporation (Demo)' },
                { id: 'demo-techstart', company_name: 'TechStart Inc (Demo)' }
            ];
        }
    }

    async updateClientSelector() {
        const clientSelector = document.getElementById('clientSelector');
        if (!clientSelector) return;

        const clients = await this.loadAvailableClients();
        
        // Clear existing options except demo
        clientSelector.innerHTML = '<option value="demo">Sterling & Associates (Demo)</option>';
        
        // Add client options
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.company_name;
            clientSelector.appendChild(option);
        });
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-black' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Export for use in other files
export default OverviewService;
