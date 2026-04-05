// =============================================
// ULTRA-PROFESSIONAL CAREER INSIGHTS
// Company-Level Accuracy & Unique Features
// =============================================

// API_BASE set globally by config.js

let salaryChart = null;
let careerData = null;

// ==================== DATA TRANSFORMATION ====================

function transformBackendData(backendData, userProfile) {
    const salary = backendData.salaryEstimate || {};
    const topSkills = backendData.topSkills || [];

    // User's typed skills that match required skills (from BERT if available)
    const bert = backendData.bertSkillGap;
    const matchingSkills = bert ? bert.matched.concat(bert.partial) : (userProfile.skills || []);
    const missingSkills  = bert ? bert.missing : topSkills.slice(0, 5).map(s => s.name);

    return {
        userProfile: userProfile,
        roleAnalysis: {
            avgExperience: userProfile.experience,
            avgSalary: Math.round((salary.average || 0) / 100000)
        },
        salaryInsights: {
            median: Math.round((salary.average || 0) / 100000),
            min:    Math.round((salary.minimum || 0) / 100000),
            max:    Math.round((salary.maximum || 0) / 100000),
            forYourExperience: Math.round((salary.forYourExperience || salary.average || 0) / 100000),
            byExperience: [4, 8, 15, 25]
        },
        skillsAnalysis: {
            matchingSkills,
            missingSkills,
            requiredSkills: topSkills.map(s => s.name),
            recommendedCertifications: ['AWS Certified', 'Google Cloud Professional', 'Azure Developer']
        },
        marketInsights: {
            demandScore:        backendData.marketDemand === 'Very High' ? 90 : backendData.marketDemand === 'High' ? 75 : 60,
            growthRate:         backendData.growthPotential || 20,
            topCities:          ['Bangalore', 'Mumbai', 'Delhi NCR'],
            locationMultiplier: 1.5
        },
        topMatchingRoles: generateTopRoles(userProfile, backendData),
        topSkills:   topSkills,
        insights:    backendData.insights || [],
        aiInsights:  backendData.aiInsights  || null,
        bertSkillGap: backendData.bertSkillGap || null
    };
}

function generateTopRoles(userProfile, backendData) {
    // Generate related roles based on the selected role
    const relatedRolesMap = {
        'Software Engineer': [
            { title: 'Full Stack Developer', matchScore: 92, exp: '2-5 years', openings: 245 },
            { title: 'Backend Developer', matchScore: 88, exp: '2-4 years', openings: 189 },
            { title: 'Frontend Developer', matchScore: 85, exp: '2-4 years', openings: 156 }
        ],
        'Full Stack Developer': [
            { title: 'Software Engineer', matchScore: 94, exp: '2-5 years', openings: 312 },
            { title: 'Tech Lead', matchScore: 87, exp: '5-8 years', openings: 98 },
            { title: 'Solution Architect', matchScore: 82, exp: '6-10 years', openings: 67 }
        ],
        'Data Scientist': [
            { title: 'ML Engineer', matchScore: 93, exp: '3-6 years', openings: 178 },
            { title: 'Data Analyst', matchScore: 88, exp: '2-5 years', openings: 234 },
            { title: 'AI Researcher', matchScore: 85, exp: '4-8 years', openings: 89 }
        ],
        'DevOps Engineer': [
            { title: 'Cloud Architect', matchScore: 91, exp: '4-7 years', openings: 156 },
            { title: 'SRE Engineer', matchScore: 89, exp: '3-6 years', openings: 134 },
            { title: 'Infrastructure Engineer', matchScore: 86, exp: '3-5 years', openings: 112 }
        ]
    };

    const roles = relatedRolesMap[userProfile.targetRole] || relatedRolesMap['Software Engineer'];
    
    const avgSalary = backendData.salaryEstimate.average / 100000;
    
    return roles.map(role => ({
        ...role,
        salaryRange: {
            min: Math.round(avgSalary * 0.8),
            max: Math.round(avgSalary * 1.3)
        }
    }));
}

