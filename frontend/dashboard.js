// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// State
let authToken = null;
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (!authToken || !userId) {
        window.location.href = 'auth.html';
        return;
    }
    
    currentUser = { userId };
    initializeDashboard();
});

function initializeDashboard() {
    setupEventListeners();
    loadUserName();
    loadNotifications();
    loadAnalytics();
}

function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item[data-module]').forEach(item => {
        item.addEventListener('click', (e) => {
            const module = e.currentTarget.dataset.module;
            showModule(module);
        });
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Lab analyzer
    document.getElementById('analyze-btn').addEventListener('click', handleLabAnalysis);
    
    // Chat
    document.getElementById('send-chat-btn').addEventListener('click', handleSendChat);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendChat();
    });
    
    // Medications
    document.getElementById('add-medication-btn').addEventListener('click', () => {
        document.getElementById('add-medication-form').style.display = 'block';
    });
    
    document.getElementById('save-medication-btn').addEventListener('click', handleSaveMedication);
    
    document.getElementById('cancel-medication-btn').addEventListener('click', () => {
        document.getElementById('add-medication-form').style.display = 'none';
    });
    
    // Profile
    document.getElementById('profile-form').addEventListener('submit', handleUpdateProfile);
}

// Navigation Functions
function showModule(moduleName) {
    console.log('Showing module:', moduleName);
    
    // Update modules
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    document.getElementById(`${moduleName}-module`).classList.add('active');
    
    // Update sidebar
    document.querySelectorAll('.nav-item[data-module]').forEach(m => m.classList.remove('active'));
    document.querySelector(`[data-module="${moduleName}"]`).classList.add('active');
    
    // Update page title
    const titles = {
        'analytics': 'Analytics Dashboard',
        'lab-analyzer': 'Lab Report Analyzer',
        'ai-chat': 'AI Health Chat',
        'medications': 'Medication Tracker',
        'consultations': 'Doctor Consultations',
        'notifications': 'Notifications',
        'profile': 'My Profile',
        'clinician': 'Clinician Review Panel'
    };
    document.getElementById('page-title').textContent = titles[moduleName] || 'Dashboard';
    
    // Load module data
    if (moduleName === 'medications') loadMedications();
    if (moduleName === 'consultations') loadDoctors();
    if (moduleName === 'notifications') loadNotifications();
    if (moduleName === 'profile') loadProfile();
    if (moduleName === 'clinician') loadPendingDrafts();
    if (moduleName === 'ai-chat') loadChatHistory();
    if (moduleName === 'lab-analyzer') {
        console.log('Lab analyzer module activated, loading history...');
        loadLabHistory();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('mobile-active');
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
}

// User Functions
async function loadUserName() {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('user-name').textContent = data.name;
        }
    } catch (error) {
        console.error('Error loading user name:', error);
    }
}

