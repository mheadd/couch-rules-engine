/**
 * TestPanel Component
 * For testing validation rules against sample documents
 */

class TestPanel {
    constructor() {
        this.currentRule = null;
        this.testDocument = null;
        this.testResults = null;
        this.sampleDocuments = [];
        
        this.init();
    }
    
    /**
     * Initialize component
     */
    init() {
        this.loadSampleDocuments();
        this.bindEvents();
        this.render();
    }
    
    /**
     * Load sample documents from the samples directory
     */
    async loadSampleDocuments() {
        try {
            // In a real implementation, these would be loaded via API
            // For now, we'll provide built-in samples based on the project structure
            this.sampleDocuments = [
                {
                    name: 'Valid Person Document',
                    description: 'A valid person document with all required fields',
                    data: {
                        _id: 'person_001',
                        type: 'person',
                        householdSize: 3,
                        householdIncome: 45000,
                        numberOfDependents: 2,
                        interviewComplete: true,
                        personalInfo: {
                            firstName: 'John',
                            lastName: 'Doe',
                            dateOfBirth: '1985-06-15'
                        },
                        metadata: {
                            createdAt: new Date().toISOString(),
                            lastModified: new Date().toISOString()
                        }
                    }
                },
                {
                    name: 'Invalid Person Document',
                    description: 'A person document with missing/invalid fields for testing validation',
                    data: {
                        _id: 'person_002',
                        type: 'person',
                        householdSize: 0, // Invalid: must be positive
                        householdIncome: -1000, // Invalid: negative income
                        numberOfDependents: -1, // Invalid: negative dependents
                        interviewComplete: false,
                        personalInfo: {
                            firstName: '',
                            lastName: 'Smith'
                            // Missing dateOfBirth
                        }
                        // Missing metadata
                    }
                },
                {
                    name: 'Edge Case Document',
                    description: 'Document with edge case values for comprehensive testing',
                    data: {
                        _id: 'person_003',
                        type: 'person',
                        householdSize: 1,
                        householdIncome: 0,
                        numberOfDependents: 0,
                        interviewComplete: true,
                        personalInfo: {
                            firstName: 'Jane',
                            lastName: 'Edge',
                            dateOfBirth: '2000-01-01'
                        },
                        metadata: {
                            createdAt: new Date().toISOString(),
                            lastModified: new Date().toISOString()
                        }
                    }
                }
            ];
        } catch (error) {
            console.error('Error loading sample documents:', error);
            Notifications.error('Failed to load sample documents');
        }
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Test execution
        DOM.on(document, 'click', '#run-test-btn', () => this.runTest());
        DOM.on(document, 'click', '#clear-test-btn', () => this.clearTest());
        
        // Sample document selection
        DOM.on(document, 'change', '#sample-document-select', (e) => {
            this.loadSampleDocument(e.target.value);
        });
        
        // Document input changes
        DOM.on(document, 'input', '#test-document-input', () => {
            this.validateDocumentInput();
        });
        
        // Rule selection
        DOM.on(document, 'change', '#test-rule-select', (e) => {
            this.selectRule(e.target.value);
        });
        
        // Quick test buttons
        DOM.on(document, 'click', '.quick-test-btn', (e) => {
            const ruleId = e.target.dataset.ruleId;
            this.quickTest(ruleId);
        });
    }
    
