// Career Readiness Score Calculator - WITH CGPA/GPA

// Update slider display values
function updateSlider(slider, displayId, suffix = '', decimals = 0) {
    const display = document.getElementById(displayId);
    if (display) {
        const value = decimals > 0 ? parseFloat(slider.value).toFixed(decimals) : Math.round(slider.value);
        display.textContent = value + suffix;
    }
}

// Calculate Readiness Score
function calculate() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('show');

    setTimeout(() => {
        // Get all form values
        
        // 1. EDUCATION (20% weight) - NOW INCLUDES CGPA!
        const cgpa = parseFloat(document.getElementById('cgpaSlider').value);
        const educationDegree = parseInt(document.getElementById('education').value);
        const certifications = Array.from(document.querySelectorAll('[id^="cert"]:checked')).reduce((sum, cb) => sum + parseInt(cb.dataset.val), 0);
        
        // Calculate CGPA score (out of 100)
        const cgpaScore = (cgpa / 10) * 100;
        
        // Education score = CGPA (50%) + Degree (30%) + Certifications (20%)
        const educationScore = (cgpaScore * 0.5) + (educationDegree * 0.3) + (certifications * 4);
        
        // 2. EXPERIENCE (30% weight)
        const yearsExp = parseFloat(document.getElementById('yearsExp').value);
        const relevantExp = parseInt(document.getElementById('relevantExp').value);
        
        const experienceScore = Math.min(100, (yearsExp / 20 * 100 * 0.6) + (relevantExp * 0.4));
        
        // 3. SKILLS (25% weight)
        const technicalSkills = parseInt(document.getElementById('techSkills').value);
        const skillsAdvanced = Array.from(document.querySelectorAll('[id^="skill"]:checked')).reduce((sum, cb) => sum + parseInt(cb.dataset.val), 0);
        
        const skillsScore = Math.min(100, (technicalSkills / 20 * 100 * 0.6) + (skillsAdvanced * 2));
        
        // 4. PORTFOLIO (15% weight)
        const projects = parseInt(document.getElementById('projects').value);
        const contributions = Array.from(document.querySelectorAll('[id^="contrib"]:checked')).reduce((sum, cb) => sum + parseInt(cb.dataset.val), 0);
        
        const portfolioScore = Math.min(100, (projects / 15 * 100 * 0.6) + (contributions * 2));
        
        // 5. SOFT SKILLS (10% weight)
        const softSkills = Array.from(document.querySelectorAll('[id^="soft"]:checked')).reduce((sum, cb) => sum + parseInt(cb.dataset.val), 0);
        
        const softSkillsScore = Math.min(100, softSkills * 10);
        
        // Calculate weighted final score
        const finalScore = Math.round(
            (educationScore * 0.20) +
            (experienceScore * 0.30) +
            (skillsScore * 0.25) +
            (portfolioScore * 0.15) +
            (softSkillsScore * 0.10)
        );
        
        overlay.classList.remove('show');
        
        // Display results
        displayResults({
            finalScore,
            educationScore: Math.round(educationScore),
            experienceScore: Math.round(experienceScore),
            skillsScore: Math.round(skillsScore),
            portfolioScore: Math.round(portfolioScore),
            softSkillsScore: Math.round(softSkillsScore),
            cgpa // Pass CGPA for insights
        });
        
        // Scroll to results
        document.getElementById('scorePanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    }, 1200);
}

// Display Results
function displayResults(scores) {
    // Update circular progress
    const circle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 90; // r=90
    circle.style.strokeDasharray = circumference;
    const offset = circumference - (scores.finalScore / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    
    // Animate score number
    animateNumber(0, scores.finalScore, 'scoreValue');
    
    // Update status based on score
    const statusEl = document.getElementById('scoreStatus');
    const scoreCircle = document.querySelector('.score-circle');
    
    if (scores.finalScore >= 85) {
        statusEl.textContent = 'Excellent – Job Ready!';
        statusEl.style.color = '#10b981';
        scoreCircle.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else if (scores.finalScore >= 70) {
        statusEl.textContent = 'Good – Nearly Ready';
        statusEl.style.color = '#34d399';
        scoreCircle.style.borderColor = 'rgba(52, 211, 153, 0.3)';
    } else if (scores.finalScore >= 55) {
        statusEl.textContent = 'Average – Needs Work';
        statusEl.style.color = '#f59e0b';
        scoreCircle.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    } else {
        statusEl.textContent = 'Below Average – Significant Improvement Needed';
        statusEl.style.color = '#ef4444';
        scoreCircle.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    }
    
    // Show breakdown
    document.getElementById('breakdownSection').style.display = 'block';
    document.getElementById('educationVal').textContent = scores.educationScore;
    document.getElementById('experienceVal').textContent = scores.experienceScore;
    document.getElementById('skillsVal').textContent = scores.skillsScore;
    document.getElementById('portfolioVal').textContent = scores.portfolioScore;
    document.getElementById('softVal').textContent = scores.softSkillsScore;
    
    // Update progress bars
    updateProgressBar('educationBar', scores.educationScore);
    updateProgressBar('experienceBar', scores.experienceScore);
    updateProgressBar('skillsBar', scores.skillsScore);
    updateProgressBar('portfolioBar', scores.portfolioScore);
    updateProgressBar('softBar', scores.softSkillsScore);
    
    // Generate insights
    generateInsights(scores);
    
    // Generate recommendations
    generateRecommendations(scores);
}

// Update progress bar
function updateProgressBar(barId, value) {
    const bar = document.getElementById(barId);
    if (bar) {
        setTimeout(() => {
            bar.style.width = value + '%';
        }, 100);
    }
}

// Animate number
function animateNumber(start, end, elementId) {
    const element = document.getElementById(elementId);
    const duration = 1500;
    const increment = (end - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// Generate Insights
function generateInsights(scores) {
    const insights = [];
    
    // CGPA Insight
    if (scores.cgpa >= 8.5) {
        insights.push({
            icon: '🎓',
            title: 'Excellent Academic Record',
            text: `Your CGPA of ${scores.cgpa.toFixed(1)} demonstrates outstanding academic performance and strong learning capabilities.`
        });
    } else if (scores.cgpa >= 7.0) {
        insights.push({
            icon: '📚',
            title: 'Good Academic Foundation',
            text: `Your CGPA of ${scores.cgpa.toFixed(1)} is competitive. Consider boosting with relevant certifications and projects.`
        });
    } else if (scores.cgpa >= 6.0) {
        insights.push({
            icon: '📖',
            title: 'Average Academic Performance',
            text: `Your CGPA of ${scores.cgpa.toFixed(1)} is decent. Focus on building strong technical skills and projects to compensate.`
        });
    } else if (scores.cgpa > 0) {
        insights.push({
            icon: '⚠️',
            title: 'Academic Improvement Needed',
            text: `CGPA of ${scores.cgpa.toFixed(1)} may limit opportunities. Focus heavily on certifications, projects, and practical skills.`
        });
    }
    
    // Education Score Insight
    if (scores.educationScore >= 75) {
        insights.push({
            icon: '✨',
            title: 'Strong Educational Profile',
            text: 'Your combination of degree, CGPA, and certifications creates a solid foundation for your career.'
        });
    } else if (scores.educationScore >= 50) {
        insights.push({
            icon: '📝',
            title: 'Moderate Educational Standing',
            text: 'Consider pursuing additional certifications or a higher degree to strengthen your profile.'
        });
    } else {
        insights.push({
            icon: '🎯',
            title: 'Educational Enhancement Required',
            text: 'Focus on completing your degree and gaining industry-recognized certifications.'
        });
    }
    
    // Experience Insight
    if (scores.experienceScore >= 70) {
        insights.push({
            icon: '💼',
            title: 'Valuable Experience',
            text: 'Your work experience is a major strength that sets you apart from other candidates.'
        });
    } else if (scores.experienceScore >= 40) {
        insights.push({
            icon: '🚀',
            title: 'Building Experience',
            text: 'Continue gaining relevant experience through internships, freelancing, or full-time roles.'
        });
    } else {
        insights.push({
            icon: '🌱',
            title: 'Experience Gap',
            text: 'Seek internships, contribute to open source, or take on freelance projects to build experience.'
        });
    }
    
    // Skills Insight
    if (scores.skillsScore >= 75) {
        insights.push({
            icon: '⚡',
            title: 'Impressive Technical Skills',
            text: 'Your diverse skill set and advanced proficiency make you highly competitive.'
        });
    } else if (scores.skillsScore >= 50) {
        insights.push({
            icon: '🔧',
            title: 'Solid Skill Base',
            text: 'Focus on deepening expertise in 2-3 key areas while staying updated with emerging technologies.'
        });
    } else {
        insights.push({
            icon: '💻',
            title: 'Skill Development Needed',
            text: 'Invest time in learning in-demand technologies and gaining hands-on practice.'
        });
    }
    
    // Portfolio Insight
    if (scores.portfolioScore >= 70) {
        insights.push({
            icon: '🏆',
            title: 'Outstanding Portfolio',
            text: 'Your projects and contributions demonstrate real-world capabilities to employers.'
        });
    } else {
        insights.push({
            icon: '🛠️',
            title: 'Build Your Portfolio',
            text: 'Create 5-8 quality projects and contribute to open source to showcase your abilities.'
        });
    }
    
    // Render insights
    const container = document.getElementById('insightsGrid');
    container.innerHTML = insights.map(insight => `
        <div class="icard">
            <div class="iicon">${insight.icon}</div>
            <div class="ititle">${insight.title}</div>
            <div class="itext">${insight.text}</div>
        </div>
    `).join('');
    
    document.getElementById('insightsSection').style.display = 'block';
}

// Generate Recommendations
function generateRecommendations(scores) {
    const recs = [];
    
    // CGPA-specific recommendations
    if (scores.cgpa < 6.0 && scores.cgpa > 0) {
        recs.push({
            priority: 'high',
            text: `Your CGPA of ${scores.cgpa.toFixed(1)} is below competitive standards. Focus on improving grades in remaining courses, especially technical subjects.`
        });
    } else if (scores.cgpa < 7.5 && scores.cgpa > 0) {
        recs.push({
            priority: 'medium',
            text: `Aim to raise your CGPA above 7.5 by dedicating more time to studies and seeking help from professors or tutors when needed.`
        });
    }
    
    // Education recommendations
    if (scores.educationScore < 60) {
        recs.push({
            priority: 'high',
            text: 'Complete industry-recognized certifications (AWS, Google Cloud, Azure, or programming certifications) to strengthen your educational profile.'
        });
    }
    
    // Experience recommendations
    if (scores.experienceScore < 50) {
        recs.push({
            priority: 'high',
            text: 'Actively seek internships or entry-level positions. Even 6-12 months of relevant experience significantly boosts your profile.'
        });
    }
    
    // Skills recommendations
    if (scores.skillsScore < 60) {
        recs.push({
            priority: 'high',
            text: 'Learn at least 3-4 in-demand technical skills. Focus on full-stack development (React, Node.js) or data science (Python, SQL, ML).'
        });
    }
    
    // Portfolio recommendations
    if (scores.portfolioScore < 50) {
        recs.push({
            priority: 'high',
            text: 'Build 5-6 substantial projects that solve real problems. Deploy them live and document them well on GitHub.'
        });
    }
    
    // Soft skills recommendations
    if (scores.softSkillsScore < 60) {
        recs.push({
            priority: 'medium',
            text: 'Develop soft skills through leadership roles, public speaking, or joining professional clubs and communities.'
        });
    }
    
    // General recommendations
    recs.push({
        priority: 'low',
        text: 'Create a strong LinkedIn profile, personal portfolio website, and actively network with professionals in your field.'
    });
    
    recs.push({
        priority: 'low',
        text: 'Practice coding problems daily on LeetCode/HackerRank and participate in hackathons to build problem-solving skills.'
    });
    
    // Render recommendations
    const container = document.getElementById('recsList');
    container.innerHTML = recs.map(rec => `
        <div class="rcard">
            <div class="rpill rpill-${rec.priority}">${rec.priority} priority</div>
            <div class="rtext">${rec.text}</div>
        </div>
    `).join('');
    
    document.getElementById('recsSection').style.display = 'block';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set initial values
    updateSlider(document.getElementById('cgpaSlider'), 'cgpaVal', '', 1);
    
    console.log('✅ Readiness Calculator with CGPA loaded successfully!');
});