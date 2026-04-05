// frontend/js/interview-prep.js

// API_BASE set globally by config.js

let userAnswers = {};
let currentRole = "Full Stack Developer";

// Interview questions database
const questionDatabase = {
    "Full Stack Developer": [
        "Tell me about yourself and your experience with full stack development.",
        "Explain the difference between SQL and NoSQL databases. When would you use each?",
        "How do you handle authentication and authorization in a web application?",
        "Describe your experience with REST APIs. What makes a good API design?",
        "How do you optimize the performance of a web application?",
        "Explain the concept of responsive design and how you implement it.",
        "What is your approach to debugging complex issues in production?",
        "How do you manage state in a React/Vue/Angular application?",
        "Describe a challenging project you worked on and how you solved it.",
        "How do you ensure code quality and maintainability in your projects?"
    ],
    "Frontend Developer": [
        "What are the key differences between var, let, and const in JavaScript?",
        "Explain CSS specificity and the cascade.",
        "How do you optimize website performance and loading times?",
        "What are React hooks and why are they useful?",
        "How do you ensure cross-browser compatibility?",
        "Explain the virtual DOM and how it works.",
        "What is your approach to responsive web design?",
        "How do you handle form validation in JavaScript?",
        "Describe your experience with CSS preprocessors like Sass or Less.",
        "What accessibility standards do you follow when building websites?"
    ],
    "Backend Developer": [
        "Explain how you would design a RESTful API for a social media platform.",
        "What is database indexing and why is it important?",
        "How do you handle database migrations in production?",
        "Explain the difference between microservices and monolithic architecture.",
        "How do you implement caching in a backend application?",
        "What are some common security vulnerabilities and how do you prevent them?",
        "How do you handle concurrency and race conditions?",
        "Explain the concept of middleware in backend frameworks.",
        "How do you optimize database queries for better performance?",
        "Describe your experience with message queues and asynchronous processing."
    ],
    "Data Scientist": [
        "Explain the difference between supervised and unsupervised learning.",
        "How do you handle missing data in a dataset?",
        "What is overfitting and how do you prevent it?",
        "Describe the steps you take in a typical data science project.",
        "Explain the difference between precision and recall.",
        "How do you evaluate the performance of a machine learning model?",
        "What is feature engineering and why is it important?",
        "Describe your experience with data visualization tools.",
        "How do you handle imbalanced datasets?",
        "Explain the concept of cross-validation."
    ],
    "DevOps Engineer": [
        "Explain the CI/CD pipeline and its importance.",
        "How do you implement infrastructure as code?",
        "What is containerization and how does Docker work?",
        "Explain the difference between horizontal and vertical scaling.",
        "How do you monitor and troubleshoot production issues?",
        "Describe your experience with cloud platforms like AWS or Azure.",
        "What is Kubernetes and why is it used?",
        "How do you implement security in a DevOps environment?",
        "Explain the concept of blue-green deployment.",
        "How do you manage secrets and sensitive configuration?"
    ],
    "Java Developer": [
        "Explain the principles of Object-Oriented Programming.",
        "What is the difference between abstract classes and interfaces?",
        "How does garbage collection work in Java?",
        "Explain the difference between ArrayList and LinkedList.",
        "What are Java Streams and how do you use them?",
        "Describe your experience with Spring Framework.",
        "How do you handle exceptions in Java?",
        "What is dependency injection and why is it useful?",
        "Explain multithreading in Java and how you implement it.",
        "What are design patterns and which ones have you used?"
    ],
    "Python Developer": [
        "Explain the difference between lists and tuples in Python.",
        "What are Python decorators and how do you use them?",
        "How does memory management work in Python?",
        "Explain the Global Interpreter Lock (GIL).",
        "What is the difference between deep copy and shallow copy?",
        "Describe your experience with Python frameworks like Django or Flask.",
        "How do you handle errors and exceptions in Python?",
        "What are generators and when would you use them?",
        "Explain list comprehensions and their advantages.",
        "How do you optimize Python code for better performance?"
    ]
};

