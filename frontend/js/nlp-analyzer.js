// =============================================
// ENTERPRISE NLP ANALYZER - COMPANY LEVEL
// Groq AI-Powered Resume Analysis
// Version 2.0 - Production Ready
// =============================================

const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : '/api'; // Production

const CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
    ],
    ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.doc', '.txt'],
    RETRY_ATTEMPTS: 2,
    TIMEOUT: 60000 // 60 seconds
};

// Global state
let uploadedFile = null;
let analysisInProgress = false;
let currentAnalysis = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 NLP Analyzer Pro initializing...');
    initializeUploadZone();
    checkAuthentication();
    loadPreviousAnalysis();
});

function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('⚠️ No authentication token found');
        // Don't redirect immediately, let user try to upload first
    }
}

function loadPreviousAnalysis() {
    const saved = localStorage.getItem('lastNLPAnalysis');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (Date.now() - data.timestamp < 3600000) { // 1 hour
                console.log('📋 Previous analysis found');
                // Could optionally restore it
            }
        } catch (e) {
            localStorage.removeItem('lastNLPAnalysis');
        }
    }
}

// ==================== FILE UPLOAD ====================
function initializeUploadZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('resumeFile');

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
    
    console.log('✅ Upload zone initialized');
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(files[0]);
        document.getElementById('resumeFile').files = dataTransfer.files;
        handleFileUpload();
    }
}

function handleFileUpload() {
    const fileInput = document.getElementById('resumeFile');
    const file = fileInput.files[0];
    
    if (!file) {
        console.log('No file selected');
        return;
    }

    console.log('📄 File selected:', file.name, `(${formatBytes(file.size)})`);

    // Validate file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showNotification(`❌ File size exceeds ${formatBytes(CONFIG.MAX_FILE_SIZE)} limit`, 'error');
        resetFileInput();
        return;
    }

    // Validate file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!CONFIG.ALLOWED_TYPES.includes(file.type) && !CONFIG.ALLOWED_EXTENSIONS.includes(fileExt)) {
        showNotification('❌ Only PDF, DOCX, and TXT files are supported', 'error');
        resetFileInput();
        return;
    }

    // Additional validation for corrupted files
    if (file.size < 100) {
        showNotification('❌ File appears to be empty or corrupted', 'error');
        resetFileInput();
        return;
    }

    // Store file
    uploadedFile = file;
    
    // Update UI
    updateFileDisplay(file);
    document.getElementById('analyzeBtn').disabled = false;
    
    showNotification('✅ Resume uploaded successfully', 'success');
    
    // Track upload event
    trackEvent('file_uploaded', { fileType: fileExt, fileSize: file.size });
}

function updateFileDisplay(file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatBytes(file.size);
    document.getElementById('fileSelected').classList.add('active');
}

function removeFile() {
    uploadedFile = null;
    resetFileInput();
    document.getElementById('fileSelected').classList.remove('active');
    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('resultsPanel').classList.remove('active');
    
    showNotification('File removed', 'info');
}

function resetFileInput() {
    const fileInput = document.getElementById('resumeFile');
    fileInput.value = '';
    uploadedFile = null;
}

// ==================== ANALYZE RESUME ====================
async function analyzeResume() {
    if (!uploadedFile) {
        showNotification('❌ Please upload a resume first', 'error');
        return;
    }

    if (analysisInProgress) {
        console.log('⏳ Analysis already in progress');
        return;
    }

    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('❌ Please login to continue', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }

    analysisInProgress = true;
    const startTime = Date.now();

    // Update UI
    const button = document.getElementById('analyzeBtn');
    const btnText = document.getElementById('btnText');
    const originalText = btnText.textContent;
    
    button.disabled = true;
    btnText.textContent = 'Analyzing...';

    document.getElementById('loadingState').classList.add('active');
    document.getElementById('resultsPanel').classList.remove('active');

    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('resume', uploadedFile);
        
        const jobDescription = document.getElementById('jobDescription').value.trim();
        if (jobDescription) {
            formData.append('jobDescription', jobDescription);
        }

        console.log('📤 Sending analysis request...');
        console.log('   File:', uploadedFile.name);
        console.log('   Size:', formatBytes(uploadedFile.size));
        console.log('   JD:', jobDescription ? 'Yes' : 'No');

        // Make API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

        const response = await fetch(`${API_BASE}/nlp/analyze-resume`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Check response
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Analysis failed');
        }

        if (!data.analysis) {
            throw new Error('No analysis data received');
        }

        // Success
        const processingTime = Date.now() - startTime;
        console.log('✅ Analysis complete in', processingTime, 'ms');

        currentAnalysis = {
            ...data.analysis,
            timestamp: Date.now(),
            fileName: uploadedFile.name,
            processingTime: `${(processingTime / 1000).toFixed(2)}s`
        };

        // Save to localStorage
        localStorage.setItem('lastNLPAnalysis', JSON.stringify(currentAnalysis));

        // Display results
        displayResults(currentAnalysis);
        
        showNotification('✅ Analysis completed successfully!', 'success');

        // Track success
        trackEvent('analysis_success', {
            processingTime,
            skillsFound: data.analysis.skills?.length || 0,
            overallScore: data.analysis.overallScore || 0
        });

    } catch (error) {
        console.error('❌ Analysis error:', error);

        let errorMessage = error.message;

        if (error.name === 'AbortError') {
            errorMessage = 'Request timeout - please try again';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server - please check if backend is running';
        } else if (error.message.includes('401')) {
            errorMessage = 'Session expired - please login again';
            setTimeout(() => window.location.href = '/login.html', 2000);
        }

        showNotification('❌ ' + errorMessage, 'error');
        document.getElementById('loadingState').classList.remove('active');

        // Track error
        trackEvent('analysis_error', { error: errorMessage });

    } finally {
        analysisInProgress = false;
        button.disabled = false;
        btnText.textContent = originalText;
    }
}

