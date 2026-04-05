// ============================================
// AI Career Intelligence System
// ============================================

// Career Database
const careerDatabase = {
    frontend: [
        {
            title: "Frontend Developer",
            icon: "🎨",
            description: "Build beautiful, responsive user interfaces using modern frameworks like React, Vue, or Angular.",
            avgSalary: "₹6-12 LPA",
            growth: "+25%",
            demand: "Very High",
            match: 95,
            skills: ["React", "JavaScript", "CSS", "HTML", "TypeScript"],
            pathSteps: ["Learn HTML/CSS → Master JavaScript → React/Vue → Advanced Patterns"]
        },
        {
            title: "UI/UX Designer",
            icon: "✨",
            description: "Design intuitive and aesthetically pleasing user experiences using Figma, Adobe XD, and design principles.",
            avgSalary: "₹5-10 LPA",
            growth: "+20%",
            demand: "High",
            match: 88,
            skills: ["Figma", "Adobe XD", "Design Systems", "Prototyping"],
            pathSteps: ["Design Basics → Figma Mastery → UX Research → Portfolio Building"]
        }
    ],
    backend: [
        {
            title: "Backend Developer",
            icon: "⚙️",
            description: "Build scalable server-side applications, APIs, and databases using Node.js, Python, or Java.",
            avgSalary: "₹7-14 LPA",
            growth: "+28%",
            demand: "Very High",
            match: 92,
            skills: ["Node.js", "Python", "SQL", "MongoDB", "REST APIs"],
            pathSteps: ["Programming Basics → API Development → Database Design → System Architecture"]
        },
        {
            title: "DevOps Engineer",
            icon: "🔧",
            description: "Automate deployment pipelines, manage infrastructure, and ensure system reliability.",
            avgSalary: "₹8-16 LPA",
            growth: "+35%",
            demand: "Very High",
            match: 85,
            skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
            pathSteps: ["Linux Basics → Docker → Kubernetes → Cloud Platforms → Automation"]
        }
    ],
    data: [
        {
            title: "Data Scientist",
            icon: "📊",
            description: "Analyze complex data, build predictive models, and derive actionable insights using ML and statistics.",
            avgSalary: "₹8-18 LPA",
            growth: "+40%",
            demand: "Extremely High",
            match: 94,
            skills: ["Python", "Machine Learning", "Statistics", "SQL", "Pandas"],
            pathSteps: ["Python Basics → Statistics → ML Algorithms → Deep Learning → Projects"]
        },
        {
            title: "Data Analyst",
            icon: "📈",
            description: "Transform raw data into meaningful insights using SQL, Excel, and visualization tools.",
            avgSalary: "₹5-10 LPA",
            growth: "+30%",
            demand: "High",
            match: 90,
            skills: ["SQL", "Excel", "Tableau", "Power BI", "Statistics"],
            pathSteps: ["SQL Mastery → Excel Advanced → Tableau/Power BI → Business Analytics"]
        }
    ],
    ai: [
        {
            title: "Machine Learning Engineer",
            icon: "🤖",
            description: "Design and deploy ML models, work with neural networks, and solve complex AI problems.",
            avgSalary: "₹10-22 LPA",
            growth: "+45%",
            demand: "Extremely High",
            match: 96,
            skills: ["Python", "TensorFlow", "PyTorch", "Deep Learning", "NLP"],
            pathSteps: ["Python → ML Fundamentals → Deep Learning → NLP/CV → Production Deployment"]
        },
        {
            title: "AI Research Scientist",
            icon: "🧠",
            description: "Conduct cutting-edge research in artificial intelligence and publish papers.",
            avgSalary: "₹12-25 LPA",
            growth: "+50%",
            demand: "High",
            match: 88,
            skills: ["Research", "Mathematics", "Deep Learning", "Publications"],
            pathSteps: ["Advanced Math → Research Methods → Paper Reading → Implementation → Publishing"]
        }
    ],
    mobile: [
        {
            title: "Mobile App Developer",
            icon: "📱",
            description: "Build native or cross-platform mobile applications for iOS and Android.",
            avgSalary: "₹6-13 LPA",
            growth: "+25%",
            demand: "High",
            match: 90,
            skills: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase"],
            pathSteps: ["Programming Basics → Flutter/React Native → API Integration → App Publishing"]
        }
    ],
    devops: [
        {
            title: "DevOps Engineer",
            icon: "🔧",
            description: "Automate infrastructure, manage CI/CD pipelines, and ensure system reliability.",
            avgSalary: "₹8-16 LPA",
            growth: "+35%",
            demand: "Very High",
            match: 92,
            skills: ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform"],
            pathSteps: ["Linux → Docker → Kubernetes → Cloud → Infrastructure as Code"]
        },
        {
            title: "Site Reliability Engineer",
            icon: "🛡️",
            description: "Ensure high availability, performance monitoring, and incident management.",
            avgSalary: "₹10-20 LPA",
            growth: "+38%",
            demand: "Very High",
            match: 87,
            skills: ["Monitoring", "Automation", "Cloud", "Python", "SRE Practices"],
            pathSteps: ["System Admin → Monitoring → Automation → Incident Management → SRE"]
        }
    ],
    security: [
        {
            title: "Cybersecurity Engineer",
            icon: "🔒",
            description: "Protect systems from threats, perform security audits, and implement security protocols.",
            avgSalary: "₹7-15 LPA",
            growth: "+32%",
            demand: "Very High",
            match: 89,
            skills: ["Security", "Penetration Testing", "Network Security", "Python"],
            pathSteps: ["Networking → Security Fundamentals → Ethical Hacking → Certifications"]
        }
    ],
    cloud: [
        {
            title: "Cloud Architect",
            icon: "☁️",
            description: "Design and implement cloud infrastructure solutions using AWS, Azure, or GCP.",
            avgSalary: "₹12-24 LPA",
            growth: "+42%",
            demand: "Extremely High",
            match: 93,
            skills: ["AWS", "Azure", "Architecture", "Terraform", "Security"],
            pathSteps: ["Cloud Basics → AWS/Azure → Architecture → Security → Cost Optimization"]
        }
    ]
};

