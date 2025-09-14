// Harbourview AI Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Set active navigation based on current page
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes(currentPage)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Team selector functionality
    const teamBtns = document.querySelectorAll('.team-btn');
    const painPointsContainer = document.getElementById('pain-points');

    const teamData = {
        litigation: {
            painPoints: [
                {
                    icon: 'alert-circle',
                    color: 'red',
                    title: 'Manual Document Review',
                    description: 'Hours spent reviewing contracts and case files manually'
                },
                {
                    icon: 'clock',
                    color: 'orange',
                    title: 'Client Communication Overhead',
                    description: 'Managing multiple client updates and scheduling conflicts'
                },
                {
                    icon: 'search',
                    color: 'yellow',
                    title: 'Case Research Time',
                    description: 'Lengthy research processes for case preparation'
                }
            ]
        },
        'client-services': {
            painPoints: [
                {
                    icon: 'phone',
                    color: 'red',
                    title: 'High Call Volume',
                    description: 'Managing 50+ client calls daily without automation'
                },
                {
                    icon: 'calendar',
                    color: 'orange',
                    title: 'Scheduling Conflicts',
                    description: 'Double bookings and missed appointments'
                },
                {
                    icon: 'message-circle',
                    color: 'yellow',
                    title: 'Follow-up Management',
                    description: 'Tracking client follow-ups across multiple channels'
                }
            ]
        },
        operations: {
            painPoints: [
                {
                    icon: 'file-text',
                    color: 'red',
                    title: 'Manual Data Entry',
                    description: 'Repetitive data entry tasks consuming 6+ hours daily'
                },
                {
                    icon: 'bar-chart',
                    color: 'orange',
                    title: 'Report Generation',
                    description: 'Weekly reports created manually from multiple sources'
                },
                {
                    icon: 'users',
                    color: 'yellow',
                    title: 'Resource Allocation',
                    description: 'Manual tracking of team capacity and project assignments'
                }
            ]
        },
        research: {
            painPoints: [
                {
                    icon: 'book-open',
                    color: 'red',
                    title: 'Case Law Research',
                    description: 'Manual searching through legal databases and precedents'
                },
                {
                    icon: 'database',
                    color: 'orange',
                    title: 'Document Analysis',
                    description: 'Reviewing large volumes of case documents manually'
                },
                {
                    icon: 'clock',
                    color: 'yellow',
                    title: 'Citation Management',
                    description: 'Manual formatting and verification of legal citations'
                }
            ]
        }
    };

    teamBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const team = this.getAttribute('data-team');
            
            // Remove active class from all team buttons
            teamBtns.forEach(teamBtn => teamBtn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update pain points
            updatePainPoints(team);
        });
    });

    function updatePainPoints(team) {
        const data = teamData[team];
        if (!data) return;

        painPointsContainer.innerHTML = data.painPoints.map(point => `
            <div class="flex items-start p-4 bg-${point.color}-50 rounded-lg border-l-4 border-${point.color}-400 slide-in">
                <div class="text-${point.color}-600 mr-3 mt-1">
                    <i data-lucide="${point.icon}" class="w-4 h-4"></i>
                </div>
                <div>
                    <div class="font-medium text-gray-900">${point.title}</div>
                    <div class="text-sm text-gray-600">${point.description}</div>
                </div>
            </div>
        `).join('');

        // Re-initialize icons for new content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Simulate chat functionality
    const chatInput = document.querySelector('input[placeholder="Ask about team insights..."]');
    const chatContainer = document.querySelector('.bg-gray-50.rounded-lg.p-4.h-32');

    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }

    function sendChatMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'bg-blue-100 rounded p-2 max-w-xs mb-2';
        userMessage.textContent = message;
        chatContainer.appendChild(userMessage);

        // Clear input
        chatInput.value = '';

        // Simulate AI response
        setTimeout(() => {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'bg-gray-100 rounded p-2 max-w-xs ml-auto mb-2';
            aiMessage.textContent = getAIResponse(message);
            chatContainer.appendChild(aiMessage);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 1000);
    }

    function getAIResponse(message) {
        const responses = [
            "Based on our analysis, this is a common challenge across teams. Would you like to see specific solutions?",
            "This aligns with the pain points we identified. I can show you the opportunities we've found.",
            "Great question! Let me pull up the relevant data from our discovery interviews.",
            "This is exactly what our AI solutions are designed to address. Would you like to see the implementation plan?",
            "Based on the team interviews, this is a high-priority area for improvement."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states for better UX
    function showLoading(element) {
        element.innerHTML = '<div class="flex items-center justify-center p-4"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div></div>';
    }

    // Initialize tooltips (if needed)
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                // Tooltip implementation would go here
            });
        });
    }

    // Opportunity modal functionality
    window.openOpportunityModal = function(opportunityId) {
        const modal = document.getElementById('opportunityModal');
        const opportunityData = getOpportunityData(opportunityId);
        
        // Update modal content
        document.getElementById('modalTitle').textContent = opportunityData.title;
        document.getElementById('modalSubtitle').textContent = opportunityData.subtitle;
        document.getElementById('modalDescription').textContent = opportunityData.description;
        document.getElementById('modalTimeline').textContent = opportunityData.timeline;
        document.getElementById('modalEffort').textContent = opportunityData.effort;
        document.getElementById('modalHours').textContent = opportunityData.hours;
        document.getElementById('modalROI').textContent = opportunityData.roi;
        
        // Update teams
        const teamsContainer = document.getElementById('modalTeams');
        teamsContainer.innerHTML = opportunityData.teams.map(team => 
            `<span class="px-3 py-1 ${team.color} text-sm rounded-full">${team.name}</span>`
        ).join('');
        
        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    };

    window.closeOpportunityModal = function() {
        const modal = document.getElementById('opportunityModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    function getOpportunityData(opportunityId) {
        const data = {
            'doc-review': {
                title: 'Document Review Automation',
                subtitle: 'AI-powered contract analysis',
                description: 'Implement AI-powered document review system to automatically analyze contracts, identify key terms, flag potential issues, and generate summary reports. This solution will significantly reduce manual review time while improving accuracy.',
                timeline: '4-6 weeks',
                effort: 'Low',
                hours: '15 hrs/week',
                roi: '3 months',
                teams: [
                    { name: 'Litigation', color: 'bg-blue-100 text-blue-800' },
                    { name: 'Research', color: 'bg-green-100 text-green-800' }
                ]
            },
            'client-bot': {
                title: 'Client Communication Bot',
                subtitle: 'Automated scheduling and Q&A',
                description: 'Deploy an intelligent chatbot to handle client inquiries, schedule appointments, and provide instant responses to common questions. This will free up staff time for more complex client interactions.',
                timeline: '6-8 weeks',
                effort: 'Medium',
                hours: '8 hrs/week',
                roi: '4 months',
                teams: [
                    { name: 'Client Services', color: 'bg-purple-100 text-purple-800' }
                ]
            },
            'research-assistant': {
                title: 'Case Research Assistant',
                subtitle: 'AI-powered legal research',
                description: 'Implement AI-powered research tools that can quickly analyze case law, identify relevant precedents, and generate comprehensive research reports. This will dramatically speed up case preparation.',
                timeline: '8-10 weeks',
                effort: 'Medium',
                hours: '12 hrs/week',
                roi: '5 months',
                teams: [
                    { name: 'Litigation', color: 'bg-blue-100 text-blue-800' },
                    { name: 'Research', color: 'bg-green-100 text-green-800' }
                ]
            },
            'report-gen': {
                title: 'Automated Report Generation',
                subtitle: 'Weekly client and internal reports',
                description: 'Create automated systems to generate client progress reports, internal analytics, and compliance documents. This eliminates manual report creation and ensures consistency.',
                timeline: '3-4 weeks',
                effort: 'Low',
                hours: '6 hrs/week',
                roi: '2 months',
                teams: [
                    { name: 'Operations', color: 'bg-orange-100 text-orange-800' },
                    { name: 'Client Services', color: 'bg-purple-100 text-purple-800' }
                ]
            },
            'doc-search': {
                title: 'Intelligent Document Search',
                subtitle: 'Semantic search across case files',
                description: 'Implement semantic search capabilities that allow lawyers to find relevant documents using natural language queries. This will significantly improve document discovery and case preparation efficiency.',
                timeline: '6-8 weeks',
                effort: 'Medium',
                hours: '10 hrs/week',
                roi: '4 months',
                teams: [
                    { name: 'Litigation', color: 'bg-blue-100 text-blue-800' },
                    { name: 'Research', color: 'bg-green-100 text-green-800' },
                    { name: 'Operations', color: 'bg-orange-100 text-orange-800' }
                ]
            }
        };
        
        return data[opportunityId] || data['doc-review'];
    }

    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('opportunityModal');
        if (e.target === modal) {
            closeOpportunityModal();
        }
    });

    // Simulator functionality
    const opportunityCheckboxes = document.querySelectorAll('.opportunity-checkbox');
    const teamHours = {
        'litigation': 0,
        'client-services': 0,
        'research': 0,
        'operations': 0
    };

    opportunityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSimulator);
    });

    function updateSimulator() {
        // Reset team hours
        Object.keys(teamHours).forEach(team => {
            teamHours[team] = 0;
        });

        let totalHours = 0;
        let selectedCount = 0;
        let totalCost = 0;
        let totalValue = 0;

        opportunityCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const hours = parseInt(checkbox.dataset.hours);
                const teams = checkbox.dataset.teams.split(',');
                
                totalHours += hours;
                selectedCount++;
                
                // Distribute hours across teams
                teams.forEach(team => {
                    teamHours[team] += Math.round(hours / teams.length);
                });

                // Calculate costs and values
                totalCost += hours * 50; // $50 per hour saved
                totalValue += hours * 100; // $100 value per hour saved
            }
        });

        // Update UI
        document.getElementById('totalHours').textContent = totalHours;
        document.getElementById('selectedCount').textContent = selectedCount;
        document.getElementById('roiMonths').textContent = selectedCount > 0 ? Math.ceil(selectedCount * 1.5) : 0;

        // Update team hours
        document.getElementById('litigation-hours').textContent = teamHours['litigation'];
        document.getElementById('client-services-hours').textContent = teamHours['client-services'];
        document.getElementById('research-hours').textContent = teamHours['research'];
        document.getElementById('operations-hours').textContent = teamHours['operations'];

        // Update cost-benefit analysis
        document.getElementById('impl-cost').textContent = `$${totalCost.toLocaleString()}`;
        document.getElementById('training-cost').textContent = `$${Math.round(totalCost * 0.2).toLocaleString()}`;
        document.getElementById('maintenance-cost').textContent = `$${Math.round(totalCost * 0.1).toLocaleString()}`;
        document.getElementById('total-cost').textContent = `$${Math.round(totalCost * 1.3).toLocaleString()}`;

        document.getElementById('time-value').textContent = `$${totalValue.toLocaleString()}`;
        document.getElementById('efficiency-value').textContent = `$${Math.round(totalValue * 0.3).toLocaleString()}`;
        document.getElementById('error-value').textContent = `$${Math.round(totalValue * 0.2).toLocaleString()}`;
        document.getElementById('total-value').textContent = `$${Math.round(totalValue * 1.5).toLocaleString()}`;

        const netROI = totalCost > 0 ? Math.round(((totalValue * 1.5 - totalCost * 1.3) / (totalCost * 1.3)) * 100) : 0;
        document.getElementById('net-roi').textContent = `${netROI}%`;

        // Update team impact cards with visual feedback
        updateTeamImpactCards();
    }

    function updateTeamImpactCards() {
        const maxHours = Math.max(...Object.values(teamHours));
        
        Object.keys(teamHours).forEach(team => {
            const card = document.querySelector(`[data-team="${team}"]`);
            const hours = teamHours[team];
            
            if (hours > 0) {
                const intensity = maxHours > 0 ? hours / maxHours : 0;
                const opacity = 0.3 + (intensity * 0.7);
                card.style.backgroundColor = `rgba(20, 184, 166, ${opacity})`;
                card.style.transform = 'scale(1.05)';
            } else {
                card.style.backgroundColor = '';
                card.style.transform = 'scale(1)';
            }
        });
    }

    window.resetSimulator = function() {
        opportunityCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        updateSimulator();
    };

    // Initialize everything
    initTooltips();
    
    console.log('Harbourview AI Dashboard initialized successfully');
});
