/**
 * Simple CouchDB Rules Engine Web Interface
 * High-contrast, clean, and simple design
 */

// Configuration
const config = {
    couchdb: {
        url: 'http://localhost:5984',
        username: 'admin',
        password: 'password'
    }
};

// Global state
let currentRules = [];
let isConnected = false;

// DOM elements
const elements = {
    statusDot: null,
    statusText: null,
    refreshBtn: null,
    loading: null,
    error: null,
    rulesContainer: null,
    ruleDetails: null,
    detailTitle: null,
    detailsContent: null,
    closeDetailsBtn: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    bindEvents();
    checkConnection();
    loadRules();
});

// Initialize DOM element references
function initializeElements() {
    elements.statusDot = document.getElementById('status-dot');
    elements.statusText = document.getElementById('status-text');
    elements.refreshBtn = document.getElementById('refresh-btn');
    elements.loading = document.getElementById('loading');
    elements.error = document.getElementById('error');
    elements.rulesContainer = document.getElementById('rules-container');
    elements.ruleDetails = document.getElementById('rule-details');
    elements.detailTitle = document.getElementById('detail-title');
    elements.detailsContent = document.getElementById('details-content');
    elements.closeDetailsBtn = document.getElementById('close-details');
}

// Bind event listeners
function bindEvents() {
    elements.refreshBtn.addEventListener('click', function() {
        loadRules();
    });
    
    elements.closeDetailsBtn.addEventListener('click', function() {
        hideRuleDetails();
    });
}

// Check CouchDB connection
async function checkConnection() {
    try {
        updateConnectionStatus('connecting', 'Connecting...');
        
        const response = await fetch(config.couchdb.url + '/_up', {
            headers: {
                'Authorization': 'Basic ' + btoa(config.couchdb.username + ':' + config.couchdb.password)
            }
        });
        
        if (response.ok) {
            isConnected = true;
            updateConnectionStatus('connected', 'Connected');
        } else {
            throw new Error('Connection failed');
        }
    } catch (error) {
        isConnected = false;
        updateConnectionStatus('disconnected', 'Disconnected');
        console.error('Connection error:', error);
    }
}

// Update connection status display
function updateConnectionStatus(status, text) {
    elements.statusDot.className = 'status-dot ' + status;
    elements.statusText.textContent = text;
}

// Load rules from CouchDB
async function loadRules() {
    showLoading();
    hideError();
    hideRuleDetails();
    
    try {
        if (!isConnected) {
            await checkConnection();
        }
        
        const url = config.couchdb.url + '/rules_db/_all_docs?startkey="_design/"&endkey="_design/\\ufff0"&include_docs=true';
        const response = await fetch(url, {
            headers: {
                'Authorization': 'Basic ' + btoa(config.couchdb.username + ':' + config.couchdb.password)
            }
        });
        
        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }
        
        const data = await response.json();
        currentRules = data.rows.map(row => row.doc);
        
        displayRules();
        
    } catch (error) {
        console.error('Error loading rules:', error);
        showError('Failed to load rules: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Display rules in the grid
function displayRules() {
    if (currentRules.length === 0) {
        elements.rulesContainer.innerHTML = '<div class="no-rules">No validation rules found.</div>';
        return;
    }
    
    const rulesHtml = currentRules.map(rule => {
        const metadata = rule.rule_metadata || {};
        const ruleName = metadata.name || rule._id.replace('_design/', '');
        const description = metadata.description || 'No description available';
        const status = metadata.status || 'unknown';
        const version = metadata.version || 'N/A';
        
        return [
            '<div class="rule-card" data-rule-id="' + escapeHtml(rule._id) + '">',
                '<h3>' + escapeHtml(ruleName) + '</h3>',
                '<div class="rule-id">' + escapeHtml(rule._id) + '</div>',
                '<div class="rule-description">' + escapeHtml(description) + '</div>',
                '<div class="rule-meta">',
                    '<span>Version: ' + escapeHtml(version) + '</span>',
                    '<span class="rule-status ' + status + '">' + status + '</span>',
                '</div>',
            '</div>'
        ].join('');
    }).join('');
    
    elements.rulesContainer.innerHTML = rulesHtml;
    
    // Add click handlers to rule cards
    document.querySelectorAll('.rule-card').forEach(card => {
        card.addEventListener('click', function() {
            const ruleId = this.getAttribute('data-rule-id');
            showRuleDetails(ruleId);
        });
    });
}

// Show rule details
function showRuleDetails(ruleId) {
    const rule = currentRules.find(r => r._id === ruleId);
    if (!rule) return;
    
    const metadata = rule.rule_metadata || {};
    const ruleName = metadata.name || rule._id.replace('_design/', '');
    
    elements.detailTitle.textContent = ruleName;
    
    const detailsHtml = [
        '<div class="meta-item">',
            '<span class="meta-label">Rule ID:</span>',
            '<span class="meta-value">' + escapeHtml(rule._id) + '</span>',
        '</div>',
        '<div class="meta-item">',
            '<span class="meta-label">Name:</span>',
            '<span class="meta-value">' + escapeHtml(metadata.name || 'N/A') + '</span>',
        '</div>',
        '<div class="meta-item">',
            '<span class="meta-label">Description:</span>',
            '<span class="meta-value">' + escapeHtml(metadata.description || 'N/A') + '</span>',
        '</div>',
        '<div class="meta-item">',
            '<span class="meta-label">Version:</span>',
            '<span class="meta-value">' + escapeHtml(metadata.version || 'N/A') + '</span>',
        '</div>',
        '<div class="meta-item">',
            '<span class="meta-label">Status:</span>',
            '<span class="meta-value rule-status ' + (metadata.status || 'unknown') + '">' + escapeHtml(metadata.status || 'Unknown') + '</span>',
        '</div>',
        '<div class="meta-item">',
            '<span class="meta-label">Author:</span>',
            '<span class="meta-value">' + escapeHtml(metadata.author || 'N/A') + '</span>',
        '</div>',
        '<div class="meta-item">',
            '<span class="meta-label">Created:</span>',
            '<span class="meta-value">' + escapeHtml(metadata.created_date || 'N/A') + '</span>',
        '</div>',
        '<div class="meta-item">',
            '<span class="meta-label">Modified:</span>',
            '<span class="meta-value">' + escapeHtml(metadata.modified_date || 'N/A') + '</span>',
        '</div>',
        '<h3>Validation Function</h3>',
        '<div class="code-block">' + escapeHtml(rule.validate_doc_update || 'No validation function found') + '</div>'
    ];
    
    if (metadata.tags && metadata.tags.length > 0) {
        detailsHtml.push(
            '<h3>Tags</h3>',
            '<p>' + metadata.tags.map(tag => '<span class="tag">' + escapeHtml(tag) + '</span>').join(', ') + '</p>'
        );
    }
    
    elements.detailsContent.innerHTML = detailsHtml.join('');
    elements.ruleDetails.classList.remove('hidden');
    elements.ruleDetails.scrollIntoView({ behavior: 'smooth' });
}

// Hide rule details
function hideRuleDetails() {
    elements.ruleDetails.classList.add('hidden');
}

// Show loading state
function showLoading() {
    elements.loading.classList.remove('hidden');
    elements.rulesContainer.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
    elements.loading.classList.add('hidden');
    elements.rulesContainer.classList.remove('hidden');
}

// Show error message
function showError(message) {
    elements.error.textContent = message;
    elements.error.classList.remove('hidden');
}

// Hide error message
function hideError() {
    elements.error.classList.add('hidden');
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