// ==================== DISPLAY RESULTS ====================
function displayResults(analysis) {
    console.log('📊 Displaying results:', analysis);
    
    document.getElementById('loadingState').classList.remove('active');
    
    const panel = document.getElementById('resultsPanel');
    
    // Build comprehensive results HTML
    let html = '';

    // SCORE CARDS
    html += buildScoreCards(analysis);

    // SKILLS SECTION
    if (analysis.skillsByCategory && Object.keys(analysis.skillsByCategory).length > 0) {
        html += buildSkillsSection(analysis);
    } else if (analysis.skills && analysis.skills.length > 0) {
        html += buildSimpleSkillsSection(analysis);
    }

    // RECOMMENDATIONS
    if (analysis.recommendations && analysis.recommendations.length > 0) {
        html += buildRecommendationsSection(analysis);
    }

    // INSIGHTS
    if (analysis.insights && analysis.insights.length > 0) {
        html += buildInsightsSection(analysis);
    }

    // IMPROVEMENTS
    if (analysis.improvements && analysis.improvements.length > 0) {
        html += buildImprovementsSection(analysis);
    }

    // JOB MATCH
    if (analysis.jobMatch) {
        html += buildJobMatchSection(analysis);
    }

    // WRITING QUALITY
    if (analysis.writingQuality || analysis.tone) {
        html += buildWritingQualitySection(analysis);
    }

    // KEY PHRASES
    if (analysis.keyPhrases && analysis.keyPhrases.length > 0) {
        html += buildKeyPhrasesSection(analysis);
    }

    // FOOTER
    html += buildFooter(analysis);

    panel.innerHTML = html;
    panel.classList.add('active');
    
    // Smooth scroll to results
    setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function buildScoreCards(analysis) {
    return `
    <div class="score-grid">
        <div class="score-card" style="--card-accent: linear-gradient(135deg, #10B981, #059669);">
            <div class="score-label">Overall Score</div>
            <div class="score-value" style="color: #10B981;">${analysis.overallScore || 0}</div>
            <div class="score-desc">${getScoreLabel(analysis.overallScore || 0)}</div>
        </div>
        <div class="score-card" style="--card-accent: linear-gradient(135deg, #6366F1, #4F46E5);">
            <div class="score-label">ATS Score</div>
            <div class="score-value" style="color: #6366F1;">${analysis.atsScore || 0}%</div>
            <div class="score-desc">${analysis.atsLevel || 'Not rated'}</div>
        </div>
        <div class="score-card" style="--card-accent: linear-gradient(135deg, #F59E0B, #D97706);">
            <div class="score-label">Experience</div>
            <div class="score-value" style="color: #F59E0B; font-size: 36px;">${analysis.experienceYears || 0}<span style="font-size: 20px;">yrs</span></div>
            <div class="score-desc">${analysis.experienceLevel || analysis.experience || 'Not detected'}</div>
        </div>
    </div>
    `;
}

function buildSkillsSection(analysis) {
    let html = `
    <div class="analysis-section">
        <div class="section-header">
            <div class="section-icon">🎯</div>
            <div class="section-title">Skills Detected</div>
            <div class="section-count">${analysis.skills?.length || 0} total</div>
        </div>
    `;

    for (const [category, skills] of Object.entries(analysis.skillsByCategory)) {
        if (skills && skills.length > 0) {
            const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
            html += `
            <div class="category-section">
                <div class="category-header">
                    ${getCategoryIcon(category)} ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
                    <span class="category-badge">${skills.length}</span>
                </div>
                <div class="skills-grid">
                    ${skills.map(skill => {
                        const skillName = typeof skill === 'object' ? (skill.skill || skill.name) : skill;
                        const proficiency = typeof skill === 'object' ? skill.proficiency : '';
                        return `
                        <div class="skill-item">
                            <span class="skill-icon">✓</span>
                            ${skillName}
                            ${proficiency ? `<span style="margin-left: auto; font-size: 11px; opacity: 0.7;">${proficiency}</span>` : ''}
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            `;
        }
    }

    html += `</div>`;
    return html;
}

function buildSimpleSkillsSection(analysis) {
    return `
    <div class="analysis-section">
        <div class="section-header">
            <div class="section-icon">🎯</div>
            <div class="section-title">Skills Detected</div>
            <div class="section-count">${analysis.skills.length}</div>
        </div>
        <div class="skills-grid">
            ${analysis.skills.map(skill => `
                <div class="skill-item"><span class="skill-icon">✓</span>${skill}</div>
            `).join('')}
        </div>
    </div>
    `;
}

function buildRecommendationsSection(analysis) {
    return `
    <div class="analysis-section">
        <div class="section-header">
            <div class="section-icon">💡</div>
            <div class="section-title">Recommendations</div>
            <div class="section-count">${analysis.recommendations.length}</div>
        </div>
        <div class="recommendations-list">
            ${analysis.recommendations.map(rec => {
                const priority = rec.priority || 'medium';
                const category = rec.category || 'General';
                const message = rec.message || rec;
                const action = rec.action || '';
                
                return `
                <div class="recommendation-item ${priority}">
                    <div class="rec-icon">${getPriorityIcon(priority)}</div>
                    <div class="rec-content">
                        <div class="rec-category">${category}</div>
                        <div class="rec-message">${message}</div>
                        ${action ? `<div class="rec-action">→ ${action}</div>` : ''}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    </div>
    `;
}

function buildInsightsSection(analysis) {
    return `
    <div class="analysis-section">
        <div class="section-header">
            <div class="section-icon">🔍</div>
            <div class="section-title">Key Insights</div>
        </div>
        <div class="insights-grid">
            ${analysis.insights.map(insight => `
                <div class="insight-item">
                    <span class="insight-icon">💡</span>
                    <span>${insight}</span>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

function buildImprovementsSection(analysis) {
    return `
    <div class="analysis-section">
        <div class="section-header">
            <div class="section-icon">📈</div>
            <div class="section-title">Improvement Areas</div>
        </div>
        <div class="insights-grid">
            ${analysis.improvements.map(improvement => `
                <div class="insight-item" style="background: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.15);">
                    <span class="insight-icon">⚡</span>
                    <span>${improvement}</span>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

function buildJobMatchSection(analysis) {
    return `
    <div class="analysis-section">
        <div class="section-header">
            <div class="section-icon">🎯</div>
            <div class="section-title">Job Match Analysis</div>
            <div class="section-count">${analysis.jobMatch.score || 0}%</div>
        </div>
        <div style="font-size: 24px; font-weight: 700; color: ${getMatchColor(analysis.jobMatch.score)}; margin-bottom: 16px;">
            ${analysis.jobMatch.level || 'Not rated'}
        </div>
        ${analysis.jobMatch.matchingSkills && analysis.jobMatch.matchingSkills.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <div style="font-weight: 700; margin-bottom: 10px; color: #10B981;">✓ Matching Skills (${analysis.jobMatch.matchingSkills.length})</div>
                <div class="skills-grid">
                    ${analysis.jobMatch.matchingSkills.map(skill => `
                        <div class="skill-item" style="border-color: rgba(16, 185, 129, 0.3);"><span class="skill-icon">✓</span>${skill}</div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        ${analysis.jobMatch.missingSkills && analysis.jobMatch.missingSkills.length > 0 ? `
            <div>
                <div style="font-weight: 700; margin-bottom: 10px; color: #EF4444;">⚠️ Missing Skills (${analysis.jobMatch.missingSkills.length})</div>
                <div class="skills-grid">
                    ${analysis.jobMatch.missingSkills.map(skill => `
                        <div class="skill-item" style="background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.2); color: #DC2626;"><span class="skill-icon">×</span>${skill}</div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        ${analysis.jobMatch.recommendation ? `
            <div style="margin-top: 20px; padding: 16px; background: rgba(99, 102, 241, 0.05); border-left: 3px solid #6366F1; border-radius: 8px;">
                <strong>Recommendation:</strong> ${analysis.jobMatch.recommendation}
            </div>
        ` : ''}
    </div>
    `;
}

function buildWritingQualitySection(analysis) {
    const quality = analysis.writingQuality || 'average';
    const tone = analysis.tone;
    
    return `
    <div class="analysis-section">
        <div class="section-header">
            <div class="section-icon">📝</div>
            <div class="section-title">Writing Quality</div>
        </div>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 12px; text-transform: capitalize;">
            ${quality}
        </div>
        ${tone ? `
            <div style="color: var(--text-secondary); line-height: 1.6;">
                ${tone.description || ''}
            </div>
        ` : ''}
    </div>
    `;
}

function buildKeyPhrasesSection(analysis) {
    return `
    <div class="analysis-section">
        <div class="section-header">
            <div class="section-icon">✨</div>
            <div class="section-title">Key Phrases</div>
        </div>
        <div class="skills-grid">
            ${analysis.keyPhrases.map(phrase => `
                <div class="skill-item" style="background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.2); color: #4F46E5;">
                    <span class="skill-icon">✨</span>${phrase}
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

function buildFooter(analysis) {
    return `
    <div style="text-align: center; padding: 32px 24px; color: var(--text-muted); font-size: 14px; border-top: 1px solid var(--border); margin-top: 24px;">
        ${analysis.groqPowered ? '🤖 Powered by Groq AI (Llama 3.3 70B)' : '⚡ Powered by Advanced NLP'} 
        ${analysis.processingTime ? ' • Processing time: ' + analysis.processingTime : ''}
        <br><br>
        <button onclick="downloadAnalysis()" style="background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; margin-right: 12px;">
            📥 Download Report
        </button>
        <button onclick="removeFile()" style="background: var(--bg-card); color: var(--text-light); border: 1px solid var(--border); padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer;">
            🔄 Analyze Another
        </button>
    </div>
    `;
}

// ==================== DOWNLOAD ANALYSIS ====================
function downloadAnalysis() {
    if (!currentAnalysis) {
        showNotification('❌ No analysis to download', 'error');
        return;
    }

    const report = {
        fileName: currentAnalysis.fileName,
        timestamp: new Date(currentAnalysis.timestamp).toISOString(),
        overallScore: currentAnalysis.overallScore,
        atsScore: currentAnalysis.atsScore,
        experienceYears: currentAnalysis.experienceYears,
        skills: currentAnalysis.skills,
        recommendations: currentAnalysis.recommendations,
        insights: currentAnalysis.insights,
        groqPowered: currentAnalysis.groqPowered
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('✅ Analysis downloaded', 'success');
    trackEvent('analysis_downloaded');
}

// ==================== HELPER FUNCTIONS ====================
function getScoreLabel(score) {
    if (score >= 90) return '🌟 Exceptional';
    if (score >= 80) return '🚀 Excellent';
    if (score >= 70) return '✅ Very Good';
    if (score >= 60) return '📊 Good';
    if (score >= 50) return '⚡ Average';
    return '⚠️ Needs Improvement';
}

function getCategoryIcon(category) {
    const icons = {
        'languages': '💻',
        'frontend': '🎨',
        'backend': '⚙️',
        'databases': '🗄️',
        'cloud': '☁️',
        'cloud_devops': '🚀',
        'cloudDevops': '🚀',
        'dataScience': '📊',
        'ai_ml': '🤖',
        'aiMl': '🤖',
        'mobile': '📱',
        'testing': '🧪',
        'tools': '🔧',
        'security': '🔒',
        'soft_skills': '💡',
        'softSkills': '💡'
    };
    return icons[category] || '📌';
}

function getPriorityIcon(priority) {
    const icons = {
        'high': '🔴',
        'medium': '🟡',
        'low': '🔵'
    };
    return icons[priority] || '⚪';
}

function getMatchColor(score) {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ==================== NOTIFICATION ====================
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notificationIcon');
    const text = document.getElementById('notificationText');
    
    const icons = {
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️',
        'warning': '⚠️'
    };
    
    icon.textContent = icons[type] || icons.info;
    text.textContent = message;
    notification.className = 'notification active ' + type;
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 5000);
}

// ==================== ANALYTICS ====================
function trackEvent(eventName, data = {}) {
    console.log('📊 Event:', eventName, data);
    
    // Could send to analytics service
    // Example: Google Analytics, Mixpanel, etc.
    
    if (window.gtag) {
        window.gtag('event', eventName, data);
    }
}

// Export functions for HTML onclick handlers
window.handleFileUpload = handleFileUpload;
window.removeFile = removeFile;
window.analyzeResume = analyzeResume;
window.downloadAnalysis = downloadAnalysis;

console.log('✅ NLP Analyzer Pro JS loaded');