    /**
     * Render the test panel
     */
    render() {
        const container = DOM.get('test-panel');
        if (!container) return;
        
        container.innerHTML = `
            <div class="test-panel">
                <div class="test-panel-header">
                    <h3>Rule Testing</h3>
                    <p>Test validation rules against sample documents to verify their behavior.</p>
                </div>
                
                <div class="test-panel-content">
                    <!-- Rule Selection Section -->
                    <div class="test-section">
                        <h4>1. Select Validation Rule</h4>
                        <div class="form-group">
                            <label for="test-rule-select">Choose a rule to test:</label>
                            <select id="test-rule-select" class="form-control">
                                <option value="">Select a rule...</option>
                            </select>
                        </div>
                        <div id="selected-rule-info" class="rule-info" style="display: none;"></div>
                    </div>
                    
                    <!-- Document Input Section -->
                    <div class="test-section">
                        <h4>2. Provide Test Document</h4>
                        
                        <!-- Sample Document Options -->
                        <div class="form-group">
                            <label for="sample-document-select">Use a sample document:</label>
                            <select id="sample-document-select" class="form-control">
                                <option value="">Custom document...</option>
                                ${this.sampleDocuments.map((doc, index) => 
                                    `<option value="${index}">${doc.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <!-- Document Input -->
                        <div class="form-group">
                            <label for="test-document-input">Document JSON:</label>
                            <textarea 
                                id="test-document-input" 
                                class="form-control code-input" 
                                rows="10"
                                placeholder="Enter your test document as JSON..."
                            ></textarea>
                            <div id="document-validation-feedback" class="form-feedback"></div>
                        </div>
                    </div>
                    
                    <!-- Test Execution Section -->
                    <div class="test-section">
                        <h4>3. Run Test</h4>
                        <div class="test-actions">
                            <button id="run-test-btn" class="btn btn-primary" disabled>
                                <span class="btn-icon">▶</span>
                                Run Test
                            </button>
                            <button id="clear-test-btn" class="btn btn-secondary">
                                <span class="btn-icon">🗑</span>
                                Clear
                            </button>
                        </div>
                    </div>
                    
                    <!-- Test Results Section -->
                    <div class="test-section">
                        <h4>4. Test Results</h4>
                        <div id="test-results-container" class="test-results-container">
                            <div class="test-results-placeholder">
                                Run a test to see results here.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.loadAvailableRules();
    }
    
    /**
     * Load available rules for testing
     */
    async loadAvailableRules() {
        try {
            const client = getCouchDBClient();
            const designDocs = await client.getDesignDocuments();
            
            const ruleSelect = DOM.get('test-rule-select');
            if (!ruleSelect) return;
            
            // Clear existing options except the placeholder
            ruleSelect.innerHTML = '<option value="">Select a rule...</option>';
            
            designDocs.forEach(doc => {
                if (doc.id.startsWith('_design/') && doc.validationFunction) {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = `${doc.metadata?.name || doc.id} (v${doc.metadata?.version || '1.0.0'})`;
                    ruleSelect.appendChild(option);
                }
            });
            
        } catch (error) {
            console.error('Error loading rules:', error);
            Notifications.error('Failed to load validation rules');
        }
    }
    
    /**
     * Select a rule for testing
     */
    async selectRule(ruleId) {
        if (!ruleId) {
            this.currentRule = null;
            this.hideRuleInfo();
            this.updateTestButton();
            return;
        }
        
        try {
            const client = getCouchDBClient();
            const rule = await client.getDesignDocument(ruleId);
            
            this.currentRule = rule;
            this.showRuleInfo(rule);
            this.updateTestButton();
            
        } catch (error) {
            console.error('Error loading rule:', error);
            Notifications.error('Failed to load selected rule');
        }
    }
    
    /**
     * Show information about the selected rule
     */
    showRuleInfo(rule) {
        const container = DOM.get('selected-rule-info');
        if (!container) return;
        
        const metadata = DataFormat.formatRuleMetadata(rule.metadata);
        
        container.innerHTML = `
            <div class="rule-info-card">
                <h5>${StringUtils.escapeHtml(metadata.name)}</h5>
                <p>${StringUtils.escapeHtml(metadata.description)}</p>
                <div class="rule-info-meta">
                    <span class="rule-info-version">v${metadata.version}</span>
                    <span class="rule-status ${metadata.status}">
                        <span class="rule-status-indicator"></span>
                        ${StringUtils.capitalize(metadata.status)}
                    </span>
                </div>
            </div>
        `;
        
        container.style.display = 'block';
    }
    
    /**
     * Hide rule information
     */
    hideRuleInfo() {
        const container = DOM.get('selected-rule-info');
        if (container) {
            container.style.display = 'none';
        }
    }
    
    /**
     * Load a sample document
     */
    loadSampleDocument(index) {
        if (index === '' || index === null) {
            // Custom document selected, clear the input
            this.clearDocumentInput();
            return;
        }
        
        const sampleDoc = this.sampleDocuments[parseInt(index)];
        if (!sampleDoc) return;
        
        const input = DOM.get('test-document-input');
        if (input) {
            input.value = JSON.stringify(sampleDoc.data, null, 2);
            this.validateDocumentInput();
        }
    }
    
    /**
     * Clear document input
     */
    clearDocumentInput() {
        const input = DOM.get('test-document-input');
        if (input) {
            input.value = '';
            this.validateDocumentInput();
        }
    }
    
    /**
     * Validate document input
     */
    validateDocumentInput() {
        const input = DOM.get('test-document-input');
        const feedback = DOM.get('document-validation-feedback');
        
        if (!input || !feedback) return;
        
        const value = input.value.trim();
        
        if (value === '') {
            feedback.innerHTML = '';
            feedback.className = 'form-feedback';
            this.testDocument = null;
            this.updateTestButton();
            return;
        }
        
        try {
            const parsed = JSON.parse(value);
            this.testDocument = parsed;
            
            feedback.innerHTML = '<span class="feedback-success">✓ Valid JSON</span>';
            feedback.className = 'form-feedback success';
            
        } catch (error) {
            this.testDocument = null;
            feedback.innerHTML = `<span class="feedback-error">✗ Invalid JSON: ${error.message}</span>`;
            feedback.className = 'form-feedback error';
        }
        
        this.updateTestButton();
    }
    
    /**
     * Update test button state
     */
    updateTestButton() {
        const button = DOM.get('run-test-btn');
        if (!button) return;
        
        const canTest = this.currentRule && this.testDocument;
        button.disabled = !canTest;
        
        if (!this.currentRule) {
            button.title = 'Please select a validation rule';
        } else if (!this.testDocument) {
            button.title = 'Please provide a valid test document';
        } else {
            button.title = 'Run the validation test';
        }
    }
    
    /**
     * Run the validation test
     */
    async runTest() {
        if (!this.currentRule || !this.testDocument) {
            Notifications.error('Please select a rule and provide a test document');
            return;
        }
        
        const button = DOM.get('run-test-btn');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="btn-icon spinner">⟳</span> Running Test...';
        }
        
        try {
            const result = await this.executeValidation();
            this.displayTestResults(result);
            
        } catch (error) {
            console.error('Test execution error:', error);
            Notifications.error('Test execution failed: ' + error.message);
            this.displayTestError(error);
            
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<span class="btn-icon">▶</span> Run Test';
            }
        }
    }
    
    /**
     * Execute the validation function
     */
    async executeValidation() {
        // Create a safe execution environment
        const func = this.currentRule.validationFunction;
        const doc = this.testDocument;
        
        // Create execution context
        const context = {
            document: doc,
            result: null,
            errors: [],
            warnings: [],
            logs: []
        };
        
        // Override console for capturing logs
        const originalConsole = console;
        const testConsole = {
            log: (...args) => context.logs.push({ level: 'log', message: args.join(' ') }),
            error: (...args) => context.logs.push({ level: 'error', message: args.join(' ') }),
            warn: (...args) => context.logs.push({ level: 'warn', message: args.join(' ') }),
            info: (...args) => context.logs.push({ level: 'info', message: args.join(' ') })
        };
        
        try {
            // Create a function that mimics CouchDB's validation function environment
            const validationWrapper = new Function('doc', 'console', `
                try {
                    ${func}
                    return { success: true, result: true };
                } catch (error) {
                    if (error.forbidden) {
                        return { success: true, result: false, error: error.forbidden };
                    } else if (error.unauthorized) {
                        return { success: true, result: false, error: error.unauthorized };
                    } else {
                        throw error;
                    }
                }
            `);
            
            const startTime = performance.now();
            const result = validationWrapper(doc, testConsole);
            const endTime = performance.now();
            
            return {
                success: result.success,
                valid: result.result,
                error: result.error || null,
                executionTime: endTime - startTime,
                logs: context.logs,
                metadata: this.currentRule.metadata,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            return {
                success: false,
                valid: false,
                error: error.message,
                executionTime: 0,
                logs: context.logs,
                metadata: this.currentRule.metadata,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Display test results
     */
    displayTestResults(result) {
        const container = DOM.get('test-results-container');
        if (!container) return;
        
        this.testResults = result;
        
        const resultClass = result.success ? (result.valid ? 'success' : 'warning') : 'error';
        const resultIcon = result.success ? (result.valid ? '✓' : '⚠') : '✗';
        const resultText = result.success ? 
            (result.valid ? 'Document is valid' : 'Document failed validation') : 
            'Validation error occurred';
        
        container.innerHTML = `
            <div class="test-results ${resultClass}">
                <div class="test-results-header">
                    <h5>
                        <span class="result-icon">${resultIcon}</span>
                        ${resultText}
                    </h5>
                    <div class="test-results-meta">
                        <span>Executed at: ${new Date(result.timestamp).toLocaleString()}</span>
                        <span>Duration: ${result.executionTime.toFixed(2)}ms</span>
                    </div>
                </div>
                
                ${result.error ? `
                    <div class="test-results-section">
                        <h6>Validation Message</h6>
                        <div class="validation-message error">
                            ${StringUtils.escapeHtml(result.error)}
                        </div>
                    </div>
                ` : ''}
                
                ${result.logs.length > 0 ? `
                    <div class="test-results-section">
                        <h6>Execution Logs</h6>
                        <div class="execution-logs">
                            ${result.logs.map(log => `
                                <div class="log-entry log-${log.level}">
                                    <span class="log-level">${log.level.toUpperCase()}</span>
                                    <span class="log-message">${StringUtils.escapeHtml(log.message)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="test-results-section">
                    <h6>Rule Information</h6>
                    <div class="rule-summary">
                        <div class="rule-summary-item">
                            <span class="label">Rule:</span>
                            <span class="value">${StringUtils.escapeHtml(result.metadata.name)}</span>
                        </div>
                        <div class="rule-summary-item">
                            <span class="label">Version:</span>
                            <span class="value">${StringUtils.escapeHtml(result.metadata.version)}</span>
                        </div>
                        <div class="rule-summary-item">
                            <span class="label">Status:</span>
                            <span class="value">
                                <span class="rule-status ${result.metadata.status}">
                                    ${StringUtils.capitalize(result.metadata.status)}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="test-results-actions">
                    <button class="btn btn-secondary" onclick="testPanel.exportTestResults()">
                        Export Results
                    </button>
                    <button class="btn btn-secondary" onclick="testPanel.runTest()">
                        Run Again
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Display test error
     */
    displayTestError(error) {
        const container = DOM.get('test-results-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="test-results error">
                <div class="test-results-header">
                    <h5>
                        <span class="result-icon">✗</span>
                        Test Execution Failed
                    </h5>
                </div>
                
                <div class="test-results-section">
                    <h6>Error Details</h6>
                    <div class="validation-message error">
                        ${StringUtils.escapeHtml(error.message)}
                    </div>
                </div>
                
                <div class="test-results-actions">
                    <button class="btn btn-secondary" onclick="testPanel.runTest()">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Clear test results and inputs
     */
    clearTest() {
        // Clear rule selection
        const ruleSelect = DOM.get('test-rule-select');
        if (ruleSelect) {
            ruleSelect.value = '';
        }
        
        // Clear document selection
        const docSelect = DOM.get('sample-document-select');
        if (docSelect) {
            docSelect.value = '';
        }
        
        // Clear document input
        this.clearDocumentInput();
        
        // Clear results
        const container = DOM.get('test-results-container');
        if (container) {
            container.innerHTML = `
                <div class="test-results-placeholder">
                    Run a test to see results here.
                </div>
            `;
        }
        
        // Reset state
        this.currentRule = null;
        this.testDocument = null;
        this.testResults = null;
        
        this.hideRuleInfo();
        this.updateTestButton();
    }
    
    /**
     * Focus on a specific rule (called from other components)
     */
    focusOnRule(rule) {
        const ruleSelect = DOM.get('test-rule-select');
        if (ruleSelect && rule) {
            ruleSelect.value = rule.id;
            this.selectRule(rule.id);
        }
    }
    
    /**
     * Quick test with a specific rule
     */
    async quickTest(ruleId) {
        await this.selectRule(ruleId);
        
        // Use the first sample document
        if (this.sampleDocuments.length > 0) {
            this.loadSampleDocument('0');
            await this.runTest();
        }
    }
    
    /**
     * Export test results
     */
    exportTestResults() {
        if (!this.testResults) {
            Notifications.error('No test results to export');
            return;
        }
        
        const exportData = {
            testResults: this.testResults,
            testDocument: this.testDocument,
            rule: {
                id: this.currentRule.id,
                metadata: this.currentRule.metadata
            },
            exportedAt: new Date().toISOString(),
            exportedBy: 'CouchDB Rules Engine Web Interface'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Notifications.success('Test results exported successfully');
    }
}

// Initialize when DOM is ready
let testPanel = null;

// Export for global access
window.TestPanel = TestPanel;
