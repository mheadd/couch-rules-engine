/**
 * Main Application
 * Orchestrates the CouchDB Rules Engine Web Interface
 */

class App {
    constructor() {
        this.components = {
            ruleList: null,
            ruleEditor: null,
            testPanel: null
        };
        
        this.state = {
            currentTab: 'rules',
            isConnected: false,
            connectionChecked: false
        };
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            this.bindEvents();
            this.showLoadingState();
            
            await this.checkConnection();
            await this.initializeComponents();
            
            this.setupNavigation();
            this.showTab(this.state.currentTab);
            
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showErrorState(error);
        }
    }
    
    /**
     * Bind global event listeners
     */
    bindEvents() {
        // Navigation
        DOM.on(document, 'click', '.nav-tab', (e) => {
            e.preventDefault();
            const tab = e.target.dataset.tab;
            if (tab) {
                this.showTab(tab);
            }
        });
        
        // Connection settings
        DOM.on(document, 'click', '#connection-settings-btn', () => {
            this.showConnectionSettings();
        });
        
        DOM.on(document, 'click', '#save-connection-btn', () => {
            this.saveConnectionSettings();
        });
        
        DOM.on(document, 'click', '#test-connection-btn', () => {
            this.testConnection();
        });
        
        // Modal close handlers
        DOM.on(document, 'click', '#modal-close', () => {
            Modal.hide();
        });
        
        DOM.on(document, 'click', '#modal-cancel', () => {
            Modal.hide();
        });
        
        // Close modal when clicking outside
        DOM.on(document, 'click', '#rule-modal', (e) => {
            if (e.target.id === 'rule-modal') {
                Modal.hide();
            }
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.showTab('rules');
                        break;
                    case '2':
                        e.preventDefault();
                        this.showTab('test');
                        break;
                    case 'r':
                        e.preventDefault();
                        this.refreshCurrentTab();
                        break;
                }
            }
        });
        
        // Window events
        window.addEventListener('beforeunload', (e) => {
            // Could add unsaved changes warning here in future phases
        });
        
        // Handle connection errors globally
        window.addEventListener('couchdb-error', (e) => {
            this.handleConnectionError(e.detail);
        });
    }
    
    /**
     * Show loading state
     */
    showLoadingState() {
        const main = DOM.get('main-content');
        if (main) {
            main.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Initializing CouchDB Rules Engine...</p>
                </div>
            `;
        }
    }
    
    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loading = DOM.get('.loading-state');
        if (loading) {
            loading.remove();
        }
    }
    
    /**
     * Show error state
     */
    showErrorState(error) {
        const main = DOM.get('main-content');
        if (main) {
            main.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠</div>
                    <h3>Application Error</h3>
                    <p>Failed to initialize the application: ${StringUtils.escapeHtml(error.message)}</p>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="location.reload()">
                            Reload Application
                        </button>
                        <button class="btn btn-secondary" onclick="app.showConnectionSettings()">
                            Check Connection Settings
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Check CouchDB connection
     */
    async checkConnection() {
        try {
            const client = getCouchDBClient();
            const result = await client.testConnection();
            
            if (result.connected) {
                this.state.isConnected = true;
                this.state.connectionChecked = true;
                
                this.updateConnectionStatus(true, `Connected to CouchDB`);
            } else {
                throw new Error(result.error || 'Connection failed');
            }
            
        } catch (error) {
            this.state.isConnected = false;
            this.state.connectionChecked = true;
            
            this.updateConnectionStatus(false, `Connection failed: ${error.message}`);
            
            // Show connection settings if not connected
            setTimeout(() => {
                if (!this.state.isConnected) {
                    // Check if we have username but no password (authentication may be needed)
                    const client = getCouchDBClient();
                    if (client.config.username && !client.config.password) {
                        Notifications.error('Authentication required. Please enter your password in connection settings.');
                    }
                    this.showConnectionSettings();
                }
            }, 1000);
        }
    }
    
    /**
     * Update connection status in UI
     */
    updateConnectionStatus(connected, message) {
        const indicator = DOM.get('connection-indicator');
        const status = DOM.get('connection-status');
        
        if (indicator) {
            indicator.className = `connection-indicator ${connected ? 'connected' : 'disconnected'}`;
        }
        
        if (status) {
            status.textContent = message;
            status.title = message;
        }
    }
    
    /**
     * Initialize application components
     */
    async initializeComponents() {
        // Initialize components
        this.components.ruleList = new RuleList();
        this.components.ruleEditor = new RuleEditor();
        this.components.testPanel = new TestPanel();
        
        // Make components globally available
        window.ruleList = this.components.ruleList;
        window.ruleEditor = this.components.ruleEditor;
        window.testPanel = this.components.testPanel;
        
        // Set up component communication
        this.setupComponentCommunication();
    }
    
    /**
     * Set up communication between components
     */
    setupComponentCommunication() {
        // Rule list to editor communication
        if (this.components.ruleList && this.components.ruleEditor) {
            // This would be set up when components support events
            // For now, components communicate via global references
        }
        
        // Rule list to test panel communication
        if (this.components.ruleList && this.components.testPanel) {
            // Components can reference each other via window globals
        }
    }
    
    /**
     * Set up navigation
     */
    setupNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                this.showTab(tabName);
            });
        });
    }
    
    /**
     * Show a specific tab
     */
    showTab(tabName) {
        // Update state
        this.state.currentTab = tabName;
        
        // Update navigation
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Update tab content
        const panels = document.querySelectorAll('.tab-panel');
        panels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === `${tabName}-panel`) {
                panel.classList.add('active');
            }
        });
        
        // Trigger tab-specific actions
        this.onTabChange(tabName);
        
        // Update URL hash without triggering reload
        if (history.replaceState) {
            history.replaceState(null, null, `#${tabName}`);
        }
    }
    
    /**
     * Handle tab change events
     */
    onTabChange(tabName) {
        switch (tabName) {
            case 'rules':
                if (this.components.ruleList) {
                    this.components.ruleList.refresh();
                }
                break;
                
            case 'test':
                if (this.components.testPanel) {
                    this.components.testPanel.loadAvailableRules();
                }
                break;
        }
    }
    
    /**
     * Refresh current tab
     */
    refreshCurrentTab() {
        this.onTabChange(this.state.currentTab);
        Notifications.success('Tab refreshed');
    }
    
    /**
     * Show connection settings modal
     */
    showConnectionSettings() {
        const client = getCouchDBClient();
        const config = client.config;
        
        // Build URL from config components
        const currentUrl = `${config.protocol}://${config.host}:${config.port}`;
        
        const content = `
            <div class="connection-settings">
                <div class="form-group">
                    <label for="couchdb-url">CouchDB URL</label>
                    <input 
                        type="url" 
                        id="couchdb-url" 
                        class="form-control" 
                        value="${StringUtils.escapeHtml(currentUrl)}"
                        placeholder="http://localhost:5984"
                    >
                    <small class="form-text">The base URL of your CouchDB instance</small>
                </div>
                
                <div class="form-group">
                    <label for="couchdb-database">Database Name</label>
                    <input 
                        type="text" 
                        id="couchdb-database" 
                        class="form-control" 
                        value="${StringUtils.escapeHtml(config.database)}"
                        placeholder="rules_db"
                    >
                    <small class="form-text">Name of the database containing validation rules</small>
                </div>
                
                <div class="form-group">
                    <label for="couchdb-username">Username (optional)</label>
                    <input 
                        type="text" 
                        id="couchdb-username" 
                        class="form-control" 
                        value="${StringUtils.escapeHtml(config.username || '')}"
                        placeholder="admin"
                    >
                </div>
                
                <div class="form-group">
                    <label for="couchdb-password">Password (optional)</label>
                    <input 
                        type="password" 
                        id="couchdb-password" 
                        class="form-control" 
                        value=""
                        placeholder="••••••••"
                    >
                    <small class="form-text">Password is not stored for security. Re-enter each session.</small>
                </div>
                
                <div class="connection-test">
                    <button id="test-connection-btn" class="btn btn-secondary">
                        Test Connection
                    </button>
                    <div id="connection-test-result"></div>
                </div>
            </div>
        `;
        
        const footer = `
            <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button class="btn btn-primary" id="save-connection-btn">Save Settings</button>
        `;
        
        Modal.show('Connection Settings', content, footer);
    }
    
    /**
     * Save connection settings
     */
    async saveConnectionSettings() {
        const url = DOM.get('couchdb-url')?.value.trim();
        const database = DOM.get('couchdb-database')?.value.trim();
        const username = DOM.get('couchdb-username')?.value.trim();
        const password = DOM.get('couchdb-password')?.value.trim();
        
        if (!url || !database) {
            Notifications.error('URL and database name are required');
            return;
        }
        
        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            Notifications.error('Invalid URL format');
            return;
        }
        
        // Parse URL to extract components
        const urlObj = new URL(url);
        const settings = {
            protocol: urlObj.protocol.slice(0, -1), // Remove trailing ':'
            host: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 5984),
            database,
            username: username || null
            // Note: Password is not stored in localStorage for security reasons
        };
        
        // Only include password if it's provided and username is also provided
        if (username && password) {
            // Still don't store password in localStorage - it will be prompted for each session
            console.log('Password provided but not stored in localStorage for security');
        }
        
        // Save to localStorage (without password)
        localStorage.setItem('couchdb-connection-settings', JSON.stringify(settings));
        
        // Reset client to use new settings
        resetCouchDBClient();
        
        // If password was provided, update the client with temporary credentials
        if (username && password) {
            const client = getCouchDBClient();
            client.updateConfig({
                username: username,
                password: password
            });
        }
        
        Modal.hide();
        
        // Test new connection
        await this.checkConnection();
        
        if (this.state.isConnected) {
            Notifications.success('Connection settings saved successfully');
            // Refresh components with new connection
            await this.initializeComponents();
            this.onTabChange(this.state.currentTab);
        }
    }
    
    /**
     * Test connection with current settings
     */
    async testConnection() {
        const button = DOM.get('test-connection-btn');
        const result = DOM.get('connection-test-result');
        
        if (!button || !result) return;
        
        button.disabled = true;
        button.textContent = 'Testing...';
        result.innerHTML = '';
        
        try {
            const url = DOM.get('couchdb-url')?.value.trim();
            const database = DOM.get('couchdb-database')?.value.trim();
            const username = DOM.get('couchdb-username')?.value.trim();
            const password = DOM.get('couchdb-password')?.value.trim();
            
            // Create temporary client for testing
            const urlObj = new URL(url);
            const testClient = new CouchDBClient({
                protocol: urlObj.protocol.slice(0, -1),
                host: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 5984),
                database,
                username: username || null,
                password: password || null
            });
            
            const result = await testClient.testConnection();
            
            if (result.connected) {
                result.innerHTML = `
                    <div class="connection-test-success">
                        ✓ Connection successful<br>
                        <small>Connected to database: ${database}</small>
                    </div>
                `;
            } else {
                throw new Error(result.error || 'Connection failed');
            }
            
        } catch (error) {
            result.innerHTML = `
                <div class="connection-test-error">
                    ✗ Connection failed<br>
                    <small>${StringUtils.escapeHtml(error.message)}</small>
                </div>
            `;
        } finally {
            button.disabled = false;
            button.textContent = 'Test Connection';
        }
    }
    
    /**
     * Handle connection errors
     */
    handleConnectionError(error) {
        console.error('CouchDB connection error:', error);
        
        this.state.isConnected = false;
        this.updateConnectionStatus(false, `Connection lost: ${error.message}`);
        
        // Show reconnection notification
        Notifications.error('Lost connection to CouchDB. Please check your connection settings.');
    }
    
    /**
     * Get application state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Get component instance
     */
    getComponent(name) {
        return this.components[name];
    }
    
    /**
     * Show about information
     */
    showAbout() {
        const content = `
            <div class="about-content">
                <h4>CouchDB Rules Engine</h4>
                <p>A web interface for managing and testing validation rules in CouchDB.</p>
                
                <h5>Features</h5>
                <ul>
                    <li>Browse and view validation rules with rich metadata</li>
                    <li>Test rules against sample documents</li>
                    <li>Direct CouchDB integration with CORS support</li>
                    <li>No middleware required</li>
                </ul>
                
                <h5>Current Phase</h5>
                <p>Phase 1, Task 1.3: Basic Web Interface (CRUD Operations)</p>
                
                <h5>Technology Stack</h5>
                <ul>
                    <li>Vanilla JavaScript (no frameworks)</li>
                    <li>CSS Custom Properties</li>
                    <li>CouchDB HTTP API</li>
                    <li>Responsive Web Design</li>
                </ul>
                
                <h5>Keyboard Shortcuts</h5>
                <ul>
                    <li><kbd>Ctrl/Cmd + 1</kbd> - Rules tab</li>
                    <li><kbd>Ctrl/Cmd + 2</kbd> - Test tab</li>
                    <li><kbd>Ctrl/Cmd + R</kbd> - Refresh current tab</li>
                    <li><kbd>Esc</kbd> - Close modal</li>
                </ul>
            </div>
        `;
        
        const footer = `
            <button class="btn btn-primary" id="modal-cancel">Close</button>
        `;
        
        Modal.show('About', content, footer);
    }
}

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global app instance
    window.app = new App();
});

/**
 * Global error handler
 */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    Notifications.error('An unexpected error occurred. Please check the console for details.');
});

/**
 * Global unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    Notifications.error('An unexpected error occurred. Please check the console for details.');
});

// Export for modules that might need it
window.App = App;