// Analytics Functions
async function loadAnalytics() {
    console.log('Loading analytics...');
    try {
        // Try to load from backend first
        const [labReports, medications, consultations, chats] = await Promise.all([
            fetch(`${API_BASE_URL}/lab-report/history`, { headers: { 'Authorization': `Bearer ${authToken}` } }).catch(() => null),
            fetch(`${API_BASE_URL}/medications`, { headers: { 'Authorization': `Bearer ${authToken}` } }).catch(() => null),
            fetch(`${API_BASE_URL}/consultations`, { headers: { 'Authorization': `Bearer ${authToken}` } }).catch(() => null),
            fetch(`${API_BASE_URL}/chat/history`, { headers: { 'Authorization': `Bearer ${authToken}` } }).catch(() => null)
        ]);
        
        let labCount = 0, medCount = 0, consultCount = 0, chatCount = 0;
        
        // Try backend data first
        if (labReports && labReports.ok) {
            const data = await labReports.json();
            labCount = data.count || 0;
            console.log('Lab reports from backend:', labCount);
        } else {
            // Fallback to localStorage
            const localLabs = JSON.parse(localStorage.getItem('labReports') || '[]');
            labCount = localLabs.length;
            console.log('Lab reports from localStorage:', labCount);
        }
        
        if (medications && medications.ok) {
            const data = await medications.json();
            medCount = data.medications?.length || 0;
            console.log('Medications from backend:', medCount);
        } else {
            const localMeds = JSON.parse(localStorage.getItem('medications') || '[]');
            medCount = localMeds.length;
            console.log('Medications from localStorage:', medCount);
        }
        
        if (consultations && consultations.ok) {
            const data = await consultations.json();
            consultCount = data.consultations?.length || 0;
            console.log('Consultations from backend:', consultCount);
        } else {
            const localConsults = JSON.parse(localStorage.getItem('consultations') || '[]');
            consultCount = localConsults.length;
            console.log('Consultations from localStorage:', consultCount);
        }
        
        if (chats && chats.ok) {
            const data = await chats.json();
            chatCount = data.count || 0;
            console.log('Chats from backend:', chatCount);
        } else {
            const localChats = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            chatCount = localChats.length;
            console.log('Chats from localStorage:', chatCount);
        }
        
        // Update analytics cards
        document.getElementById('lab-reports-count').textContent = labCount;
        document.getElementById('medications-count').textContent = medCount;
        document.getElementById('consultations-count').textContent = consultCount;
        document.getElementById('chats-count').textContent = chatCount;
        
        console.log('Analytics updated:', { labCount, medCount, consultCount, chatCount });
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Load from localStorage as final fallback
        const labCount = JSON.parse(localStorage.getItem('labReports') || '[]').length;
        const medCount = JSON.parse(localStorage.getItem('medications') || '[]').length;
        const consultCount = JSON.parse(localStorage.getItem('consultations') || '[]').length;
        const chatCount = JSON.parse(localStorage.getItem('chatHistory') || '[]').length;
        
        document.getElementById('lab-reports-count').textContent = labCount;
        document.getElementById('medications-count').textContent = medCount;
        document.getElementById('consultations-count').textContent = consultCount;
        document.getElementById('chats-count').textContent = chatCount;
        
        console.log('Analytics loaded from localStorage (fallback):', { labCount, medCount, consultCount, chatCount });
    }
}