// Trending Skills Data
const trendingSkills = [
    { name: "Artificial Intelligence", growth: "+67%", demand: 95 },
    { name: "Cloud Computing", growth: "+58%", demand: 92 },
    { name: "DevOps", growth: "+54%", demand: 88 },
    { name: "Data Science", growth: "+51%", demand: 90 },
    { name: "Cybersecurity", growth: "+48%", demand: 85 },
    { name: "Blockchain", growth: "+45%", demand: 75 },
    { name: "React/Vue", growth: "+42%", demand: 87 },
    { name: "Docker/Kubernetes", growth: "+40%", demand: 83 }
];

// Salary Data by Role
const salaryData = {
    "Full Stack Developer": { base: 800000, expMultiplier: 120000, locationBonus: { "Bangalore": 1.2, "Mumbai": 1.15, "Delhi": 1.1, "Hyderabad": 1.0, "Pune": 1.05, "Chennai": 1.0 } },
    "Frontend Developer": { base: 600000, expMultiplier: 100000, locationBonus: { "Bangalore": 1.2, "Mumbai": 1.15, "Delhi": 1.1, "Hyderabad": 1.0, "Pune": 1.05, "Chennai": 1.0 } },
    "Backend Developer": { base: 700000, expMultiplier: 110000, locationBonus: { "Bangalore": 1.2, "Mumbai": 1.15, "Delhi": 1.1, "Hyderabad": 1.0, "Pune": 1.05, "Chennai": 1.0 } },
    "Data Scientist": { base: 900000, expMultiplier: 150000, locationBonus: { "Bangalore": 1.25, "Mumbai": 1.2, "Delhi": 1.15, "Hyderabad": 1.1, "Pune": 1.1, "Chennai": 1.05 } },
    "Machine Learning Engineer": { base: 1200000, expMultiplier: 180000, locationBonus: { "Bangalore": 1.3, "Mumbai": 1.25, "Delhi": 1.2, "Hyderabad": 1.15, "Pune": 1.15, "Chennai": 1.1 } },
    "DevOps Engineer": { base: 850000, expMultiplier: 130000, locationBonus: { "Bangalore": 1.2, "Mumbai": 1.15, "Delhi": 1.1, "Hyderabad": 1.05, "Pune": 1.05, "Chennai": 1.0 } },
    "Cloud Architect": { base: 1400000, expMultiplier: 200000, locationBonus: { "Bangalore": 1.3, "Mumbai": 1.25, "Delhi": 1.2, "Hyderabad": 1.15, "Pune": 1.15, "Chennai": 1.1 } },
    "Security Engineer": { base: 800000, expMultiplier: 125000, locationBonus: { "Bangalore": 1.2, "Mumbai": 1.15, "Delhi": 1.1, "Hyderabad": 1.05, "Pune": 1.05, "Chennai": 1.0 } }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupInterestSelection();
    loadTrendingSkills();
    initializeCharts();
});

