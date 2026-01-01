// API Configuration
// API key is loaded from config.local.js (gitignored) or set empty for production deployment
const API_CONFIG = {
    url: 'https://generate-mom-func.azurewebsites.net/api/generate-mom',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-functions-key': (typeof LOCAL_CONFIG !== 'undefined' && LOCAL_CONFIG.apiKey) ? LOCAL_CONFIG.apiKey : ''
    }
};

// State Management
const state = {
    inputFiles: [],
    templateFile: null,
    generatedDocument: null,
    isGenerating: false
};

// DOM Elements
const elements = {
    // Upload zones
    inputDropZone: document.getElementById('inputDropZone'),
    templateDropZone: document.getElementById('templateDropZone'),
    inputFilesInput: document.getElementById('inputFiles'),
    templateFileInput: document.getElementById('templateFile'),
    
    // File lists
    inputFileList: document.getElementById('inputFileList'),
    templateFileList: document.getElementById('templateFileList'),
    
    // Buttons
    generateBtn: document.getElementById('generateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    newDocBtn: document.getElementById('newDocBtn'),
    retryBtn: document.getElementById('retryBtn'),
    
    // Sections
    progressSection: document.getElementById('progressSection'),
    resultSection: document.getElementById('resultSection'),
    errorSection: document.getElementById('errorSection'),
    
    // Progress
    progressFill: document.getElementById('progressFill'),
    progressStatus: document.getElementById('progressStatus'),
    
    // Error
    errorMessage: document.getElementById('errorMessage'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// Initialize Application
function init() {
    setupEventListeners();
    updateUI();
}

// Event Listeners Setup
function setupEventListeners() {
    // Input files drop zone
    setupDropZone(elements.inputDropZone, elements.inputFilesInput, handleInputFiles);
    
    // Template drop zone
    setupDropZone(elements.templateDropZone, elements.templateFileInput, handleTemplateFile);
    
    // Button clicks
    elements.generateBtn.addEventListener('click', generateMoM);
    elements.resetBtn.addEventListener('click', resetAll);
    elements.downloadBtn.addEventListener('click', downloadDocument);
    elements.newDocBtn.addEventListener('click', resetAll);
    elements.retryBtn.addEventListener('click', generateMoM);
}

// Setup Drop Zone
function setupDropZone(dropZone, fileInput, handler) {
    // Click to select
    dropZone.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handler(Array.from(e.target.files));
        fileInput.value = '';
    });
    
    // Drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        });
    });
    
    // Drop handler
    dropZone.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer.files);
        handler(files);
    });
}

// Handle Input Files
function handleInputFiles(files) {
    const validExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
    
    files.forEach(file => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (validExtensions.includes(ext)) {
            // Check if file already exists
            if (!state.inputFiles.some(f => f.name === file.name && f.size === file.size)) {
                state.inputFiles.push(file);
            }
        } else {
            showToast(`Invalid file type: ${file.name}`, 'error');
        }
    });
    
    updateUI();
    renderInputFiles();
}

// Handle Template File
function handleTemplateFile(files) {
    const file = files[0];
    if (!file) return;
    
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (['.doc', '.docx'].includes(ext)) {
        state.templateFile = file;
        updateUI();
        renderTemplateFile();
    } else {
        showToast('Template must be a Word document (.doc or .docx)', 'error');
    }
}

// Render Input Files List
function renderInputFiles() {
    elements.inputFileList.innerHTML = state.inputFiles.map((file, index) => `
        <div class="file-item" data-index="${index}">
            <div class="file-item-icon ${getFileIconClass(file.name)}">
                <i class="fas ${getFileIcon(file.name)}"></i>
            </div>
            <div class="file-item-info">
                <div class="file-item-name" title="${file.name}">${file.name}</div>
                <div class="file-item-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="file-item-remove" onclick="removeInputFile(${index})" title="Remove file">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Render Template File
function renderTemplateFile() {
    if (state.templateFile) {
        elements.templateFileList.innerHTML = `
            <div class="file-item">
                <div class="file-item-icon word">
                    <i class="fas fa-file-word"></i>
                </div>
                <div class="file-item-info">
                    <div class="file-item-name" title="${state.templateFile.name}">${state.templateFile.name}</div>
                    <div class="file-item-size">${formatFileSize(state.templateFile.size)}</div>
                </div>
                <button class="file-item-remove" onclick="removeTemplateFile()" title="Remove template">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    } else {
        elements.templateFileList.innerHTML = '';
    }
}

// Remove Input File
function removeInputFile(index) {
    state.inputFiles.splice(index, 1);
    updateUI();
    renderInputFiles();
}

