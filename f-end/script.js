// ===== DOM Elements =====
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const themeToggle = document.getElementById('themeToggle');
const quickQuestions = document.querySelectorAll('.quick-question');
const attachButton = document.getElementById('attachButton');
const emojiButton = document.getElementById('emojiButton');
const fileInput = document.getElementById('fileInput');
const currentTimeElement = document.getElementById('currentTime');

// ===== Initialize Current Time =====
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    if (currentTimeElement) {
        currentTimeElement.textContent = timeString;
    }
}

// Update time on load and every minute
updateCurrentTime();
setInterval(updateCurrentTime, 60000);

// ===== Theme Management =====
// Check for saved theme preference or default to light
const savedTheme = localStorage.getItem('ldce-theme') || 'light';
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
}

// Theme toggle event listener
themeToggle.addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('ldce-theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('ldce-theme', 'light');
    }
});

// ===== Chat Functionality =====
// Predefined responses for the chatbot
const responses = {
    "admission": "LDCE admissions are primarily based on GUJCET scores for undergraduate programs. For postgraduate programs, GATE or PGCET scores are considered. The admission portal opens in May each year. Detailed procedures, eligibility criteria, and important dates are available on the LDCE website under 'Admissions'.",
    "courses": "LDCE offers Bachelor of Engineering in 7 disciplines: Computer, Civil, Mechanical, Electrical, Electronics & Communication, Chemical, and Information Technology. Each program includes industry-relevant electives, laboratory work, and project-based learning. The Computer Engineering department offers specializations in AI, Data Science, Cybersecurity, and Software Engineering.",
    "departments": "LDCE has 7 academic departments, each with modern laboratories and experienced faculty. The departments are: 1) Computer Engineering, 2) Civil Engineering, 3) Mechanical Engineering, 4) Electrical Engineering, 5) Electronics & Communication, 6) Chemical Engineering, and 7) Information Technology. Each department offers undergraduate and postgraduate programs.",
    "events": "The next major campus event is 'Annual Tech Fest - TechnoVanza 2025' scheduled for November 15-17. Other upcoming events include: Industry Interaction Week (Oct 10-15), Alumni Meet (Nov 5), and Sports Festival (Dec 1-5). Check the 'Events' section on the LDCE website for details and registration.",
    "notices": "Important notices are updated regularly on the LDCE website. Recent notices include: Mid-semester exam schedule (Oct 20-30), Holiday list for Diwali (Nov 1-5), and Workshop on AI Applications (Oct 25). Visit the 'Notices' section for the latest announcements.",
    "placements": "The Training & Placement Cell at LDCE has an excellent track record. Top recruiters include TCS, Infosys, L&T, IBM, Amazon, and Microsoft. The average placement percentage is 85%+ with the highest package of ₹42 LPA in 2024. Placement activities begin in July each year.",
    "library": "The central library is open from 9:00 AM to 8:00 PM on weekdays and 10:00 AM to 5:00 PM on Saturdays. It houses over 50,000 books, 100+ journals, and provides access to digital resources like IEEE Xplore, SpringerLink, and ACM Digital Library. Sunday and public holidays: Closed.",
    "contact": "For general inquiries: Phone: 079-25469234, Email: info@ldce.ac.in. Department contacts are available on respective department pages. Visit the 'Contact Us' section on the LDCE website for detailed contact information and location map."
};

// Initialize message counter
let messageCount = 1;
let questionsAnswered = 0;

// ===== Message Management =====
// Function to add a new message with smooth animation
function addMessage(content, isUser = false, isTyping = false) {
    const messageDiv = document.createElement('div');
    
    if (isTyping) {
        messageDiv.className = 'typing-indicator';
        messageDiv.id = 'typingIndicator';
        messageDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <span style="margin-left: 10px; color: var(--text-secondary);">Assistant is typing...</span>
        `;
    } else {
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const time = new Date();
        const timeString = time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">
                <i class="far fa-clock"></i> ${timeString}
            </div>
        `;
        
        // Update statistics for user messages
        if (isUser) {
            messageCount++;
            questionsAnswered++;
            updateStatistics();
        }
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// ===== File Upload Functionality =====
// Function to handle file upload
function handleFileUpload(file) {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        addMessage("File size exceeds 5MB limit. Please upload a smaller file.", false);
        return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'text/plain', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        addMessage("Unsupported file type. Please upload PDF, DOC, TXT, JPG, or PNG files.", false);
        return;
    }
    
    // Create file upload message
    const uploadMessage = document.createElement('div');
    uploadMessage.className = 'file-upload-message';
    uploadMessage.innerHTML = `
        <i class="fas fa-file-upload"></i>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
            <div class="file-upload-progress">
                <div class="file-upload-progress-bar" id="progressBar"></div>
            </div>
        </div>
        <i class="fas fa-check-circle" style="color: #4ade80; display: none;"></i>
    `;
    
    chatMessages.appendChild(uploadMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate upload progress
    let progress = 0;
    const progressBar = document.getElementById('progressBar');
    const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        progressBar.style.width = progress + '%';
        
        if (progress === 100) {
            clearInterval(progressInterval);
            uploadMessage.querySelector('.fa-file-upload').style.display = 'none';
            uploadMessage.querySelector('.fa-check-circle').style.display = 'block';
            
            // Show bot response after upload
            setTimeout(() => {
                addMessage(`I've received your file "${file.name}". This is a simulation - in the full implementation, I would analyze the file content to better assist you. For now, please describe your query in text format.`, false);
            }, 500);
        }
    }, 100);
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===== Typing Indicator =====
// Show typing indicator
function showTypingIndicator() {
    // Remove existing typing indicator if present
    removeTypingIndicator();
    
    const typingIndicator = addMessage('', false, true);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingIndicator;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ===== Response Generation =====
// Generate bot response based on user input
function generateBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Keyword-based response matching
    if (message.includes('admission') || message.includes('admit') || message.includes('apply')) {
        return responses.admission;
    } else if (message.includes('course') || message.includes('program') || message.includes('subject') || message.includes('syllabus')) {
        return responses.courses;
    } else if (message.includes('department') || message.includes('branch') || message.includes('faculty')) {
        return responses.departments;
    } else if (message.includes('event') || message.includes('fest') || message.includes('workshop') || message.includes('seminar')) {
        return responses.events;
    } else if (message.includes('notice') || message.includes('announcement') || message.includes('circular')) {
        return responses.notices;
    } else if (message.includes('placement') || message.includes('job') || message.includes('recruit') || message.includes('career')) {
        return responses.placements;
    } else if (message.includes('library') || message.includes('book') || message.includes('resource') || message.includes('study')) {
        return responses.library;
    } else if (message.includes('contact') || message.includes('email') || message.includes('phone') || message.includes('address')) {
        return responses.contact;
    } else if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('greeting')) {
        return "Hello! 👋 I'm the LDCE AI Assistant. How can I help you today? You can ask me about admissions, courses, departments, events, or any other campus-related information.";
    } else if (message.includes('thank') || message.includes('thanks')) {
        return "You're welcome! 😊 I'm always here to help. If you have more questions about LDCE, feel free to ask anytime!";
    } else if (message.includes('help') || message.includes('support')) {
        return "I can help you with information about: 📚 **Admissions** • 🎓 **Courses & Departments** • 📅 **Events & Notices** • 💼 **Placements** • 🏛️ **Campus Services** • 📞 **Contact Information**. What specific information are you looking for?";
    } else {
        return "I'm here to help with LDCE-related queries! I can provide information about admissions, courses, departments, events, notices, placements, campus services, and more. Could you please rephrase your question or ask about something specific?";
    }
}