// Show Section
function showSection(sectionName) {
    document.getElementById('featureGrid').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
}

// Back to Home
function backToHome() {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('featureGrid').style.display = 'grid';
}

// Interest Selection
function setupInterestSelection() {
    const boxes = document.querySelectorAll('.interest-box');
    boxes.forEach(box => {
        box.addEventListener('click', () => {
            box.classList.toggle('selected');
        });
    });
}

// Analyze Career Path
function analyzeCareer() {
    const selectedInterests = Array.from(document.querySelectorAll('.interest-box.selected'))
        .map(box => box.dataset.interest);
    
    if (selectedInterests.length === 0) {
        alert('⚠️ Please select at least one interest area');
        return;
    }
    
    document.getElementById('loadingOverlay').classList.add('active');
    
    setTimeout(() => {
        displayCareerResults(selectedInterests);
        document.getElementById('loadingOverlay').classList.remove('active');
        document.getElementById('careerResults').style.display = 'block';
        document.getElementById('careerResults').scrollIntoView({ behavior: 'smooth' });
    }, 2000);
}

// Display Career Results
function displayCareerResults(interests) {
    const gridDiv = document.getElementById('resultsGrid');
    gridDiv.innerHTML = '';
    
    let allCareers = [];
    interests.forEach(interest => {
        if (careerDatabase[interest]) {
            allCareers = allCareers.concat(careerDatabase[interest]);
        }
    });
    
    allCareers.sort((a, b) => b.match - a.match);
    
    allCareers.forEach(career => {
        const careerHTML = `
            <div class="career-box">
                <div class="career-header">
                    <div class="career-emoji">${career.icon}</div>
                    <div class="career-info">
                        <h3>${career.title}</h3>
                        <span class="match-badge">${career.match}% MATCH</span>
                    </div>
                </div>
                <div class="career-desc">${career.description}</div>
                <div class="career-metrics">
                    <div class="metric-box">
                        <span class="metric-value">${career.avgSalary}</span>
                        <span class="metric-label">Avg Salary</span>
                    </div>
                    <div class="metric-box">
                        <span class="metric-value">${career.growth}</span>
                        <span class="metric-label">Growth</span>
                    </div>
                </div>
                <div class="skills-row">
                    ${career.skills.map(s => `<span class="skill-pill">${s}</span>`).join('')}
                </div>
                <button class="explore-career-btn" onclick="exploreCareer('${career.title}')">
                    Explore Path →
                </button>
            </div>
        `;
        gridDiv.insertAdjacentHTML('beforeend', careerHTML);
    });
}

// Explore Career
function exploreCareer(careerTitle) {
    alert(`🎯 Learning Path for ${careerTitle}\n\nThis feature will show:\n• Detailed roadmap\n• Course recommendations\n• Project ideas\n• Certification paths\n\nComing soon!`);
}