window.onload = async function() {
    await loadUserAnswers();
    loadQuestions(currentRole);
    updateStats();
    
    document.getElementById("roleSelect").addEventListener("change", (e) => {
        currentRole = e.target.value;
        loadQuestions(currentRole);
        updateStats();
    });,
    "ML Engineer": [
        "Explain the bias-variance tradeoff and how you handle it in practice.",
        "What is the difference between bagging and boosting? When do you use each?",
        "How do you handle class imbalance in a classification dataset?",
        "Explain the transformer architecture and the self-attention mechanism.",
        "What is feature importance and how do you calculate it?",
        "How do you deploy a machine learning model to production at scale?",
        "What is regularization? Compare L1 and L2 regularization.",
        "Explain gradient descent and its variants: SGD, Adam, RMSProp.",
        "How do you detect and handle model drift in production?",
        "Describe the end-to-end ML pipeline you've built from data to deployment."
    ],
    "Cloud Architect": [
        "How do you design a highly available, fault-tolerant cloud architecture?",
        "Explain the differences between IaaS, PaaS, and SaaS with real examples.",
        "How do you optimize cloud costs without sacrificing performance?",
        "Describe your approach to multi-cloud and hybrid cloud strategies.",
        "How do you implement security and compliance in cloud environments?",
        "Explain auto-scaling strategies: reactive vs predictive scaling.",
        "What is infrastructure as code and which tools have you used?",
        "How do you design disaster recovery for a cloud-native application?",
        "Explain the CAP theorem and its implications for distributed systems.",
        "How do you handle data residency requirements in global deployments?"
    ],
    "Cybersecurity Analyst": [
        "Explain the difference between symmetric and asymmetric encryption.",
        "What is the OWASP Top 10 and how do you address each vulnerability?",
        "How would you respond to a ransomware attack in a production environment?",
        "Explain the concept of zero-trust architecture and how to implement it.",
        "What is threat modeling? Walk me through the STRIDE methodology.",
        "How do you conduct a penetration test on a web application?",
        "Explain the difference between IDS and IPS systems.",
        "What is SIEM and how have you used it to detect threats?",
        "How do you investigate a potential insider threat incident?",
        "Describe your incident response process from detection to post-mortem."
    ]
};

async function loadUserAnswers() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login.html";
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/interview/answers`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            userAnswers = data.answers || {};
        }
    } catch (error) {
        console.error("Error loading answers:", error);
    }
}

function loadQuestions(role) {
    const container = document.getElementById("questionsContainer");
    const questions = questionDatabase[role];
    
    container.innerHTML = questions.map((question, index) => {
        const answerId = `${role}-${index}`;
        const savedAnswer = userAnswers[answerId] || {};
        const isPracticed = savedAnswer.practiced || false;
        
        return `
            <div class="question-card">
                ${isPracticed ? '<span class="practiced-badge">✓ Practiced</span>' : ''}
                <h3>${index + 1}. ${question}</h3>
                <div class="answer-area">
                    <textarea 
                        id="answer-${index}" 
                        placeholder="Type your answer here..."
                        data-question-id="${answerId}"
                    >${savedAnswer.answer || ''}</textarea>
                </div>
                <div class="card-actions">
                    <button class="btn btn-save" onclick="saveAnswer(${index}, '${role}')">
                        💾 Save Answer
                    </button>
                    <button class="btn btn-practiced" onclick="markPracticed(${index}, '${role}')">
                        ✓ Mark Practiced
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function saveAnswer(index, role) {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login.html"; return;
        return;
    }
    
    const textarea = document.getElementById(`answer-${index}`);
    const answer = textarea.value.trim();
    const questionId = `${role}-${index}`;
    const question = questionDatabase[role][index];
    
    if (!answer) {
        if (typeof showToast !== "undefined") showToast("Please write an answer first ⚠️", "⚠️"); return;
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/interview/save-answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                questionId,
                role,
                question,
                answer
            })
        });
        
        if (res.ok) {
            userAnswers[questionId] = { answer, practiced: userAnswers[questionId]?.practiced || false };
            if (typeof showToast !== "undefined") showToast("Answer saved! 💾"); else console.log("Saved");
            updateStats();
        }
    } catch (error) {
        console.error("Error saving answer:", error);
        if (typeof showToast !== "undefined") showToast("Failed to save answer ❌", "❌");
    }
}

async function markPracticed(index, role) {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login.html"; return;
        return;
    }
    
    const questionId = `${role}-${index}`;
    
    try {
        const res = await fetch(`${API_BASE}/interview/mark-practiced`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ questionId })
        });
        
        if (res.ok) {
            userAnswers[questionId] = userAnswers[questionId] || {};
            userAnswers[questionId].practiced = true;
            if (typeof showToast !== "undefined") showToast("Marked as practiced! ✅"); else console.log("Practiced");
            loadQuestions(currentRole);
            updateStats();
        }
    } catch (error) {
        console.error("Error marking practiced:", error);
        if (typeof showToast !== "undefined") showToast("Failed to mark practiced ❌", "❌");
    }
}

function updateStats() {
    const currentQuestions = questionDatabase[currentRole];
    const total = currentQuestions.length;
    
    let answered = 0;
    let practiced = 0;
    
    currentQuestions.forEach((q, index) => {
        const answerId = `${currentRole}-${index}`;
        const savedAnswer = userAnswers[answerId];
        
        if (savedAnswer) {
            if (savedAnswer.answer) answered++;
            if (savedAnswer.practiced) practiced++;
        }
    });
    
    document.getElementById("totalQuestions").textContent = total;
    document.getElementById("answeredQuestions").textContent = answered;
    document.getElementById("practicedQuestions").textContent = practiced;
}