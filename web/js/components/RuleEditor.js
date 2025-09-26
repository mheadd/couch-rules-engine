/**
 * RuleEditor Component
 * For viewing rule details (read-only initially per roadmap)
 */

class RuleEditor {
    constructor() {
        this.currentRule = null;
        this.isEditing = false;
        
        this.init();
    }
    
    /**
     * Initialize component
     */
    init() {
        this.bindEvents();
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Modal close events
        const modalClose = DOM.get('modal-close');
        const modalCancel = DOM.get('modal-cancel');
        const modal = DOM.get('rule-modal');
        
        if (modalClose) {
            DOM.on(modalClose, 'click', () => this.hideRuleDetails());
        }
        
        if (modalCancel) {
            DOM.on(modalCancel, 'click', () => this.hideRuleDetails());
        }
        
        if (modal) {
            DOM.on(modal, 'click', (e) => {
                if (e.target === modal) {
                    this.hideRuleDetails();
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideRuleDetails();
            }
        });
    }
    
    /**
     * Show rule details in modal
     */
    showRuleDetails(rule) {
        this.currentRule = rule;
        
        const metadata = DataFormat.formatRuleMetadata(rule.metadata);
        const validationFunction = DataFormat.formatValidationFunction(rule.validationFunction);
        
        const content = this.renderRuleDetails(metadata, validationFunction);
        const footer = this.renderModalFooter();
        
        Modal.show(metadata.name, content, footer);
    }
    
    /**
     * Hide rule details modal
     */
    hideRuleDetails() {
        Modal.hide();
        this.currentRule = null;
        this.isEditing = false;
    }
    
    /**
     * Render rule details content
     */
    renderRuleDetails(metadata, validationFunction) {
        return `
            <div class="rule-details">
                <!-- Rule Metadata Section -->
                <div class="rule-details-section">
                    <h4 class="rule-details-title">Rule Information</h4>
                    <div class="rule-metadata-grid">
                        <div class="rule-metadata-item">
                            <span class="rule-metadata-label">Name</span>
                            <span class="rule-metadata-value">${StringUtils.escapeHtml(metadata.name)}</span>
                        </div>
                        
                        <div class="rule-metadata-item">
                            <span class="rule-metadata-label">Version</span>
                            <span class="rule-metadata-value">${StringUtils.escapeHtml(metadata.version)}</span>
                        </div>
                        
                        <div class="rule-metadata-item">
                            <span class="rule-metadata-label">Status</span>
                            <span class="rule-metadata-value">
                                <span class="rule-status ${metadata.status}">
                                    <span class="rule-status-indicator"></span>
                                    ${StringUtils.capitalize(metadata.status)}
                                </span>
                            </span>
                        </div>
                        
                        <div class="rule-metadata-item">
                            <span class="rule-metadata-label">Author</span>
                            <span class="rule-metadata-value">${StringUtils.escapeHtml(metadata.author)}</span>
                        </div>
                        
                        <div class="rule-metadata-item">
                            <span class="rule-metadata-label">Created</span>
                            <span class="rule-metadata-value">${metadata.created}</span>
                        </div>
                        
                        <div class="rule-metadata-item">
                            <span class="rule-metadata-label">Modified</span>
                            <span class="rule-metadata-value">${metadata.modified}</span>
                        </div>
                    </div>
                    
                    <div class="rule-metadata-item">
                        <span class="rule-metadata-label">Description</span>
                        <div class="rule-metadata-value">
                            <p>${StringUtils.escapeHtml(metadata.description)}</p>
                        </div>
                    </div>
                    
                    ${metadata.tags.length > 0 ? `
                        <div class="rule-metadata-item">
                            <span class="rule-metadata-label">Tags</span>
                            <div class="rule-metadata-value">
                                <div class="rule-card-tags">
                                    ${metadata.tags.map(tag => 
                                        `<span class="rule-tag">${StringUtils.escapeHtml(tag)}</span>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="rule-metadata-item">
                        <span class="rule-metadata-label">Change Notes</span>
                        <div class="rule-metadata-value">
                            <p>${StringUtils.escapeHtml(metadata.changeNotes)}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Validation Function Section -->
                <div class="rule-details-section">
                    <h4 class="rule-details-title">Validation Function</h4>
                    <div class="rule-code">${StringUtils.escapeHtml(validationFunction)}</div>
                </div>
                
                <!-- Usage Examples Section -->
                <div class="rule-details-section">
                    <h4 class="rule-details-title">Usage Information</h4>
                    <div class="rule-metadata-grid">
                        <div class="rule-metadata-item">
                            <span class="rule-metadata-label">Rule ID</span>
                            <span class="rule-metadata-value">
                                <code>${StringUtils.escapeHtml(this.currentRule.id)}</code>
                            </span>
                        </div>
                        
                        <div class="rule-metadata-item">
                            <span class="rule-metadata-label">CouchDB Function Name</span>
                            <span class="rule-metadata-value">
                                <code>${StringUtils.escapeHtml(this.currentRule.name)}</code>
                            </span>
                        </div>
                    </div>
                    
                    <div class="rule-metadata-item">
                        <span class="rule-metadata-label">API Access</span>
                        <div class="rule-metadata-value">
                            <p>This rule can be accessed via:</p>
                            <code>GET /${getCouchDBClient().config.database}/${this.currentRule.id}</code>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render modal footer with actions
     */
    renderModalFooter() {
        return `
            <button class="btn btn-secondary" id="modal-cancel">Close</button>`;
    }
    
    /**
     * Test current rule
     */
    testCurrentRule() {
        if (!this.currentRule) return;
        
        this.hideRuleDetails();
        UIState.setTab('test');
        
        // Focus on test panel with current rule
        if (window.testPanel) {
            window.testPanel.focusOnRule(this.currentRule);
        }
    }
    
    /**
     * Edit current rule (placeholder for Phase 2)
     */
    editCurrentRule() {
        Notifications.error('Rule editing will be available in Phase 2 of the roadmap');
    }
    
    /**
     * Copy rule ID to clipboard
     */
    copyRuleId() {
        if (!this.currentRule) return;
        
        navigator.clipboard.writeText(this.currentRule.id).then(() => {
            Notifications.success('Rule ID copied to clipboard');
        }).catch(() => {
            Notifications.error('Failed to copy rule ID');
        });
    }
    
    /**
     * Export rule as JSON
     */
    exportRule() {
        if (!this.currentRule) return;
        
        const exportData = {
            metadata: this.currentRule.metadata,
            validationFunction: this.currentRule.validationFunction,
            exportedAt: new Date().toISOString(),
            exportedBy: 'CouchDB Rules Engine Web Interface'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentRule.name}-rule.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Notifications.success('Rule exported successfully');
    }
    
    /**
     * Get formatted rule information for display
     */
    getFormattedRuleInfo(rule) {
        if (!rule) return null;
        
        const metadata = DataFormat.formatRuleMetadata(rule.metadata);
        const validationFunction = DataFormat.formatValidationFunction(rule.validationFunction);
        
        return {
            ...metadata,
            validationFunction,
            id: rule.id,
            name: rule.name,
            rev: rule.rev
        };
    }
    
    /**
     * Validate rule metadata
     */
    validateRuleMetadata(metadata) {
        const errors = [];
        
        if (!metadata.name || metadata.name.trim() === '') {
            errors.push('Rule name is required');
        }
        
        if (!metadata.description || metadata.description.trim() === '') {
            errors.push('Rule description is required');
        }
        
        if (!ValidationUtils.isValidSemver(metadata.version)) {
            errors.push('Invalid semantic version format');
        }
        
        if (!['active', 'draft', 'inactive'].includes(metadata.status)) {
            errors.push('Invalid status value');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Validate validation function
     */
    validateValidationFunction(func) {
        const errors = [];
        
        if (!func || func.trim() === '') {
            errors.push('Validation function is required');
        } else if (!ValidationUtils.isValidJavaScript(func)) {
            errors.push('Invalid JavaScript syntax in validation function');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Initialize when DOM is ready
let ruleEditor = null;

// Export for global access
window.RuleEditor = RuleEditor;