// Load Trending Skills
function loadTrendingSkills() {
    const listDiv = document.getElementById('trendingList');
    if (!listDiv) return;
    
    listDiv.innerHTML = '';
    
    trendingSkills.slice(0, 6).forEach((skill, index) => {
        const item = `
            <div class="trending-item">
                <div class="trend-rank">${index + 1}</div>
                <div class="trend-info">
                    <div class="trend-skill">${skill.name}</div>
                    <div class="trend-growth">↑ ${skill.growth} growth</div>
                </div>
            </div>
        `;
        listDiv.insertAdjacentHTML('beforeend', item);
    });
}

// Initialize Charts
let growthChart, demandChart;

function initializeCharts() {
    // Industry Growth Chart
    const growthCtx = document.getElementById('growthChart');
    if (growthCtx) {
        growthChart = new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
                datasets: [{
                    label: 'AI/ML',
                    data: [20, 35, 55, 78, 95, 110, 125],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }, {
                    label: 'Cloud Computing',
                    data: [30, 45, 62, 80, 98, 112, 128],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }, {
                    label: 'Data Science',
                    data: [25, 40, 58, 75, 88, 100, 115],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12, weight: '600' },
                            padding: 15
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { font: { size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    }
                }
            }
        });
    }
    
    // Job Demand Chart
    const demandCtx = document.getElementById('demandChart');
    if (demandCtx) {
        demandChart = new Chart(demandCtx, {
            type: 'bar',
            data: {
                labels: ['Full Stack', 'Data Scientist', 'ML Engineer', 'DevOps', 'Cloud', 'Frontend', 'Backend', 'Security'],
                datasets: [{
                    label: 'Job Openings (thousands)',
                    data: [45, 38, 42, 35, 28, 40, 38, 25],
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
                        '#06b6d4', '#ec4899', '#14b8a6', '#f97316'
                    ],
                    borderRadius: 8,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { font: { size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    }
                }
            }
        });
    }
}

// Role Comparison Data
const roleComparisonData = {
    "Full Stack Developer": {
        icon: "💻",
        salary: "₹6-14 LPA",
        growth: "+28%",
        demand: "Very High",
        skills: ["React", "Node.js", "MongoDB", "APIs", "Git"],
        jobs: "45K+"
    },
    "Frontend Developer": {
        icon: "🎨",
        salary: "₹5-12 LPA",
        growth: "+25%",
        demand: "High",
        skills: ["React", "JavaScript", "CSS", "HTML", "TypeScript"],
        jobs: "40K+"
    },
    "Backend Developer": {
        icon: "⚙️",
        salary: "₹6-14 LPA",
        growth: "+27%",
        demand: "Very High",
        skills: ["Node.js", "Python", "SQL", "APIs", "Docker"],
        jobs: "38K+"
    },
    "Data Scientist": {
        icon: "📊",
        salary: "₹8-20 LPA",
        growth: "+42%",
        demand: "Extremely High",
        skills: ["Python", "ML", "Statistics", "SQL", "Pandas"],
        jobs: "38K+"
    },
    "ML Engineer": {
        icon: "🤖",
        salary: "₹10-25 LPA",
        growth: "+48%",
        demand: "Extremely High",
        skills: ["Python", "TensorFlow", "PyTorch", "Deep Learning", "NLP"],
        jobs: "42K+"
    },
    "DevOps Engineer": {
        icon: "🔧",
        salary: "₹7-18 LPA",
        growth: "+38%",
        demand: "Very High",
        skills: ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform"],
        jobs: "35K+"
    },
    "Cloud Architect": {
        icon: "☁️",
        salary: "₹12-28 LPA",
        growth: "+45%",
        demand: "Extremely High",
        skills: ["AWS", "Azure", "Architecture", "Terraform", "Security"],
        jobs: "28K+"
    }
};