// ==================== MAIN ANALYSIS FUNCTION ====================

async function analyzeCareer() {
    // Validate inputs
    const targetRole = document.getElementById('targetRole').value;
    const experienceYears = document.getElementById('experience').value;
    const education = document.getElementById('education').value;
    const skills = document.getElementById('skills').value;
    const location = document.getElementById('location').value;
    const expectedSalary = document.getElementById('expectedSalary').value;

    if (!targetRole || !experienceYears || !location) {
        showNotification('Please fill in Role, Experience, and Location', 'error');
        return;
    }

    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');

    try {
        // Map role to backend format (lowercase with hyphens)
        const roleMap = {
            'Software Engineer': 'software-engineer',
            'Full Stack Developer': 'full-stack-developer',
            'Frontend Developer': 'frontend-developer',
            'Backend Developer': 'backend-developer',
            'DevOps Engineer': 'devops-engineer',
            'Data Scientist': 'data-scientist',
            'Data Analyst': 'data-scientist',
            'ML Engineer': 'ml-engineer',
            'Product Manager': 'product-manager',
            'UI/UX Designer': 'ui-ux-designer',
            'Cloud Architect': 'devops-engineer',
            'Mobile Developer': 'software-engineer'
        };

        // Map experience to backend format
        const exp = parseInt(experienceYears);
        let experienceRange;
        if (exp <= 1) experienceRange = '0-1';
        else if (exp <= 3) experienceRange = '1-3';
        else if (exp <= 5) experienceRange = '3-5';
        else if (exp <= 8) experienceRange = '5-8';
        else experienceRange = '8+';

        // Prepare backend request — matches new careerInsightsController
        const requestData = {
            role:       roleMap[targetRole] || 'software-engineer',
            experience: experienceRange,
            location:   location.toLowerCase(),
            skills:     skills || ''
        };

        console.log('🎯 Analyzing career data:', requestData);

        // Fetch career insights from backend
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/career/insights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch career insights');
        }

        const backendData = await response.json();
        console.log('✅ Career insights received:', backendData);

        // Transform new backend response → legacy frontend format
        careerData = transformBackendData(backendData, {
            targetRole,
            experience: exp,
            education,
            skills: skills ? skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
            location,
            expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null
        });

        // Display results
        displayResults(careerData);

        // Show results section
        document.getElementById('resultsSection').classList.add('active');
        
        // Scroll to results
        setTimeout(() => {
            document.getElementById('resultsSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 300);

    } catch (error) {
        console.error('❌ Career analysis error:', error);
        showNotification(error.message || 'Failed to analyze career data. Please try again.', 'error');
    } finally {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
}

// ==================== DISPLAY RESULTS ====================

function displayResults(data) {
    // 1. CAREER MATCH CARD
    const matchScore = calculateMatchScore(data);
    displayMatchCard(matchScore, data);

    // 2. KEY METRICS
    displayMetrics(data);

    // 3. SALARY COMPARISON CHART
    displaySalaryChart(data);

    // 4. TOP MATCHING ROLES
    displayTopRoles(data);

    // 5. RECOMMENDATIONS
    displayRecommendations(data);

    // 6. GROQ AI INSIGHTS (if available)
    if (data.aiInsights) renderAIInsights(data.aiInsights);

    // 7. BERT SKILL GAP (if available)
    if (data.bertSkillGap) renderBertGap(data.bertSkillGap);
}

// ==================== MATCH SCORE CALCULATION ====================

function calculateMatchScore(data) {
    // Calculate based on multiple factors
    let score = 0;
    
    // Experience match (30%)
    const expDiff = Math.abs(data.userProfile.experience - data.roleAnalysis.avgExperience);
    const expScore = Math.max(0, 100 - (expDiff * 10));
    score += expScore * 0.3;
    
    // Skills match (40%)
    const skillsMatch = data.skillsAnalysis.matchingSkills.length;
    const totalRequired = data.skillsAnalysis.requiredSkills.length;
    const skillScore = totalRequired > 0 ? (skillsMatch / totalRequired) * 100 : 0;
    score += skillScore * 0.4;
    
    // Salary alignment (20%)
    if (data.userProfile.expectedSalary) {
        const salaryDiff = Math.abs(data.userProfile.expectedSalary - data.salaryInsights.median);
        const salaryScore = Math.max(0, 100 - (salaryDiff / data.salaryInsights.median * 100));
        score += salaryScore * 0.2;
    } else {
        score += 80 * 0.2; // Default if no salary expectation
    }
    
    // Market demand (10%)
    score += data.marketInsights.demandScore * 0.1;
    
    return Math.round(score);
}

// ==================== MATCH CARD DISPLAY ====================

function displayMatchCard(matchScore, data) {
    const matchCard = document.getElementById('matchCard');
    const scoreEl = document.getElementById('matchScore');
    const labelEl = document.getElementById('matchLabel');
    const descEl = document.getElementById('matchDescription');

    // Animate score
    animateNumber(0, matchScore, scoreEl, '%');

    // Set color and label based on score
    let color, colorDark, label, description;
    
    if (matchScore >= 85) {
        color = '#10B981';
        colorDark = '#059669';
        label = 'EXCELLENT MATCH';
        description = `Outstanding fit! Your profile aligns excellently with ${data.userProfile.targetRole} requirements. You're highly competitive in the current market.`;
    } else if (matchScore >= 70) {
        color = '#6366F1';
        colorDark = '#4F46E5';
        label = 'STRONG MATCH';
        description = `Great fit! You have most of the required skills for ${data.userProfile.targetRole}. A few improvements will make you highly competitive.`;
    } else if (matchScore >= 55) {
        color = '#06B6D4';
        colorDark = '#0891B2';
        label = 'GOOD MATCH';
        description = `Decent fit for ${data.userProfile.targetRole}. Focus on acquiring key missing skills to improve your marketability.`;
    } else {
        color = '#F59E0B';
        colorDark = '#D97706';
        label = 'NEEDS WORK';
        description = `You have foundational skills, but significant upskilling is needed for ${data.userProfile.targetRole}. Review our recommendations below.`;
    }

    matchCard.style.setProperty('--match-color', color);
    matchCard.style.setProperty('--match-color-dark', colorDark);
    labelEl.textContent = label;
    labelEl.style.color = color;
    descEl.textContent = description;
}

// ==================== METRICS DISPLAY ====================

function displayMetrics(data) {
    // Average Salary (already in LPA from transformation)
    const avgSalary = data.salaryInsights.median;
    animateNumber(0, avgSalary, document.getElementById('avgSalary'), '₹', 'L');

    // Market Demand Score
    const demandScore = data.marketInsights.demandScore;
    animateNumber(0, demandScore, document.getElementById('demandScore'), '', '/100');

    // Skill Match Percentage
    const matchingCount = data.skillsAnalysis.matchingSkills.length;
    const requiredCount = data.skillsAnalysis.requiredSkills.length;
    const skillMatch = requiredCount > 0 ? Math.round((matchingCount / requiredCount) * 100) : 50;
    animateNumber(0, skillMatch, document.getElementById('skillMatch'), '', '%');

    // Growth Rate
    const growthRate = data.marketInsights.growthRate;
    const sign = growthRate > 0 ? '+' : '';
    const growthEl = document.getElementById('growthRate');
    
    // Animate to absolute value first
    let currentVal = 0;
    const increment = growthRate / 60;
    const timer = setInterval(() => {
        currentVal += increment;
        if ((increment > 0 && currentVal >= growthRate) || (increment < 0 && currentVal <= growthRate)) {
            currentVal = growthRate;
            clearInterval(timer);
        }
        growthEl.textContent = `${sign}${Math.round(currentVal)}%`;
    }, 16);
}

// ==================== SALARY CHART ====================

function displaySalaryChart(data) {
    const ctx = document.getElementById('salaryChart').getContext('2d');
    
    // Destroy existing chart
    if (salaryChart) {
        salaryChart.destroy();
    }

    // Prepare data
    const experienceLevels = ['0-2 years', '3-5 years', '6-10 years', '10+ years'];
    
    // Use salary progression based on backend data
    const baseSalary = data.salaryInsights.median;
    const avgSalaries = [
        Math.round(baseSalary * 0.4),  // Entry level (40% of median)
        Math.round(baseSalary * 0.7),  // Mid level (70% of median)
        Math.round(baseSalary * 1.0),  // Senior (100% = median)
        Math.round(baseSalary * 1.5)   // Lead/Principal (150% of median)
    ];
    
    const yourLevel = Math.min(3, Math.floor(data.userProfile.experience / 3));
    const yourSalary = data.userProfile.expectedSalary || avgSalaries[yourLevel];

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');

    salaryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: experienceLevels,
            datasets: [
                {
                    label: 'Market Average (₹ LPA)',
                    data: avgSalaries,
                    borderColor: '#10B981',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8
                },
                {
                    label: 'Your Expectation (₹ LPA)',
                    data: experienceLevels.map((_, i) => i === yourLevel ? yourSalary : null),
                    borderColor: '#6366F1',
                    backgroundColor: '#6366F1',
                    borderWidth: 0,
                    pointRadius: 10,
                    pointStyle: 'star',
                    pointBorderWidth: 3,
                    pointBorderColor: '#fff'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#CBD5E1',
                        font: {
                            family: 'Archivo',
                            size: 14,
                            weight: '600'
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 26, 0.95)',
                    titleColor: '#F9FAFB',
                    bodyColor: '#CBD5E1',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            if (context.parsed.y === null) return '';
                            return context.dataset.label + ': ₹' + context.parsed.y + ' LPA';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#9CA3AF',
                        font: {
                            family: 'JetBrains Mono',
                            size: 12
                        },
                        callback: function(value) {
                            return '₹' + value + 'L';
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#9CA3AF',
                        font: {
                            family: 'Archivo',
                            size: 12,
                            weight: '600'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ==================== TOP ROLES DISPLAY ====================

function displayTopRoles(data) {
    const rolesGrid = document.getElementById('rolesGrid');
    const topRoles = data.topMatchingRoles || [];

    if (topRoles.length === 0) {
        rolesGrid.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">No matching roles found</div>';
        return;
    }

    rolesGrid.innerHTML = topRoles.map((role, index) => `
        <div class="role-card">
            <div class="role-rank">#${index + 1}</div>
            <div class="role-title">${role.title}</div>
            <div class="role-match">${role.matchScore}% Match</div>
            <div class="role-details">
                <div class="role-detail">
                    <span class="role-detail-icon">💰</span>
                    <span>₹${role.salaryRange.min}L - ₹${role.salaryRange.max}L</span>
                </div>
                <div class="role-detail">
                    <span class="role-detail-icon">📊</span>
                    <span>${role.openings} openings in ${data.userProfile.location}</span>
                </div>
                <div class="role-detail">
                    <span class="role-detail-icon">🎯</span>
                    <span>${role.requiredExperience} years experience</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== RECOMMENDATIONS DISPLAY ====================

function displayRecommendations(data) {
    const container = document.getElementById('recommendationsList');
    const recommendations = generateRecommendations(data);

    container.innerHTML = recommendations.map(rec => {
        const colorMap = {
            high: '#EF4444',
            medium: '#F59E0B',
            low: '#10B981'
        };
        
        return `
            <div class="recommendation-item" style="--rec-color: ${colorMap[rec.priority]};">
                <span class="rec-priority ${rec.priority}">${rec.priority} priority</span>
                <div class="rec-text">${rec.text}</div>
            </div>
        `;
    }).join('');
}

// ==================== GENERATE RECOMMENDATIONS ====================

function generateRecommendations(data) {
    const recommendations = [];
    
    // Skill gaps
    const missingSkills = data.skillsAnalysis.missingSkills || [];
    if (missingSkills.length > 0) {
        recommendations.push({
            priority: 'high',
            text: `Learn these in-demand skills: ${missingSkills.slice(0, 5).join(', ')}. These will significantly boost your market value.`
        });
    }

    // Experience gap
    const expDiff = data.roleAnalysis.avgExperience - data.userProfile.experience;
    if (expDiff > 2) {
        recommendations.push({
            priority: 'high',
            text: `Gain ${Math.ceil(expDiff)} more years of relevant experience or build ${Math.ceil(expDiff * 2)} substantial projects to compensate.`
        });
    } else if (expDiff < -2) {
        recommendations.push({
            priority: 'medium',
            text: `You're overqualified for entry-level positions. Consider senior or lead roles that match your ${data.userProfile.experience} years of experience.`
        });
    }

    // Salary expectations
    if (data.userProfile.expectedSalary) {
        const salaryDiff = data.userProfile.expectedSalary - data.salaryInsights.median;
        const percentage = (salaryDiff / data.salaryInsights.median) * 100;
        
        if (percentage > 30) {
            recommendations.push({
                priority: 'medium',
                text: `Your salary expectation (₹${data.userProfile.expectedSalary}L) is ${Math.round(percentage)}% above market average (₹${data.salaryInsights.median}L). This may limit opportunities.`
            });
        } else if (percentage < -20) {
            recommendations.push({
                priority: 'low',
                text: `You're undervaluing yourself! Market average is ₹${data.salaryInsights.median}L, but you expect ₹${data.userProfile.expectedSalary}L. Aim higher!`
            });
        }
    }

    // Certifications
    if (data.skillsAnalysis.recommendedCertifications) {
        recommendations.push({
            priority: 'medium',
            text: `Get certified: ${data.skillsAnalysis.recommendedCertifications.slice(0, 3).join(', ')}. These certifications are highly valued by employers.`
        });
    }

    // Market trends
    if (data.marketInsights.growthRate > 15) {
        recommendations.push({
            priority: 'low',
            text: `Excellent timing! ${data.userProfile.targetRole} market is growing at ${data.marketInsights.growthRate}% YoY. Demand is high.`
        });
    } else if (data.marketInsights.growthRate < 0) {
        recommendations.push({
            priority: 'high',
            text: `Warning: ${data.userProfile.targetRole} market is declining (${data.marketInsights.growthRate}%). Consider pivoting to related high-growth roles.`
        });
    }

    // Location-specific
    if (data.marketInsights.topCities && !data.marketInsights.topCities.includes(data.userProfile.location)) {
        recommendations.push({
            priority: 'medium',
            text: `Consider relocating to ${data.marketInsights.topCities[0]} or ${data.marketInsights.topCities[1]} for more opportunities (${data.marketInsights.locationMultiplier}x more jobs).`
        });
    }

    // Portfolio
    recommendations.push({
        priority: 'low',
        text: `Build a strong portfolio with 5-8 projects showcasing ${missingSkills.slice(0, 3).join(', ')}. Deploy on GitHub with detailed documentation.`
    });

    return recommendations;
}

// ==================== GROQ AI INSIGHTS CARD ====================

function renderAIInsights(ins) {
    const existing = document.getElementById('aiInsightsCard');
    if (existing) existing.remove();
    if (!ins) return;

    const rc = ins.readinessScore >= 70 ? '#10B981' : ins.readinessScore >= 40 ? '#F59E0B' : '#EF4444';

    const card = document.createElement('div');
    card.id = 'aiInsightsCard';
    card.style.cssText = 'background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#0f2744 100%);border:1px solid rgba(99,102,241,0.35);border-radius:20px;padding:28px 32px;margin-top:28px;color:#e0e7ff;';

    card.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;">'
        + '<span style="font-size:12px;font-weight:700;color:#a78bfa;background:rgba(139,92,246,0.2);padding:4px 14px;border-radius:20px;">🤖 AI COACH · Llama-3.3-70b</span>'
        + '<div style="margin-left:auto;display:flex;align-items:center;gap:8px;">'
        + '<span style="font-size:12px;color:#94a3b8;">Market Readiness</span>'
        + '<span style="font-size:24px;font-weight:800;color:' + rc + ';">' + ins.readinessScore + '%</span>'
        + '<span style="font-size:11px;color:' + rc + ';background:rgba(255,255,255,0.08);padding:2px 9px;border-radius:12px;">' + ins.readinessLabel + '</span>'
        + '</div></div>'
        + '<h3 style="font-size:18px;font-weight:700;color:#f0f4ff;margin:0 0 10px;">&ldquo;' + ins.headline + '&rdquo;</h3>'
        + '<p style="font-size:13px;line-height:1.75;color:#c7d2fe;margin:0 0 16px;">' + ins.marketSummary + '</p>'
        + '<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:10px;padding:12px 16px;margin-bottom:16px;">'
        + '<span style="font-size:11px;color:#6ee7b7;text-transform:uppercase;letter-spacing:.7px;">💰 Salary Verdict &nbsp;</span>'
        + '<span style="font-size:13px;color:#d1fae5;">' + ins.salaryVerdict + '</span></div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">'
        + '<div style="background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:10px;padding:12px;">'
        + '<div style="font-size:10px;color:#6ee7b7;text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px;">💪 Competitive Edge</div>'
        + '<div style="font-size:12px;color:#d1fae5;">' + ins.competitiveEdge + '</div></div>'
        + '<div style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);border-radius:10px;padding:12px;">'
        + '<div style="font-size:10px;color:#fca5a5;text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px;">⚠️ Biggest Gap</div>'
        + '<div style="font-size:12px;color:#fef2f2;">' + ins.biggestGap + '</div></div></div>'
        + (ins.topPrioritySkill ? '<div style="background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.4);border-radius:10px;padding:13px;margin-bottom:16px;">'
        + '<div style="font-size:10px;color:#818cf8;text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px;">🎯 #1 Skill to Learn Next</div>'
        + '<div style="display:flex;align-items:center;gap:10px;">'
        + '<span style="font-size:15px;font-weight:700;color:#e0e7ff;">' + ins.topPrioritySkill.skill + '</span>'
        + '<span style="font-size:11px;color:#94a3b8;background:rgba(255,255,255,0.07);padding:2px 8px;border-radius:8px;">~' + ins.topPrioritySkill.estimatedWeeks + ' weeks</span></div>'
        + '<div style="font-size:12px;color:#a5b4fc;margin-top:4px;">' + ins.topPrioritySkill.reason + '</div></div>' : '')
        + '<div style="background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);border-radius:10px;padding:13px;margin-bottom:14px;">'
        + '<div style="font-size:10px;color:#67e8f9;text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px;">⚡ Your Week-1 Action</div>'
        + '<div style="font-size:13px;font-weight:600;color:#cffafe;">' + ins.weekOneAction + '</div></div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;color:#c7d2fe;margin-bottom:10px;">'
        + '<div><span style="color:#a5b4fc;">📍 Location: </span>' + ins.locationInsight + '</div>'
        + '<div><span style="color:#a5b4fc;">🚀 Next step: </span>' + ins.careerTrajectory + '</div></div>'
        + (ins.hiddenOpportunity ? '<div style="font-size:12px;color:#c7d2fe;"><span style="color:#f9a8d4;">💡 Hidden opportunity: </span>' + ins.hiddenOpportunity + '</div>' : '');

    // Append after recommendations section
    const recSection = document.getElementById('recommendationsList') || document.getElementById('resultsSection');
    if (recSection) recSection.closest('.results-section, #resultsSection')
        ? recSection.parentElement.appendChild(card)
        : recSection.appendChild(card);
    else document.getElementById('resultsSection').appendChild(card);
}

// ==================== BERT SKILL GAP CARD ====================

function renderBertGap(bert) {
    const existing = document.getElementById('bertGapCard');
    if (existing) existing.remove();
    if (!bert || (!bert.matched.length && !bert.partial.length && !bert.missing.length)) return;

    const card = document.createElement('div');
    card.id = 'bertGapCard';
    card.style.cssText = 'background:#fff;border:1px solid #E5E7EB;border-radius:20px;padding:24px 28px;margin-top:20px;';

    let html = '<div style="font-size:15px;font-weight:700;color:#1e1b4b;margin-bottom:16px;">🧠 BERT Semantic Skill Gap</div>'
        + '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;">';

    if (bert.matched.length)
        html += '<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:12px 16px;flex:1;min-width:100px;text-align:center;">'
        + '<div style="font-size:10px;color:#16a34a;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;">✅ Already Know</div>'
        + '<div style="font-size:24px;font-weight:800;color:#10B981;">' + bert.matched.length + '</div>'
        + '<div style="font-size:11px;color:#6B7280;">matched</div></div>';

    if (bert.partial.length)
        html += '<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:12px 16px;flex:1;min-width:100px;text-align:center;">'
        + '<div style="font-size:10px;color:#d97706;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;">⚡ Partial</div>'
        + '<div style="font-size:24px;font-weight:800;color:#F59E0B;">' + bert.partial.length + '</div>'
        + '<div style="font-size:11px;color:#6B7280;">to top-up</div></div>';

    if (bert.missing.length)
        html += '<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:12px 16px;flex:1;min-width:100px;text-align:center;">'
        + '<div style="font-size:10px;color:#dc2626;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;">📚 To Learn</div>'
        + '<div style="font-size:24px;font-weight:800;color:#EF4444;">' + bert.missing.length + '</div>'
        + '<div style="font-size:11px;color:#6B7280;">new skills</div></div>';

    html += '</div>';

    if (bert.missing.length) {
        html += '<div style="margin-bottom:14px;"><div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">Skills to acquire</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        bert.missing.forEach(s => {
            html += '<span style="background:#FEF2F2;border:1px solid #FECACA;color:#dc2626;border-radius:8px;padding:3px 10px;font-size:12px;font-weight:600;">' + s + '</span>';
        });
        html += '</div></div>';
    }

    const pairs = (bert.semanticPairs || []).slice(0, 5);
    if (pairs.length) {
        html += '<div style="background:#F9FAFB;border-radius:10px;padding:12px 14px;">'
        + '<div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Semantic matches · your skill → required · similarity</div>';
        pairs.forEach(p => {
            html += '<div style="display:flex;align-items:center;gap:8px;font-size:12px;padding:4px 0;border-bottom:1px solid #F3F4F6;">'
            + '<span style="color:#10B981;min-width:90px;overflow:hidden;text-overflow:ellipsis;">' + p.matched + '</span>'
            + '<span style="color:#9CA3AF;">→</span>'
            + '<span style="color:#374151;flex:1;">' + p.required + '</span>'
            + '<span style="color:' + (p.partial ? '#F59E0B' : '#10B981') + ';font-weight:700;background:' + (p.partial ? '#FFFBEB' : '#F0FDF4') + ';border-radius:8px;padding:1px 8px;">' + p.score + '%' + (p.partial ? ' ~' : '') + '</span></div>';
        });
        html += '</div>';
    }

    card.innerHTML = html;
    const aiCard = document.getElementById('aiInsightsCard');
    if (aiCard) aiCard.insertAdjacentElement('afterend', card);
    else document.getElementById('resultsSection').appendChild(card);
}

// ==================== HELPER FUNCTIONS ====================

function animateNumber(start, end, element, prefix = '', suffix = '') {
    const duration = 1500;
    const increment = (end - start) / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = `${prefix}${Math.round(current)}${suffix}`;
    }, 16);
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#6366F1'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${colors[type]};
        color: white;
        padding: 18px 28px;
        border-radius: 14px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 700;
        font-size: 15px;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Initialize
console.log('🚀 Ultra-Professional Career Insights loaded successfully!');