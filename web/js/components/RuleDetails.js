/**
 * RuleDetails Component
 * Displays comprehensive rule information including version numbers
 */

class RuleDetails {
    constructor() {
        this.currentRule = null;
        this.isVisible = false;
        this.modal = null;
        
        this.init();
    }
    
    /**
     * Initialize component
     */
    init() {
        this.createModal();
        this.bindEvents();
    }
    
    /**
     * Create modal structure
     */
    createModal() {
        // Create modal if it doesn't exist
        this.modal = document.getElementById('rule-details-modal');
        if (!this.modal) {
            this.modal = document.createElement('div');
            this.modal.id = 'rule-details-modal';
            this.modal.className = 'modal';
            this.modal.style.display = 'none';
            document.body.appendChild(this.modal);
        }
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close modal when clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hide();
                }
            });
        }
        
        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Show rule details
     */
    async showRule(ruleId) {
        try {
            const client = getCouchDBClient();
            const result = await client.getDesignDocument(ruleId);
            
            if (result.success && result.data) {
                this.currentRule = result.data;
                this.render();
                this.show();
            } else {
                this.showError('Failed to load rule details');
            }
        } catch (error) {
            console.error('Error loading rule details:', error);
            this.showError(`Error loading rule: ${error.message}`);
        }
    }

    /**
     * Show rule details from rule object
     */
    showRuleDetails(rule) {
        this.currentRule = rule;
        this.render();
        this.show();
    }

    /**
     * Render rule details modal content
     */
    render() {
        if (!this.currentRule || !this.modal) return;

        const metadata = DataFormat.formatRuleMetadata(this.currentRule.metadata || this.currentRule.rule_metadata);
        
        // Format version with revision info if available
        const versionInfo = this.formatVersionInfo(metadata, this.currentRule);
        
        this.modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content rule-details-content">
                    <div class="modal-header">
                        <h2 class="rule-title">${StringUtils.escapeHtml(metadata.name || 'Unnamed Rule')}</h2>
                        <button class="modal-close" onclick="window.ruleDetails.hide()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <!-- Version Information Section -->
                        <div class="rule-section version-section">
                            <h3>Version Information</h3>
                            <div class="version-info">
                                ${versionInfo}
                            </div>
                        </div>

                        <!-- Rule Overview Section -->
                        <div class="rule-section">
                            <h3>Rule Overview</h3>
                            <div class="rule-metadata">
                                <div class="metadata-grid">
                                    <div class="metadata-item">
                                        <label>Status:</label>
                                        <span class="status-badge status-${metadata.status || 'unknown'}">${StringUtils.capitalize(metadata.status || 'Unknown')}</span>
                                    </div>
                                    <div class="metadata-item">
                                        <label>Author:</label>
                                        <span>${StringUtils.escapeHtml(metadata.author || 'Unknown')}</span>
                                    </div>
                                    <div class="metadata-item">
                                        <label>Created:</label>
                                        <span>${metadata.created || 'Not available'}</span>
                                    </div>
                                    <div class="metadata-item">
                                        <label>Modified:</label>
                                        <span>${metadata.modified || 'Not available'}</span>
                                    </div>
                                </div>
                                
                                ${metadata.description ? `
                                    <div class="rule-description">
                                        <h4>Description</h4>
                                        <p>${StringUtils.escapeHtml(metadata.description)}</p>
                                    </div>
                                ` : ''}
                                
                                ${metadata.tags && metadata.tags.length > 0 ? `
                                    <div class="rule-tags">
                                        <h4>Tags</h4>
                                        <div class="tags-container">
                                            ${metadata.tags.map(tag => `<span class="tag">${StringUtils.escapeHtml(tag)}</span>`).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Technical Information Section -->
                        <div class="rule-section">
                            <h3>Technical Information</h3>
                            <div class="technical-info">
                                <div class="metadata-item">
                                    <label>Document ID:</label>
                                    <code>${StringUtils.escapeHtml(this.currentRule._id || this.currentRule.id || 'Not available')}</code>
                                </div>
                                <div class="metadata-item">
                                    <label>CouchDB Revision:</label>
                                    <code>${StringUtils.escapeHtml(
                                        this.currentRule._rev || 
                                        this.currentRule.rev || 
                                        this.currentRule.value?.rev ||
                                        this.currentRule.doc?._rev ||
                                        'Not available'
                                    )}</code>
                                </div>
                            </div>
                        </div>

                        <!-- Validation Function Section -->
                        <div class="rule-section">
                            <h3>Validation Function</h3>
                            <div class="code-container">
                                <pre><code class="javascript">${StringUtils.escapeHtml(
                                    this.currentRule.validate_doc_update || 
                                    this.currentRule.doc?.validate_doc_update || 
                                    this.currentRule.value?.validate_doc_update ||
                                    'No validation function available'
                                )}</code></pre>
                            </div>
                        </div>

                        ${metadata.change_notes ? `
                            <div class="rule-section">
                                <h3>Change Notes</h3>
                                <div class="change-notes">
                                    <p>${StringUtils.escapeHtml(metadata.change_notes)}</p>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Format version information with CouchDB revision details
     */
    formatVersionInfo(metadata, document) {
        const version = metadata.version || '1.0.0';
        const revision = document._rev || document.rev || document.value?.rev || document.doc?._rev;
        
        let versionHtml = `
            <div class="version-primary">
                <span class="version-number">v${StringUtils.escapeHtml(version)}</span>
            </div>
        `;

        if (revision) {
            const revisionParts = revision.split('-');
            const revisionNumber = revisionParts[0];
            const revisionHash = revisionParts[1]?.substring(0, 8) || '';
            
            versionHtml += `
                <div class="version-secondary">
                    <div class="revision-info">
                        <label>CouchDB Revision:</label>
                        <span class="revision-number">${StringUtils.escapeHtml(revisionNumber)}</span>
                        ${revisionHash ? `<span class="revision-hash">(${StringUtils.escapeHtml(revisionHash)})</span>` : ''}
                    </div>
                </div>
            `;
        }

        if (metadata.modified && metadata.modified !== 'Not available') {
            versionHtml += `
                <div class="version-secondary">
                    <div class="last-modified">
                        <label>Last Modified:</label>
                        <span>${StringUtils.escapeHtml(metadata.modified)}</span>
                    </div>
                </div>
            `;
        }

        return versionHtml;
    }

    /**
     * Show modal
     */
    show() {
        if (this.modal) {
            this.modal.style.display = 'flex'; // Use flex to match CSS
            this.modal.classList.add('show');
            this.isVisible = true;
            document.body.classList.add('modal-open');
        }
    }

    /**
     * Hide modal
     */
    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.modal.classList.remove('show');
            this.isVisible = false;
            document.body.classList.remove('modal-open');
            this.currentRule = null;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.modal) {
            this.modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Error</h2>
                            <button class="modal-close" onclick="window.ruleDetails.hide()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="error-message">
                                <p>${StringUtils.escapeHtml(message)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.show();
        }
    }
}

// Export for global access
window.RuleDetails = RuleDetails;