// Lab Analyzer Functions
function formatMarkdownText(text) {
    if (!text) return '';
    
    // Convert **text** to <strong>text</strong>
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *text* to <em>text</em>
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

async function handleLabAnalysis() {
    const reportText = document.getElementById('lab-report-input').value;
    
    if (!reportText.trim()) {
        alert('Please enter a lab report');
        return;
    }
    
    const resultContainer = document.getElementById('lab-result');
    resultContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Analyzing... Please wait.</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/lab-report/analyze`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ reportText })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save to localStorage
            const labReports = JSON.parse(localStorage.getItem('labReports') || '[]');
            labReports.unshift({
                id: data.reportId || Date.now(),
                reportText,
                parsedValues: data.parsedValues,
                abnormals: data.abnormals,
                aiExplanation: data.aiExplanation,
                analyzedAt: new Date().toISOString()
            });
            // Keep only last 20 reports
            if (labReports.length > 20) labReports.pop();
            localStorage.setItem('labReports', JSON.stringify(labReports));
            
            displayLabResults(data);
            loadLabHistory(); // Refresh history
            loadAnalytics(); // Refresh analytics
        } else {
            resultContainer.innerHTML = `<p class="error">${data.error}</p>`;
        }
    } catch (error) {
        resultContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

function displayLabResults(data) {
    const normalCount = data.parsedValues.length - data.abnormals.length;
    const abnormalCount = data.abnormals.length;
    
    let html = `
        <div class="lab-results-container">
            <div class="results-header">
                <h3><i class="fas fa-flask"></i> Lab Results Analysis</h3>
                <div class="results-summary">
                    <span class="summary-badge normal-badge">
                        <i class="fas fa-check-circle"></i> ${normalCount} Normal
                    </span>
                    ${abnormalCount > 0 ? `
                        <span class="summary-badge abnormal-badge">
                            <i class="fas fa-exclamation-triangle"></i> ${abnormalCount} Abnormal
                        </span>
                    ` : ''}
                </div>
            </div>
            
            <div class="results-table-wrapper">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th><i class="fas fa-vial"></i> Test Name</th>
                            <th><i class="fas fa-chart-line"></i> Value</th>
                            <th><i class="fas fa-ruler"></i> Unit</th>
                            <th><i class="fas fa-clipboard-check"></i> Status</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    data.parsedValues.forEach(test => {
        const isAbnormal = data.abnormals.includes(test.name);
        const statusClass = isAbnormal ? 'abnormal' : 'normal';
        const statusIcon = isAbnormal ? '<i class="fas fa-exclamation-circle"></i>' : '<i class="fas fa-check-circle"></i>';
        const statusText = isAbnormal ? 'Abnormal' : 'Normal';
        
        html += `
            <tr class="result-row ${statusClass}">
                <td class="test-name"><strong>${test.name}</strong></td>
                <td class="test-value">${test.value}</td>
                <td class="test-unit">${test.unit}</td>
                <td class="test-status">
                    <span class="status-badge ${statusClass}">
                        ${statusIcon} ${statusText}
                    </span>
                </td>
            </tr>`;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <div class="ai-explanation">
                <div class="explanation-header">
                    <i class="fas fa-robot"></i>
                    <h4>AI-Powered Analysis</h4>
                </div>
                <div class="explanation-content">
                    ${formatMarkdownText(data.aiExplanation)}
                </div>
            </div>
            
            <div class="disclaimer">
                <i class="fas fa-info-circle"></i>
                <div class="disclaimer-content">
                    ${data.disclaimer}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('lab-result').innerHTML = html;
}

// Load and display lab history
function loadLabHistory() {
    console.log('Loading lab history...');
    const labReports = JSON.parse(localStorage.getItem('labReports') || '[]');
    console.log('Lab reports from localStorage:', labReports.length);
    
    const historyContainer = document.getElementById('lab-history');
    
    if (!historyContainer) {
        console.error('Lab history container not found!');
        return;
    }
    
    if (labReports.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No previous lab reports. Analyze your first report above!</p>';
        return;
    }
    
    historyContainer.innerHTML = `
        <h3><i class="fas fa-history"></i> Previous Lab Reports</h3>
        <div class="history-list">
            ${labReports.map((report, index) => `
                <div class="history-item" onclick="viewLabReport(${index})">
                    <div class="history-header">
                        <span class="history-date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(report.analyzedAt).toLocaleString()}
                        </span>
                        <span class="history-badge">
                            ${report.abnormals.length > 0 
                                ? `<i class="fas fa-exclamation-triangle"></i> ${report.abnormals.length} Abnormal` 
                                : `<i class="fas fa-check-circle"></i> All Normal`}
                        </span>
                    </div>
                    <div class="history-preview">
                        ${report.parsedValues.slice(0, 3).map(test => test.name).join(', ')}
                        ${report.parsedValues.length > 3 ? ` +${report.parsedValues.length - 3} more` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    console.log('Lab history rendered successfully');
}

// View a specific lab report from history
function viewLabReport(index) {
    const labReports = JSON.parse(localStorage.getItem('labReports') || '[]');
    const report = labReports[index];
    
    if (!report) return;
    
    // Display the report
    displayLabResults({
        parsedValues: report.parsedValues,
        abnormals: report.abnormals,
        aiExplanation: report.aiExplanation,
        disclaimer: "⚠️ IMPORTANT: This analysis is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional for medical concerns."
    });
    
    // Scroll to results
    document.getElementById('lab-result').scrollIntoView({ behavior: 'smooth' });
}

// Chat Functions
async function handleSendChat() {
    const input = document.getElementById('chat-input');
    const question = input.value.trim();
    
    if (!question) return;
    
    const messagesContainer = document.getElementById('chat-messages');
    
    // Show user's question
    messagesContainer.innerHTML += `<div class="chat-message user">${question}</div>`;
    input.value = '';
    
    // Show loading
    messagesContainer.innerHTML += `<div class="chat-message ai loading"><i class="fas fa-spinner fa-spin"></i> Generating response...</div>`;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ question })
        });
        
        const data = await response.json();
        
        // Remove loading message
        const loadingMsg = messagesContainer.querySelector('.loading');
        if (loadingMsg) loadingMsg.remove();
        
        if (response.ok) {
            // Save to localStorage
            const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            chatHistory.push({
                draftId: data.draftId,
                question,
                status: 'pending_review',
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            
            // Show pending status message
            messagesContainer.innerHTML += `
                <div class="chat-message ai" data-draft-id="${data.draftId}">
                    <div class="pending-review">
                        <i class="fas fa-clock"></i> ${data.message}
                        <div class="review-status">⏳ Waiting for clinician approval</div>
                    </div>
                </div>`;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Poll for approval (check every 5 seconds)
            pollForApproval(data.draftId);
            loadAnalytics(); // Refresh analytics
        } else {
            messagesContainer.innerHTML += `<div class="chat-message ai error">Error: ${data.error}</div>`;
        }
    } catch (error) {
        // Remove loading message
        const loadingMsg = messagesContainer.querySelector('.loading');
        if (loadingMsg) loadingMsg.remove();
        
        messagesContainer.innerHTML += `<div class="chat-message ai error">Error: ${error.message}</div>`;
    }
}

// Poll for draft approval
async function pollForApproval(draftId) {
    const checkApproval = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/response/${draftId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const data = await response.json();
            
            if (data.status === 'approved') {
                // Update the message with approved response
                const messageEl = document.querySelector(`[data-draft-id="${draftId}"]`);
                if (messageEl) {
                    messageEl.innerHTML = `
                        ${formatMarkdownText(data.response)}
                        <div class="review-status approved">✅ Clinician Approved</div>
                    `;
                }
                return true; // Stop polling
            } else if (data.status === 'rejected') {
                const messageEl = document.querySelector(`[data-draft-id="${draftId}"]`);
                if (messageEl) {
                    messageEl.innerHTML = `
                        <div class="pending-review">
                            <i class="fas fa-exclamation-triangle"></i> ${data.message}
                        </div>
                    `;
                }
                return true; // Stop polling
            }
            
            return false; // Continue polling
        } catch (error) {
            console.error('Error checking approval:', error);
            return false;
        }
    };
    
    // Poll every 5 seconds, max 60 times (5 minutes)
    let attempts = 0;
    const maxAttempts = 60;
    
    const interval = setInterval(async () => {
        attempts++;
        const shouldStop = await checkApproval();
        
        if (shouldStop || attempts >= maxAttempts) {
            clearInterval(interval);
        }
    }, 5000);
}