// Compare Roles Function
function compareRoles() {
    const role1Name = document.getElementById('role1').value;
    const role2Name = document.getElementById('role2').value;
    
    if (!role1Name || !role2Name) {
        alert('⚠️ Please select both roles to compare');
        return;
    }
    
    if (role1Name === role2Name) {
        alert('⚠️ Please select two different roles');
        return;
    }
    
    document.getElementById('loadingOverlay').classList.add('active');
    
    setTimeout(() => {
        const role1 = roleComparisonData[role1Name];
        const role2 = roleComparisonData[role2Name];
        
        // Update Role 1
        document.getElementById('role1Icon').textContent = role1.icon;
        document.getElementById('role1Title').textContent = role1Name;
        document.getElementById('role1Salary').textContent = role1.salary;
        document.getElementById('role1Growth').textContent = role1.growth;
        document.getElementById('role1Demand').textContent = role1.demand;
        document.getElementById('role1Jobs').textContent = role1.jobs;
        
        const role1SkillsDiv = document.getElementById('role1Skills');
        role1SkillsDiv.innerHTML = '';
        role1.skills.forEach(skill => {
            role1SkillsDiv.innerHTML += `<span style="padding: 8px 16px; background: #e0f2fe; color: #0369a1; border-radius: 8px; font-size: 13px; font-weight: 600;">${skill}</span>`;
        });
        
        // Update Role 2
        document.getElementById('role2Icon').textContent = role2.icon;
        document.getElementById('role2Title').textContent = role2Name;
        document.getElementById('role2Salary').textContent = role2.salary;
        document.getElementById('role2Growth').textContent = role2.growth;
        document.getElementById('role2Demand').textContent = role2.demand;
        document.getElementById('role2Jobs').textContent = role2.jobs;
        
        const role2SkillsDiv = document.getElementById('role2Skills');
        role2SkillsDiv.innerHTML = '';
        role2.skills.forEach(skill => {
            role2SkillsDiv.innerHTML += `<span style="padding: 8px 16px; background: #d1fae5; color: #065f46; border-radius: 8px; font-size: 13px; font-weight: 600;">${skill}</span>`;
        });
        
        // Generate verdict
        const verdict = generateVerdict(role1Name, role2Name, role1, role2);
        document.getElementById('verdict').innerHTML = verdict;
        
        document.getElementById('comparisonResults').style.display = 'block';
        document.getElementById('loadingOverlay').classList.remove('active');
        
        document.getElementById('comparisonResults').scrollIntoView({ behavior: 'smooth' });
    }, 1500);
}

// Generate Verdict
function generateVerdict(name1, name2, data1, data2) {
    const growth1 = parseInt(data1.growth);
    const growth2 = parseInt(data2.growth);
    
    let verdict = '';
    
    if (growth1 > growth2) {
        verdict = `<strong>${name1}</strong> shows <strong>${Math.abs(growth1 - growth2)}% higher growth</strong> than ${name2}, making it an excellent choice for long-term career prospects. `;
    } else if (growth2 > growth1) {
        verdict = `<strong>${name2}</strong> shows <strong>${Math.abs(growth2 - growth1)}% higher growth</strong> than ${name1}, indicating stronger future demand. `;
    } else {
        verdict = `Both roles show <strong>equal growth potential</strong> at ${data1.growth}. `;
    }
    
    // Salary comparison
    const sal1Max = parseInt(data1.salary.split('-')[1]);
    const sal2Max = parseInt(data2.salary.split('-')[1]);
    
    if (sal1Max > sal2Max) {
        verdict += `In terms of compensation, <strong>${name1}</strong> offers higher earning potential. `;
    } else if (sal2Max > sal1Max) {
        verdict += `<strong>${name2}</strong> offers better salary packages overall. `;
    }
    
    // Demand comparison
    if (data1.demand === "Extremely High" && data2.demand !== "Extremely High") {
        verdict += `<strong>${name1}</strong> currently has <strong>extremely high market demand</strong>. `;
    } else if (data2.demand === "Extremely High" && data1.demand !== "Extremely High") {
        verdict += `<strong>${name2}</strong> currently has <strong>extremely high market demand</strong>. `;
    }
    
    verdict += `<br><br><strong>💡 Our Recommendation:</strong> `;
    
    if (growth1 > growth2 && sal1Max >= sal2Max) {
        verdict += `Choose <strong>${name1}</strong> for better growth and earnings.`;
    } else if (growth2 > growth1 && sal2Max >= sal1Max) {
        verdict += `Choose <strong>${name2}</strong> for better growth and earnings.`;
    } else {
        verdict += `Both roles are excellent choices. Select based on your personal interests and skills alignment.`;
    }
    
    return verdict;
}