// Remove Template File
function removeTemplateFile() {
    state.templateFile = null;
    updateUI();
    renderTemplateFile();
}

// Get File Icon Class
function getFileIconClass(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    return 'word';
}

// Get File Icon
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'fa-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'fa-file-word';
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) return 'fa-file-image';
    return 'fa-file';
}

// Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Convert File to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// Get File Type
function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
        'pdf': 'pdf',
        'doc': 'word',
        'docx': 'word',
        'png': 'image',
        'jpg': 'image',
        'jpeg': 'image',
        'gif': 'image',
        'bmp': 'image',
        'webp': 'image'
    };
    return typeMap[ext] || 'unknown';
}

// Update UI State
function updateUI() {
    elements.generateBtn.disabled = state.inputFiles.length === 0 || state.isGenerating;
}

// Generate MoM
async function generateMoM() {
    if (state.inputFiles.length === 0) {
        showToast('Please upload at least one input file', 'warning');
        return;
    }
    
    state.isGenerating = true;
    updateUI();
    
    // Show loading state
    elements.generateBtn.classList.add('loading');
    elements.progressSection.classList.add('active');
    elements.resultSection.classList.remove('active');
    elements.errorSection.classList.remove('active');
    
    try {
        // Update progress
        updateProgress(10, 'Preparing files...');
        
        // Convert input files to base64
        const inputs = [];
        for (let i = 0; i < state.inputFiles.length; i++) {
            const file = state.inputFiles[i];
            updateProgress(10 + (i / state.inputFiles.length) * 30, `Processing ${file.name}...`);
            
            const base64 = await fileToBase64(file);
            inputs.push({
                type: getFileType(file.name),
                data: base64
            });
        }
        
        updateProgress(50, 'Processing template...');
        
        // Convert template to base64 if exists
        let template = '';
        if (state.templateFile) {
            template = await fileToBase64(state.templateFile);
        }
        
        updateProgress(60, 'Sending to server...');
        
        // Prepare request body
        const requestBody = {
            inputs: inputs,
            template: template
        };
        
        // Make API call
        const response = await fetch(API_CONFIG.url, {
            method: API_CONFIG.method,
            headers: API_CONFIG.headers,
            body: JSON.stringify(requestBody)
        });
        
        updateProgress(80, 'Processing response...');
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.mom_docx) {
            throw new Error('No document received from server');
        }
        
        updateProgress(100, 'Complete!');
        
        // Store generated document
        state.generatedDocument = result.mom_docx;
        
        // Show success
        setTimeout(() => {
            elements.progressSection.classList.remove('active');
            elements.resultSection.classList.add('active');
            showToast('MoM generated successfully!', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Generation failed:', error);
        
        elements.progressSection.classList.remove('active');
        elements.errorSection.classList.add('active');
        elements.errorMessage.textContent = error.message || 'An unexpected error occurred';
        showToast('Generation failed', 'error');
        
    } finally {
        state.isGenerating = false;
        elements.generateBtn.classList.remove('loading');
        updateUI();
    }
}

// Update Progress
function updateProgress(percent, status) {
    elements.progressFill.style.width = `${percent}%`;
    elements.progressStatus.textContent = status;
}

// Download Document
function downloadDocument() {
    if (!state.generatedDocument) {
        showToast('No document available for download', 'error');
        return;
    }
    
    try {
        // Convert base64 to blob
        const byteCharacters = atob(state.generatedDocument);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MoM_${getFormattedDate()}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('Download started!', 'success');
        
    } catch (error) {
        console.error('Download failed:', error);
        showToast('Download failed', 'error');
    }
}

// Get Formatted Date
function getFormattedDate() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
}

// Reset All
function resetAll() {
    // Reset state
    state.inputFiles = [];
    state.templateFile = null;
    state.generatedDocument = null;
    state.isGenerating = false;
    
    // Reset UI
    elements.inputFileList.innerHTML = '';
    elements.templateFileList.innerHTML = '';
    elements.progressSection.classList.remove('active');
    elements.resultSection.classList.remove('active');
    elements.errorSection.classList.remove('active');
    elements.generateBtn.classList.remove('loading');
    updateProgress(0, '');
    
    updateUI();
    showToast('All cleared! Ready for new upload.', 'success');
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toast = elements.toast;
    const toastIcon = toast.querySelector('.toast-icon');
    
    // Set message
    elements.toastMessage.textContent = message;
    
    // Set icon and type
    toast.className = 'toast';
    toast.classList.add(type);
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toastIcon.className = `toast-icon fas ${icons[type] || icons.info}`;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Make functions globally available for onclick handlers
window.removeInputFile = removeInputFile;
window.removeTemplateFile = removeTemplateFile;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
