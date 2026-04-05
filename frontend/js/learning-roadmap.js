// =============================================
// Learning Roadmap System
// =============================================

let selectedRole = '';

// Comprehensive Roadmap Data
const roadmapData = {
    "Full Stack Developer": {
        totalMonths: 8,
        phases: [
            {
                name: "Frontend Fundamentals",
                duration: "2 months",
                skills: ["HTML5 Semantics", "CSS3 & Flexbox/Grid", "JavaScript ES6+", "Responsive Design", "Git Basics"],
                resources: ["freeCodeCamp", "MDN Web Docs", "CSS-Tricks", "JavaScript.info"],
                projects: [
                    { title: "Portfolio Website", desc: "Build a responsive personal portfolio with modern CSS" },
                    { title: "Calculator App", desc: "Create an interactive calculator using vanilla JavaScript" }
                ],
                certifications: ["freeCodeCamp Responsive Web Design", "Udemy Web Development Bootcamp"]
            },
            {
                name: "Frontend Framework",
                duration: "2 months",
                skills: ["React Components & Hooks", "State Management (Redux/Context)", "React Router", "API Integration", "TypeScript Basics"],
                resources: ["React Official Docs", "Epic React", "Scrimba React Course", "TypeScript Handbook"],
                projects: [
                    { title: "Todo App with React", desc: "Full-featured todo app with local storage" },
                    { title: "Weather Dashboard", desc: "Fetch weather data from API and display beautifully" }
                ],
                certifications: ["Meta React Basics", "Scrimba React Certificate"]
            },
            {
                name: "Backend Development",
                duration: "2 months",
                skills: ["Node.js & Express", "RESTful API Design", "MongoDB/PostgreSQL", "Authentication (JWT)", "Error Handling"],
                resources: ["Node.js Docs", "Express.js Guide", "MongoDB University", "Postman"],
                projects: [
                    { title: "Blog API", desc: "Create a complete blog backend with CRUD operations" },
                    { title: "Auth System", desc: "Build authentication with JWT, bcrypt, and refresh tokens" }
                ],
                certifications: ["MongoDB Developer Certification", "Node.js Certification"]
            },
            {
                name: "Full Stack Integration",
                duration: "2 months",
                skills: ["MERN/PERN Stack", "Deployment (Vercel, Heroku)", "Docker Basics", "Testing (Jest, Cypress)", "Performance Optimization"],
                resources: ["Docker Docs", "Vercel Deployment Guide", "Jest Documentation", "Web.dev Performance"],
                projects: [
                    { title: "E-commerce Platform", desc: "Full-stack online store with payment integration" },
                    { title: "Social Media Clone", desc: "Twitter/Instagram clone with real-time features" }
                ],
                certifications: ["AWS Cloud Practitioner", "Docker Essentials"]
            }
        ]
    },
    
    "Frontend Developer": {
        totalMonths: 6,
        phases: [
            {
                name: "HTML & CSS Mastery",
                duration: "1.5 months",
                skills: ["HTML5 Semantic Elements", "CSS3 Advanced Selectors", "Flexbox & Grid Layouts", "CSS Animations", "SASS/SCSS"],
                resources: ["Kevin Powell YouTube", "CSS-Tricks", "Flexbox Froggy", "Grid Garden"],
                projects: [
                    { title: "Landing Page Clone", desc: "Recreate a professional landing page pixel-perfect" },
                    { title: "Animated Portfolio", desc: "Portfolio with CSS animations and transitions" }
                ],
                certifications: ["freeCodeCamp Responsive Web Design"]
            },
            {
                name: "JavaScript Deep Dive",
                duration: "2 months",
                skills: ["ES6+ Features", "DOM Manipulation", "Async/Await & Promises", "Event Loop", "Module Systems"],
                resources: ["JavaScript.info", "Eloquent JavaScript", "You Don't Know JS", "30 Days of JavaScript"],
                projects: [
                    { title: "Interactive Quiz App", desc: "Quiz with timer, scoring, and results" },
                    { title: "Memory Card Game", desc: "Card matching game with animations" }
                ],
                certifications: ["JavaScript Algorithms and Data Structures"]
            },
            {
                name: "React Development",
                duration: "2 months",
                skills: ["React Components & Hooks", "Context API & Redux", "React Router", "Form Handling", "Performance Optimization"],
                resources: ["React Docs", "Epic React by Kent C. Dodds", "Scrimba React", "React Patterns"],
                projects: [
                    { title: "Movie Database App", desc: "Search movies using TMDB API" },
                    { title: "Recipe Finder", desc: "Search and save recipes with Redux state" }
                ],
                certifications: ["Meta React Basics", "Advanced React Patterns"]
            },
            {
                name: "Professional Skills",
                duration: "0.5 months",
                skills: ["TypeScript", "Testing (Jest, RTL)", "Webpack/Vite", "UI Libraries (MUI, Tailwind)", "Accessibility (A11y)"],
                resources: ["TypeScript Handbook", "Testing Library Docs", "Tailwind CSS Docs", "A11y Project"],
                projects: [
                    { title: "Dashboard with TypeScript", desc: "Admin dashboard with charts and tables" },
                    { title: "Accessible Component Library", desc: "Build reusable accessible components" }
                ],
                certifications: ["TypeScript Essentials", "Web Accessibility Specialist"]
            }
        ]
    },

    "Backend Developer": {
        totalMonths: 7,
        phases: [
            {
                name: "Programming Foundation",
                duration: "2 months",
                skills: ["Python/Node.js Fundamentals", "Data Structures", "Algorithms", "Object-Oriented Programming", "Git & GitHub"],
                resources: ["LeetCode", "HackerRank", "Node.js Docs", "Python Official Tutorial"],
                projects: [
                    { title: "CLI Tool", desc: "Build a command-line application" },
                    { title: "Data Structure Implementation", desc: "Implement common data structures" }
                ],
                certifications: ["Python for Everybody", "Node.js Essentials"]
            },
            {
                name: "API Development",
                duration: "2 months",
                skills: ["RESTful API Design", "Express.js/Flask/Django", "Request Validation", "Error Handling", "API Documentation (Swagger)"],
                resources: ["REST API Tutorial", "Express.js Guide", "Django Docs", "Swagger Documentation"],
                projects: [
                    { title: "Blog API", desc: "CRUD operations with proper error handling" },
                    { title: "E-commerce API", desc: "Product catalog with search and filtering" }
                ],
                certifications: ["RESTful Web Services", "API Design Best Practices"]
            },
            {
                name: "Database Management",
                duration: "2 months",
                skills: ["SQL (PostgreSQL/MySQL)", "NoSQL (MongoDB)", "Database Design", "Indexing & Optimization", "ORMs (Sequelize, Mongoose)"],
                resources: ["PostgreSQL Tutorial", "MongoDB University", "SQL Zoo", "Database Design Course"],
                projects: [
                    { title: "Library Management System", desc: "Complex relational database design" },
                    { title: "Social Network Schema", desc: "Design schema for a social platform" }
                ],
                certifications: ["MongoDB Developer", "PostgreSQL DBA"]
            },
            {
                name: "Advanced Backend",
                duration: "1 month",
                skills: ["Microservices Architecture", "Message Queues (RabbitMQ, Kafka)", "Caching (Redis)", "Security Best Practices", "Performance Tuning"],
                resources: ["Microservices.io", "Redis University", "OWASP Top 10", "System Design Primer"],
                projects: [
                    { title: "Microservices Project", desc: "Build a multi-service application" },
                    { title: "Real-time Chat Backend", desc: "WebSocket server with Redis pub/sub" }
                ],
                certifications: ["System Design Interview", "Security+ (optional)"]
            }
        ]
    },

    "Data Scientist": {
        totalMonths: 10,
        phases: [
            {
                name: "Python & Math Foundations",
                duration: "2 months",
                skills: ["Python Programming", "NumPy & Pandas", "Linear Algebra", "Statistics & Probability", "Data Visualization (Matplotlib, Seaborn)"],
                resources: ["Python Data Science Handbook", "Khan Academy Statistics", "3Blue1Brown Linear Algebra", "Pandas Documentation"],
                projects: [
                    { title: "Exploratory Data Analysis", desc: "Analyze a real-world dataset" },
                    { title: "Statistical Analysis Report", desc: "Hypothesis testing and visualization" }
                ],
                certifications: ["IBM Data Science Fundamentals", "Statistics with Python"]
            },
            {
                name: "Machine Learning Basics",
                duration: "3 months",
                skills: ["Supervised Learning", "Unsupervised Learning", "scikit-learn", "Model Evaluation", "Feature Engineering"],
                resources: ["Andrew Ng ML Course", "scikit-learn Docs", "Hands-On ML Book", "Kaggle Learn"],
                projects: [
                    { title: "House Price Prediction", desc: "Regression model with feature engineering" },
                    { title: "Customer Segmentation", desc: "Clustering analysis on customer data" }
                ],
                certifications: ["Stanford ML Certificate", "Google ML Crash Course"]
            },
            {
                name: "Deep Learning",
                duration: "3 months",
                skills: ["Neural Networks", "TensorFlow/PyTorch", "CNN for Computer Vision", "RNN/LSTM", "Transfer Learning"],
                resources: ["Deep Learning Specialization", "Fast.ai", "PyTorch Tutorials", "TensorFlow Docs"],
                projects: [
                    { title: "Image Classifier", desc: "CNN for image classification" },
                    { title: "Sentiment Analysis", desc: "NLP model for text sentiment" }
                ],
                certifications: ["Deep Learning Specialization", "TensorFlow Developer"]
            },
            {
                name: "Advanced & Deployment",
                duration: "2 months",
                skills: ["MLOps", "Model Deployment", "Big Data (Spark)", "Cloud ML (AWS/GCP)", "A/B Testing"],
                resources: ["MLOps Guide", "Apache Spark Docs", "AWS ML Services", "Google Cloud ML"],
                projects: [
                    { title: "ML Pipeline", desc: "End-to-end ML pipeline with deployment" },
                    { title: "Recommendation System", desc: "Build and deploy a recommender" }
                ],
                certifications: ["AWS ML Specialty", "MLOps Certification"]
            }
        ]
    },

    "ML Engineer": {
        totalMonths: 9,
        phases: [
            {
                name: "Python & ML Foundations",
                duration: "2 months",
                skills: ["Advanced Python", "NumPy/Pandas/Scikit-learn", "Statistics & Probability", "Linear Algebra", "Calculus Basics"],
                resources: ["Python ML Handbook", "Mathematics for ML", "3Blue1Brown", "Kaggle"],
                projects: [
                    { title: "Titanic Survival Prediction", desc: "Classic ML classification problem" },
                    { title: "Credit Card Fraud Detection", desc: "Handle imbalanced datasets" }
                ],
                certifications: ["Python for Data Science", "Mathematics for ML"]
            },
            {
                name: "Deep Learning & Neural Networks",
                duration: "3 months",
                skills: ["TensorFlow & PyTorch", "CNNs & Computer Vision", "RNNs & NLP", "GANs", "Transformers"],
                resources: ["Deep Learning Specialization", "PyTorch Lightning", "Hugging Face", "Papers With Code"],
                projects: [
                    { title: "Object Detection System", desc: "YOLO or R-CNN implementation" },
                    { title: "Text Generation Model", desc: "GPT-style transformer model" }
                ],
                certifications: ["TensorFlow Developer", "PyTorch Scholarship"]
            },
            {
                name: "MLOps & Production",
                duration: "2 months",
                skills: ["Docker & Kubernetes", "CI/CD for ML", "Model Monitoring", "MLflow/Kubeflow", "Cloud Deployment"],
                resources: ["MLOps Community", "Kubernetes Docs", "MLflow Tutorials", "AWS SageMaker"],
                projects: [
                    { title: "Production ML Pipeline", desc: "Automated training and deployment" },
                    { title: "Model Monitoring Dashboard", desc: "Track model performance in production" }
                ],
                certifications: ["AWS ML Specialty", "MLOps Professional"]
            },
            {
                name: "Advanced Topics",
                duration: "2 months",
                skills: ["Reinforcement Learning", "Graph Neural Networks", "Federated Learning", "Model Optimization", "Research Paper Implementation"],
                resources: ["DeepMind RL Course", "Stanford CS224W", "Research Papers", "ArXiv"],
                projects: [
                    { title: "RL Game Agent", desc: "Train agent to play a game" },
                    { title: "Paper Implementation", desc: "Implement latest research paper" }
                ],
                certifications: ["Advanced ML Specialization", "Research Publications (goal)"]
            }
        ]
    },

    "Cloud Architect": {
        totalMonths: 8,
        phases: [
            {
                name: "Cloud Fundamentals",
                duration: "2 months",
                skills: ["Cloud Computing Basics", "AWS/Azure/GCP Overview", "Networking Fundamentals", "Security Basics", "Linux Command Line"],
                resources: ["AWS Cloud Practitioner", "Azure Fundamentals", "GCP Essentials", "Cloud Guru"],
                projects: [
                    { title: "Static Website Hosting", desc: "Deploy website on S3/Cloud Storage" },
                    { title: "VPC Setup", desc: "Configure virtual private cloud" }
                ],
                certifications: ["AWS Cloud Practitioner", "Azure Fundamentals AZ-900"]
            },
            {
                name: "Core Services",
                duration: "2 months",
                skills: ["Compute (EC2, Lambda)", "Storage (S3, EBS)", "Databases (RDS, DynamoDB)", "Load Balancing", "Auto Scaling"],
                resources: ["AWS Solutions Architect", "Azure Architect", "Hands-On Labs", "Cloud Academy"],
                projects: [
                    { title: "Scalable Web App", desc: "Multi-tier app with auto-scaling" },
                    { title: "Serverless API", desc: "Build API using Lambda/Functions" }
                ],
                certifications: ["AWS Solutions Architect Associate", "Azure Administrator AZ-104"]
            },
            {
                name: "Architecture Design",
                duration: "2 months",
                skills: ["High Availability", "Disaster Recovery", "Microservices", "Serverless Architecture", "API Gateway"],
                resources: ["AWS Well-Architected", "Azure Architecture Center", "System Design", "Cloud Design Patterns"],
                projects: [
                    { title: "Multi-Region App", desc: "Design globally distributed application" },
                    { title: "DR Strategy", desc: "Implement disaster recovery plan" }
                ],
                certifications: ["AWS Solutions Architect Professional", "Azure Solutions Architect AZ-305"]
            },
            {
                name: "Advanced & Security",
                duration: "2 months",
                skills: ["IAM & Security", "Compliance", "Cost Optimization", "Hybrid Cloud", "Infrastructure as Code (Terraform)"],
                resources: ["Terraform Docs", "Cloud Security Alliance", "FinOps", "Compliance Frameworks"],
                projects: [
                    { title: "Secure Cloud Infrastructure", desc: "Implement zero-trust architecture" },
                    { title: "IaC with Terraform", desc: "Automated infrastructure deployment" }
                ],
                certifications: ["AWS Security Specialty", "Terraform Associate"]
            }
        ]
    },

    "DevOps Engineer": {
        totalMonths: 7,
        phases: [
            {
                name: "Linux & Scripting",
                duration: "1.5 months",
                skills: ["Linux System Administration", "Bash Scripting", "Python for Automation", "Git Advanced", "Networking Basics"],
                resources: ["Linux Journey", "Bash Scripting Guide", "Python Automation", "Git Pro Book"],
                projects: [
                    { title: "System Monitoring Script", desc: "Bash script for server monitoring" },
                    { title: "Automation Tool", desc: "Python tool for repetitive tasks" }
                ],
                certifications: ["Linux Foundation Certified SysAdmin", "Red Hat Certified"]
            },
            {
                name: "Containers & Orchestration",
                duration: "2 months",
                skills: ["Docker Fundamentals", "Docker Compose", "Kubernetes Basics", "Helm Charts", "Container Security"],
                resources: ["Docker Docs", "Kubernetes.io", "KodeKloud", "Docker Mastery Course"],
                projects: [
                    { title: "Dockerized Application", desc: "Containerize a full-stack app" },
                    { title: "K8s Cluster", desc: "Deploy app on Kubernetes cluster" }
                ],
                certifications: ["Docker Certified Associate", "Certified Kubernetes Administrator (CKA)"]
            },
            {
                name: "CI/CD Pipelines",
                duration: "2 months",
                skills: ["Jenkins/GitLab CI", "GitHub Actions", "Pipeline as Code", "Testing Automation", "Artifact Management"],
                resources: ["Jenkins Docs", "GitLab CI/CD Guide", "GitHub Actions", "CI/CD Patterns"],
                projects: [
                    { title: "Complete CI/CD Pipeline", desc: "Build, test, deploy automation" },
                    { title: "Multi-Environment Deployment", desc: "Dev, staging, prod pipelines" }
                ],
                certifications: ["Jenkins Engineer", "GitLab CI/CD Specialist"]
            },
            {
                name: "Infrastructure as Code & Monitoring",
                duration: "1.5 months",
                skills: ["Terraform", "Ansible", "CloudFormation", "Prometheus & Grafana", "ELK Stack"],
                resources: ["Terraform Docs", "Ansible Docs", "Prometheus Docs", "Grafana Tutorials"],
                projects: [
                    { title: "IaC Multi-Cloud", desc: "Infrastructure across AWS and Azure" },
                    { title: "Monitoring Stack", desc: "Set up Prometheus, Grafana, ELK" }
                ],
                certifications: ["Terraform Associate", "Prometheus Certified"]
            }
        ]
    },

    "Mobile Developer": {
        totalMonths: 6,
        phases: [
            {
                name: "Programming Fundamentals",
                duration: "1.5 months",
                skills: ["JavaScript/Dart Basics", "Mobile UI/UX Principles", "Version Control (Git)", "Component Architecture", "Debugging"],
                resources: ["JavaScript.info", "Dart Language Tour", "Mobile Design Guidelines", "Git Basics"],
                projects: [
                    { title: "Calculator App", desc: "Basic calculator with responsive UI" },
                    { title: "Todo List", desc: "Task manager with local storage" }
                ],
                certifications: ["JavaScript Fundamentals", "Mobile UX Design"]
            },
            {
                name: "Cross-Platform Development",
                duration: "2.5 months",
                skills: ["React Native/Flutter", "Navigation", "State Management", "Animations", "Platform-Specific Code"],
                resources: ["React Native Docs", "Flutter Docs", "Udemy Courses", "Official Tutorials"],
                projects: [
                    { title: "Weather App", desc: "Fetch weather data from API" },
                    { title: "Social Media Feed", desc: "Infinite scroll feed with images" }
                ],
                certifications: ["React Native Developer", "Flutter Certified"]
            },
            {
                name: "Backend Integration",
                duration: "1.5 months",
                skills: ["REST API Integration", "Firebase/Supabase", "Authentication", "Push Notifications", "Offline Storage"],
                resources: ["Firebase Docs", "REST API Guide", "AsyncStorage Docs", "SQLite Tutorial"],
                projects: [
                    { title: "Chat Application", desc: "Real-time messaging with Firebase" },
                    { title: "E-commerce App", desc: "Shopping app with cart and checkout" }
                ],
                certifications: ["Firebase Certified", "API Integration Expert"]
            },
            {
                name: "Publishing & Advanced",
                duration: "0.5 months",
                skills: ["App Store Optimization", "Google Play Console", "Performance Optimization", "Testing (Jest, Detox)", "Analytics"],
                resources: ["App Store Guidelines", "Play Console Help", "Performance Best Practices", "Analytics Setup"],
                projects: [
                    { title: "Published App", desc: "Launch app on both stores" },
                    { title: "Optimized App", desc: "Performance and size optimization" }
                ],
                certifications: ["Mobile App Developer Certificate"]
            }
        ]
    }
};