// Skill Roadmap Data
const roadmapData = {
    "Full Stack Developer": {
        phases: [
            {
                name: "Foundation Phase",
                duration: "2-3 months",
                skills: ["HTML5 & CSS3", "JavaScript ES6+", "Git & GitHub", "Responsive Design", "Browser DevTools"],
                resources: ["freeCodeCamp", "MDN Docs", "JavaScript.info"]
            },
            {
                name: "Frontend Mastery",
                duration: "3-4 months",
                skills: ["React.js", "State Management (Redux)", "TypeScript", "Tailwind CSS", "API Integration"],
                resources: ["React Docs", "Udemy", "Scrimba"]
            },
            {
                name: "Backend Development",
                duration: "3-4 months",
                skills: ["Node.js & Express", "RESTful APIs", "MongoDB", "Authentication (JWT)", "Database Design"],
                resources: ["Node.js Docs", "MongoDB University", "Coursera"]
            },
            {
                name: "Advanced & Deployment",
                duration: "2-3 months",
                skills: ["Docker", "AWS/Azure Basics", "CI/CD Pipelines", "Testing (Jest)", "Performance Optimization"],
                resources: ["Docker Hub", "AWS Free Tier", "GitHub Actions"]
            }
        ]
    },
    "Data Scientist": {
        phases: [
            {
                name: "Programming Foundation",
                duration: "2 months",
                skills: ["Python Basics", "Pandas & NumPy", "Jupyter Notebooks", "Git Version Control", "SQL Fundamentals"],
                resources: ["Python.org", "Kaggle", "DataCamp"]
            },
            {
                name: "Statistics & Math",
                duration: "3 months",
                skills: ["Descriptive Statistics", "Probability Theory", "Hypothesis Testing", "Linear Algebra", "Calculus Basics"],
                resources: ["Khan Academy", "StatQuest", "3Blue1Brown"]
            },
            {
                name: "Machine Learning",
                duration: "4 months",
                skills: ["Scikit-learn", "Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Feature Engineering"],
                resources: ["Coursera ML", "Fast.ai", "Kaggle Learn"]
            },
            {
                name: "Advanced Topics",
                duration: "3 months",
                skills: ["Deep Learning", "NLP Basics", "Computer Vision", "TensorFlow/PyTorch", "MLOps Fundamentals"],
                resources: ["Deep Learning AI", "Papers with Code", "Hugging Face"]
            }
        ]
    },
    "Machine Learning Engineer": {
        phases: [
            {
                name: "Programming & Math",
                duration: "2-3 months",
                skills: ["Python Advanced", "Linear Algebra", "Calculus", "Statistics", "Data Structures"],
                resources: ["MIT OpenCourseWare", "Coursera", "LeetCode"]
            },
            {
                name: "ML Fundamentals",
                duration: "3 months",
                skills: ["Supervised Learning", "Unsupervised Learning", "Scikit-learn", "Model Selection", "Cross-Validation"],
                resources: ["Andrew Ng Course", "Kaggle", "Fast.ai"]
            },
            {
                name: "Deep Learning",
                duration: "4 months",
                skills: ["Neural Networks", "CNNs", "RNNs/LSTMs", "Transformers", "PyTorch/TensorFlow"],
                resources: ["Deep Learning Specialization", "PyTorch Docs", "Papers"]
            },
            {
                name: "Production ML",
                duration: "3 months",
                skills: ["MLOps", "Model Deployment", "Docker & Kubernetes", "Cloud Platforms", "Monitoring"],
                resources: ["MLOps Course", "AWS SageMaker", "Google Cloud"]
            }
        ]
    },
    "DevOps Engineer": {
        phases: [
            {
                name: "Linux & Scripting",
                duration: "2 months",
                skills: ["Linux Administration", "Bash Scripting", "Networking Basics", "SSH & Security", "Python for Automation"],
                resources: ["Linux Journey", "OverTheWire", "Automate Boring Stuff"]
            },
            {
                name: "Containerization",
                duration: "2 months",
                skills: ["Docker", "Docker Compose", "Container Networking", "Image Building", "Registry Management"],
                resources: ["Docker Docs", "Play with Docker", "Docker Mastery"]
            },
            {
                name: "Orchestration & CI/CD",
                duration: "3 months",
                skills: ["Kubernetes", "Jenkins/GitLab CI", "Terraform", "Ansible", "Git Workflows"],
                resources: ["Kubernetes Docs", "Jenkins Handbook", "Terraform Learn"]
            },
            {
                name: "Cloud & Monitoring",
                duration: "3 months",
                skills: ["AWS/Azure/GCP", "Monitoring (Prometheus)", "Logging (ELK)", "Infrastructure as Code", "Security Best Practices"],
                resources: ["Cloud Provider Docs", "Prometheus", "AWS Certified"]
            }
        ]
    },
    "Cloud Architect": {
        phases: [
            {
                name: "Cloud Basics",
                duration: "2 months",
                skills: ["AWS/Azure Fundamentals", "Networking Concepts", "Linux Basics", "Security Principles", "Cost Management"],
                resources: ["AWS Free Tier", "Azure Learn", "Cloud Guru"]
            },
            {
                name: "Core Services",
                duration: "3 months",
                skills: ["Compute (EC2, VMs)", "Storage Solutions", "Database Services", "Load Balancing", "Auto Scaling"],
                resources: ["AWS Solutions Architect", "Azure Architect", "Hands-on Labs"]
            },
            {
                name: "Architecture Design",
                duration: "3 months",
                skills: ["High Availability", "Disaster Recovery", "Microservices", "Serverless", "API Gateway"],
                resources: ["AWS Well-Architected", "Architecture Patterns", "Case Studies"]
            },
            {
                name: "Advanced & Security",
                duration: "2 months",
                skills: ["IAM & Security", "Compliance", "Cost Optimization", "Multi-Region", "Hybrid Cloud"],
                resources: ["Cloud Security Alliance", "Certification Prep", "Real Projects"]
            }
        ]
    },
    "Frontend Developer": {
        phases: [
            {
                name: "HTML & CSS Mastery",
                duration: "1-2 months",
                skills: ["HTML5 Semantics", "CSS3 Advanced", "Flexbox & Grid", "Responsive Design", "CSS Animations"],
                resources: ["CSS-Tricks", "freeCodeCamp", "Kevin Powell"]
            },
            {
                name: "JavaScript Deep Dive",
                duration: "2-3 months",
                skills: ["ES6+ Features", "DOM Manipulation", "Async JavaScript", "API Calls", "Modern Tooling"],
                resources: ["JavaScript.info", "Eloquent JavaScript", "You Don't Know JS"]
            },
            {
                name: "React Development",
                duration: "3 months",
                skills: ["React Components", "Hooks", "State Management", "React Router", "Performance Optimization"],
                resources: ["React Docs", "Epic React", "Scrimba React"]
            },
            {
                name: "Professional Skills",
                duration: "2 months",
                skills: ["TypeScript", "Testing (Jest)", "Build Tools", "UI Libraries", "Accessibility"],
                resources: ["TypeScript Handbook", "Testing Library", "A11y Project"]
            }
        ]
    },
    "Backend Developer": {
        phases: [
            {
                name: "Programming Foundation",
                duration: "2 months",
                skills: ["Node.js/Python", "Data Structures", "Algorithms", "Git", "Command Line"],
                resources: ["Node.js Docs", "LeetCode", "HackerRank"]
            },
            {
                name: "API Development",
                duration: "3 months",
                skills: ["RESTful APIs", "Express/Flask", "Authentication", "Validation", "Error Handling"],
                resources: ["REST API Tutorial", "Express Docs", "Postman"]
            },
            {
                name: "Database Management",
                duration: "2-3 months",
                skills: ["SQL (PostgreSQL)", "NoSQL (MongoDB)", "Database Design", "Indexing", "Query Optimization"],
                resources: ["PostgreSQL Docs", "MongoDB University", "SQL Zoo"]
            },
            {
                name: "Advanced Backend",
                duration: "2-3 months",
                skills: ["Microservices", "Message Queues", "Caching (Redis)", "Security", "Performance"],
                resources: ["Microservices.io", "Redis Docs", "OWASP"]
            }
        ]
    }
};