// ===== Message Sending =====
// Handle sending a message
function sendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addMessage(message, true);
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate processing delay with realistic timing
    const processingTime = 800 + Math.random() * 1200;
    
    // Generate and add bot response
    setTimeout(() => {
        removeTypingIndicator();
        const botResponse = generateBotResponse(message);
        addMessage(botResponse, false);
    }, processingTime);
}

// ===== Statistics Management =====
// Update statistics display
function updateStatistics() {
    const questionsCount = document.getElementById('questionsCount');
    if (questionsCount) {
        questionsCount.textContent = questionsAnswered.toLocaleString();
        
        // Animate the counter
        questionsCount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            questionsCount.style.transform = 'scale(1)';
        }, 300);
    }
    
    // Update response time with slight variation
    const responseTime = document.getElementById('responseTime');
    if (responseTime) {
        const newTime = (1.5 + Math.random() * 0.8).toFixed(1);
        responseTime.textContent = `${newTime}s`;
    }
    
    // Occasionally update other stats
    if (Math.random() > 0.7) {
        const accuracyRate = document.getElementById('accuracyRate');
        if (accuracyRate) {
            const currentAccuracy = parseInt(accuracyRate.textContent);
            const newAccuracy = Math.min(99, currentAccuracy + Math.floor(Math.random() * 2));
            accuracyRate.textContent = `${newAccuracy}%`;
        }
    }
}

// Initialize statistics
function initializeStatistics() {
    // Animate initial statistics
    const counters = document.querySelectorAll('.stat-value');
    counters.forEach(counter => {
        const target = counter.textContent;
        if (target === '0') return;
        
        counter.textContent = '0';
        
        let current = 0;
        const targetValue = target.includes('%') 
            ? parseInt(target) 
            : target.includes('.') 
                ? parseFloat(target) 
                : parseInt(target.replace(/,/g, ''));
        
        const increment = targetValue / 50;
        
        const updateCounter = () => {
            current += increment;
            if (current < targetValue) {
                if (target.includes('%')) {
                    counter.textContent = Math.floor(current) + '%';
                } else if (target.includes('.')) {
                    counter.textContent = current.toFixed(1);
                } else {
                    counter.textContent = Math.floor(current).toLocaleString();
                }
                setTimeout(updateCounter, 30);
            } else {
                counter.textContent = target;
            }
        };
        
        setTimeout(updateCounter, 1000);
    });
}

// ===== Event Listeners =====
// Send message on button click
sendButton.addEventListener('click', sendMessage);

// Send message on Enter key (but allow Shift+Enter for new line)
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Quick question buttons
quickQuestions.forEach(question => {
    question.addEventListener('click', function() {
        const userMessage = this.getAttribute('data-question');
        userInput.value = userMessage;
        sendMessage();
        
        // Add micro-interaction feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// File attachment button
attachButton.addEventListener('click', function() {
    // Trigger the hidden file input
    fileInput.click();
    
    // Button feedback
    this.style.transform = 'scale(0.9)';
    setTimeout(() => {
        this.style.transform = '';
    }, 200);
});

// Handle file selection
fileInput.addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        handleFileUpload(file);
        
        // Reset file input
        this.value = '';
    }
});

// Emoji button
emojiButton.addEventListener('click', function() {
    // Simple emoji picker simulation
    const emojis = ['😊', '👍', '🎓', '🏫', '📚', '💻', '⭐', '🚀'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    userInput.value += randomEmoji;
    userInput.focus();
    
    // Button feedback
    this.style.transform = 'scale(0.9)';
    setTimeout(() => {
        this.style.transform = '';
    }, 200);
});

// ===== Initialize on Load =====
window.addEventListener('DOMContentLoaded', function() {
    // Initialize statistics animation
    initializeStatistics();
    
    // Set initial time
    updateCurrentTime();
});