// Initialize
window.onload = function() {
    setupRoleSelection();
};

// Setup Role Selection
function setupRoleSelection() {
    const roleCards = document.querySelectorAll('.role-card');
    const generateBtn = document.getElementById('generateBtn');

    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected from all
            roleCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected to clicked
            card.classList.add('selected');
            
            // Store selected role
            selectedRole = card.dataset.role;
            
            // Enable button
            generateBtn.disabled = false;
        });
    });
}

// Generate Roadmap
function generateRoadmap() {
    if (!selectedRole) {
        alert('⚠️ Please select a role first!');
        return;
    }

    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');

    setTimeout(() => {
        const roadmap = roadmapData[selectedRole];
        
        if (!roadmap) {
            alert('Roadmap not available for this role');
            document.getElementById('loadingOverlay').classList.remove('active');
            return;
        }

        displayRoadmap(roadmap);
        document.getElementById('loadingOverlay').classList.remove('active');
        document.getElementById('roadmapContainer').classList.add('active');
        document.getElementById('roadmapContainer').scrollIntoView({ behavior: 'smooth' });
    }, 1500);
}

// Display Roadmap
function displayRoadmap(roadmap) {
    const phasesContainer = document.getElementById('phasesContainer');
    phasesContainer.innerHTML = '';

    // Calculate total skills
    let totalSkills = 0;
    roadmap.phases.forEach(phase => {
        totalSkills += phase.skills.length;
    });

    // Set stats
    document.getElementById('totalSkills').textContent = totalSkills;
    document.getElementById('estimatedTime').textContent = roadmap.totalMonths;

    // Random initial progress (simulate saved progress)
    const initialProgress = Math.floor(Math.random() * 30);
    const initialCompleted = Math.floor((initialProgress / 100) * totalSkills);
    
    updateProgress(initialProgress, initialCompleted);

    // Create phase cards
    roadmap.phases.forEach((phase, index) => {
        const phaseHTML = `
            <div class="phase-card">
                <div class="phase-header">
                    <div class="phase-number">${index + 1}</div>
                    <div class="phase-info">
                        <h3>${phase.name}</h3>
                        <div class="phase-duration">Duration: ${phase.duration}</div>
                    </div>
                </div>

                <div class="skills-checklist">
                    <div class="checklist-title">Skills to Master</div>
                    ${phase.skills.map((skill, idx) => {
                        const isCompleted = Math.random() > 0.7;
                        return `
                            <div class="skill-item ${isCompleted ? 'completed' : ''}" onclick="toggleSkill(this)">
                                <div class="skill-checkbox">${isCompleted ? '✓' : ''}</div>
                                <div class="skill-name">${skill}</div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="resources-section">
                    <div class="resources-title">📚 Learning Resources</div>
                    <div class="resources-grid">
                        ${phase.resources.map(resource => `
                            <a href="#" class="resource-link" onclick="event.preventDefault(); window.open('https://www.google.com/search?q=${encodeURIComponent(resource)}', '_blank')">
                                ${resource}
                            </a>
                        `).join('')}
                    </div>
                </div>

                ${phase.projects ? `
                <div class="projects-section">
                    <div class="projects-title">🚀 Project Ideas</div>
                    ${phase.projects.map(project => `
                        <div class="project-item">
                            <h4>${project.title}</h4>
                            <p>${project.desc}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${phase.certifications ? `
                <div class="certs-section">
                    <div class="certs-title">🏆 Recommended Certifications</div>
                    ${phase.certifications.map(cert => `
                        <span class="cert-badge">${cert}</span>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
        
        phasesContainer.insertAdjacentHTML('beforeend', phaseHTML);
    });

    // Update progress after rendering
    recalculateProgress();
}

// Toggle Skill Completion
function toggleSkill(element) {
    element.classList.toggle('completed');
    const checkbox = element.querySelector('.skill-checkbox');
    
    if (element.classList.contains('completed')) {
        checkbox.textContent = '✓';
        
        // Celebration animation
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'pulse 0.3s ease';
        }, 10);
    } else {
        checkbox.textContent = '';
    }

    recalculateProgress();
}

// Recalculate Progress
function recalculateProgress() {
    const allSkills = document.querySelectorAll('.skill-item');
    const completedSkills = document.querySelectorAll('.skill-item.completed');
    
    if (allSkills.length === 0) return;

    const completed = completedSkills.length;
    const total = allSkills.length;
    const progress = Math.round((completed / total) * 100);

    updateProgress(progress, completed);
}

// Update Progress Display
function updateProgress(progress, completed) {
    const progressCircle = document.getElementById('progressCircle');
    const progressValue = document.getElementById('progressValue');
    const completedSkills = document.getElementById('completedSkills');

    progressCircle.style.setProperty('--progress', progress);
    progressValue.textContent = progress + '%';
    completedSkills.textContent = completed || 0;
}

// Add pulse animation for completed skills
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);

console.log('🗺️ Learning Roadmap loaded successfully!');