// Generate Roadmap
function generateRoadmap() {
    const role = document.getElementById('targetRole').value;
    
    if (!role) {
        alert('⚠️ Please select a target role');
        return;
    }
    
    document.getElementById('loadingOverlay').classList.add('active');
    
    setTimeout(() => {
        const roadmap = roadmapData[role];
        
        if (!roadmap) {
            alert('Roadmap not available for this role');
            document.getElementById('loadingOverlay').classList.remove('active');
            return;
        }
        
        displayRoadmap(roadmap, role);
        document.getElementById('loadingOverlay').classList.remove('active');
        document.getElementById('roadmapDisplay').style.display = 'block';
        document.getElementById('roadmapDisplay').scrollIntoView({ behavior: 'smooth' });
    }, 1500);
}

// Display Roadmap
function displayRoadmap(roadmap, role) {
    const phasesContainer = document.getElementById('phasesContainer');
    phasesContainer.innerHTML = '';
    
    // Calculate progress (random for demo)
    const progress = Math.floor(Math.random() * 60) + 20;
    document.getElementById('overallProgress').textContent = progress + '%';
    document.getElementById('progressBarFill').style.width = progress + '%';
    
    roadmap.phases.forEach((phase, index) => {
        const phaseHTML = `
            <div class="phase-card">
                <div class="phase-header">
                    <div class="phase-number">${index + 1}</div>
                    <div class="phase-info">
                        <h4>${phase.name}</h4>
                        <div class="phase-duration">⏱️ Duration: ${phase.duration}</div>
                    </div>
                </div>
                
                <div class="skills-checklist">
                    ${phase.skills.map((skill, idx) => {
                        const isCompleted = Math.random() > 0.6;
                        return `
                            <div class="skill-check-item ${isCompleted ? 'completed' : ''}" onclick="toggleSkill(this)">
                                <div class="skill-checkbox">${isCompleted ? '✓' : ''}</div>
                                <div class="skill-name">${skill}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="resources-section">
                    <div class="resources-title">📚 Recommended Resources</div>
                    <div class="resource-links">
                        ${phase.resources.map(resource => `
                            <a href="#" class="resource-link" onclick="event.preventDefault(); alert('Opening ${resource}...')">
                                ${resource} →
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        phasesContainer.insertAdjacentHTML('beforeend', phaseHTML);
    });
}

// Toggle Skill Completion
function toggleSkill(element) {
    element.classList.toggle('completed');
    const checkbox = element.querySelector('.skill-checkbox');
    
    if (element.classList.contains('completed')) {
        checkbox.textContent = '✓';
    } else {
        checkbox.textContent = '';
    }
    
    // Update progress (simple calculation)
    updateProgress();
}

// Update Progress
function updateProgress() {
    const allSkills = document.querySelectorAll('.skill-check-item');
    const completedSkills = document.querySelectorAll('.skill-check-item.completed');
    
    if (allSkills.length === 0) return;
    
    const progress = Math.round((completedSkills.length / allSkills.length) * 100);
    document.getElementById('overallProgress').textContent = progress + '%';
    document.getElementById('progressBarFill').style.width = progress + '%';
}

// Format Salary
function formatSalary(amount) {
    const lacs = amount / 100000;
    return `₹${lacs.toFixed(1)} LPA`;
}