// Load chat history when opening chat module
async function loadChatHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/history`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok && data.chats && data.chats.length > 0) {
            const messagesContainer = document.getElementById('chat-messages');
            messagesContainer.innerHTML = '';
            
            data.chats.reverse().forEach(chat => {
                // Show question
                messagesContainer.innerHTML += `<div class="chat-message user">${chat.question}</div>`;
                
                // Show response based on status
                if (chat.status === 'approved') {
                    messagesContainer.innerHTML += `
                        <div class="chat-message ai">
                            ${formatMarkdownText(chat.aiResponse)}
                            <div class="review-status approved">✅ Clinician Approved</div>
                        </div>`;
                } else if (chat.status === 'pending_review') {
                    messagesContainer.innerHTML += `
                        <div class="chat-message ai" data-draft-id="${chat.draftId}">
                            <div class="pending-review">
                                <i class="fas fa-clock"></i> Response pending clinician review
                                <div class="review-status">⏳ Waiting for clinician approval</div>
                            </div>
                        </div>`;
                    // Start polling for this draft
                    pollForApproval(chat.draftId);
                }
            });
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Medication Functions
async function loadMedications() {
    try {
        const response = await fetch(`${API_BASE_URL}/medications`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayMedications(data.medications);
        }
    } catch (error) {
        console.error('Error loading medications:', error);
    }
}

function displayMedications(medications) {
    const container = document.getElementById('medications-list');
    
    if (medications.length === 0) {
        container.innerHTML = '<p>No medications added yet. Click "Add Medication" to get started.</p>';
        return;
    }
    
    container.innerHTML = medications.map(med => `
        <div class="medication-card">
            <h4>${med.name}</h4>
            <p><strong>Dosage:</strong> ${med.dosage}</p>
            <p><strong>Frequency:</strong> ${med.frequency.replace(/_/g, ' ')}</p>
            ${med.notes ? `<p><strong>Notes:</strong> ${med.notes}</p>` : ''}
            <button onclick="deleteMedication('${med.medicationId}')">Delete</button>
        </div>
    `).join('');
}

async function handleSaveMedication() {
    const formData = {
        name: document.getElementById('med-name').value,
        dosage: document.getElementById('med-dosage').value,
        frequency: document.getElementById('med-frequency').value,
        notes: document.getElementById('med-notes').value
    };
    
    if (!formData.name || !formData.dosage || !formData.frequency) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/medications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Medication added successfully!');
            document.getElementById('add-medication-form').style.display = 'none';
            document.getElementById('med-name').value = '';
            document.getElementById('med-dosage').value = '';
            document.getElementById('med-frequency').value = '';
            document.getElementById('med-notes').value = '';
            loadMedications();
            loadAnalytics();
        } else {
            const data = await response.json();
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteMedication(medicationId) {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/medications/${medicationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadMedications();
            loadAnalytics();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Consultation Functions
async function loadDoctors() {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors`);
        const data = await response.json();
        
        if (response.ok) {
            displayDoctors(data.doctors);
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

function displayDoctors(doctors) {
    const container = document.getElementById('doctors-list');
    
    container.innerHTML = doctors.map(doc => {
        const price = doc.baseRate + (doc.experienceYears * 50);
        return `
            <div class="doctor-card">
                <h4>${doc.name}</h4>
                <p><strong>${doc.specialization}</strong></p>
                <p>Experience: ${doc.experienceYears} years</p>
                <p>Rating: ${doc.rating} ⭐</p>
                <p><strong>Consultation Fee: ₹${price}</strong></p>
                <button onclick="bookConsultation('${doc.doctorId}', '${doc.name}')">Book Consultation</button>
            </div>
        `;
    }).join('');
}

async function bookConsultation(doctorId, doctorName) {
    if (!confirm(`Book consultation with ${doctorName}?`)) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/consultations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ doctorId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save to localStorage
            const consultations = JSON.parse(localStorage.getItem('consultations') || '[]');
            consultations.push({
                consultationId: data.consultationId,
                doctorId,
                doctorName,
                scheduledFor: data.scheduledFor,
                status: 'scheduled',
                bookedAt: new Date().toISOString()
            });
            localStorage.setItem('consultations', JSON.stringify(consultations));
            
            alert(`Consultation booked successfully!\nScheduled for: ${new Date(data.scheduledFor).toLocaleString()}`);
            loadNotifications();
            loadAnalytics();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Notification Functions
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const badge = document.getElementById('notif-badge');
            if (badge) {
                badge.textContent = data.unreadCount;
            }
            displayNotifications(data.notifications);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function displayNotifications(notifications) {
    const container = document.getElementById('notifications-list');
    
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = '<p>No notifications yet.</p>';
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-card ${notif.isRead ? 'read' : 'unread'}" onclick="markAsRead('${notif.notificationId}')">
            <p><strong>${notif.type.replace(/_/g, ' ').toUpperCase()}</strong></p>
            <p>${notif.message}</p>
            <small>${new Date(notif.createdAt).toLocaleString()}</small>
        </div>
    `).join('');
}

async function markAsRead(notificationId) {
    try {
        await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        loadNotifications();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Profile Functions
async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('profile-name').value = data.name;
            document.getElementById('profile-email').value = data.email;
            document.getElementById('profile-age').value = data.age;
            document.getElementById('profile-gender').value = data.gender;
            document.getElementById('profile-phone').value = data.phone;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value,
        age: document.getElementById('profile-age').value,
        gender: document.getElementById('profile-gender').value,
        phone: document.getElementById('profile-phone').value
    };
    
    const password = document.getElementById('profile-password').value;
    if (password) formData.password = password;
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const messageEl = document.getElementById('profile-message');
            messageEl.textContent = 'Profile updated successfully!';
            messageEl.className = 'message success';
            messageEl.style.display = 'block';
            document.getElementById('profile-password').value = '';
            
            loadUserName();
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 3000);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Clinician View Functions
async function loadPendingDrafts() {
    try {
        // Fetch pending drafts
        const pendingResponse = await fetch(`${API_BASE_URL}/chat/pending`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        let pendingCount = 0;
        let approvedToday = 0;
        
        if (pendingResponse.ok) {
            const pendingData = await pendingResponse.json();
            pendingCount = pendingData.count;
            displayPendingDrafts(pendingData.drafts);
            
            // Fetch all chat history to count approved today
            const historyResponse = await fetch(`${API_BASE_URL}/chat/history`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                
                // Count approved drafts from today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                approvedToday = historyData.chats.filter(chat => {
                    if (chat.status === 'approved' && chat.reviewedAt) {
                        const reviewDate = new Date(chat.reviewedAt);
                        reviewDate.setHours(0, 0, 0, 0);
                        return reviewDate.getTime() === today.getTime();
                    }
                    return false;
                }).length;
            }
        } else {
            // Fallback to localStorage
            const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            
            // Count pending
            pendingCount = chatHistory.filter(chat => chat.status === 'pending_review').length;
            
            // Count approved today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            approvedToday = chatHistory.filter(chat => {
                if (chat.status === 'approved' && chat.reviewedAt) {
                    const reviewDate = new Date(chat.reviewedAt);
                    reviewDate.setHours(0, 0, 0, 0);
                    return reviewDate.getTime() === today.getTime();
                }
                return false;
            }).length;
            
            // Display pending from localStorage
            const pendingDrafts = chatHistory.filter(chat => chat.status === 'pending_review');
            displayPendingDrafts(pendingDrafts);
        }
        
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('pending-badge').textContent = pendingCount;
        document.getElementById('approved-today').textContent = approvedToday;
        
    } catch (error) {
        console.error('Error loading pending drafts:', error);
        
        // Final fallback to localStorage
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const pendingCount = chatHistory.filter(chat => chat.status === 'pending_review').length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const approvedToday = chatHistory.filter(chat => {
            if (chat.status === 'approved' && chat.reviewedAt) {
                const reviewDate = new Date(chat.reviewedAt);
                reviewDate.setHours(0, 0, 0, 0);
                return reviewDate.getTime() === today.getTime();
            }
            return false;
        }).length;
        
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('pending-badge').textContent = pendingCount;
        document.getElementById('approved-today').textContent = approvedToday;
    }
}

function displayPendingDrafts(drafts) {
    const container = document.getElementById('pending-drafts-list');
    
    if (drafts.length === 0) {
        container.innerHTML = '<p>No pending reviews at this time.</p>';
        return;
    }
    
    container.innerHTML = drafts.map(draft => `
        <div class="draft-card">
            <div class="draft-header">
                <span class="draft-time">${new Date(draft.createdAt).toLocaleString()}</span>
                <span class="draft-model">${draft.model}</span>
            </div>
            <div class="draft-question">
                <strong>Patient Question:</strong>
                <p>${draft.question}</p>
            </div>
            <div class="draft-response">
                <strong>AI Response:</strong>
                <p>${formatMarkdownText(draft.aiResponse)}</p>
            </div>
            <div class="draft-actions">
                <button class="btn-approve" onclick="reviewDraft('${draft.draftId}', 'approve')">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn-reject" onclick="reviewDraft('${draft.draftId}', 'reject')">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    `).join('');
}

async function reviewDraft(draftId, action) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ draftId, action })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update localStorage
            const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            const chatIndex = chatHistory.findIndex(chat => chat.draftId === draftId);
            
            if (chatIndex !== -1) {
                chatHistory[chatIndex].status = action === 'approve' ? 'approved' : 'rejected';
                chatHistory[chatIndex].reviewedAt = new Date().toISOString();
                localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            }
            
            alert(data.message);
            loadPendingDrafts(); // Refresh the list and counts
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Review draft error:', error);
        
        // Fallback to localStorage
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const chatIndex = chatHistory.findIndex(chat => chat.draftId === draftId);
        
        if (chatIndex !== -1) {
            chatHistory[chatIndex].status = action === 'approve' ? 'approved' : 'rejected';
            chatHistory[chatIndex].reviewedAt = new Date().toISOString();
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            
            alert(`Draft ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
            loadPendingDrafts(); // Refresh the list and counts
        } else {
            alert('Error: ' + error.message);
        }
    }
}
