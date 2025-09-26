/**
 * RuleList Component
 * Displays all validation rules with metadata in a user-friendly format
 */

class RuleList {
    constructor() {
        this.rules = [];
        this.isLoading = false;
        this.container = DOM.get('rules-list');
        this.refreshButton = DOM.get('refresh-rules');
        
        this.init();
    }
    
    /**
     * Initialize component
     */
    init() {
        this.bindEvents();
        this.loadRules();
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        if (this.refreshButton) {
            DOM.on(this.refreshButton, 'click', () => this.loadRules());
        }
    }
    
    /**
     * Load rules from CouchDB
     */
    async loadRules() {
        if (this.isLoading) return;
        
        this.setLoading(true);
        
        try {
            const client = getCouchDBClient();
            const result = await client.getDesignDocuments();
            
            if (result.success) {
                // Filter out the web-interface design document
                this.rules = result.data.filter(doc => doc.id !== '_design/web-interface');
                
                this.render();
                Notifications.success(`Loaded ${this.rules.length} validation rules`);
            } else {
                this.renderError(result.error);
                Notifications.error(`Failed to load rules: ${result.error}`);
            }
            
        } catch (error) {
            console.error('Error loading rules:', error);
            this.renderError(error.message);
            Notifications.error(`Error loading rules: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    }
    
    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        if (this.refreshButton) {
            this.refreshButton.disabled = loading;
            this.refreshButton.textContent = loading ? 'Loading...' : 'Refresh';
        }
    }
    
    /**
     * Render rules list
     */
    render() {
        if (!this.container) return;
        
        if (this.rules.length === 0) {
            this.renderEmpty();
            return;
        }
        
        const rulesHtml = this.rules.map(rule => this.renderRuleCard(rule)).join('');
        this.container.innerHTML = rulesHtml;
        
        // Bind click events for rule cards
        this.bindRuleCardEvents();
    }
    
    /**
     * Render individual rule card
     */
    renderRuleCard(rule) {
        const metadata = DataFormat.formatRuleMetadata(rule.metadata);
        const ruleId = rule.id.replace('_design/', '');
        
        // Extract version and revision info
        const version = metadata.version || '1.0.0';
        const revision = rule._rev ? rule._rev.split('-')[0] : 'N/A';
        const status = metadata.status || 'unknown';
        
        const tags = metadata.tags.map(tag => 
            `<span class="rule-tag">${StringUtils.escapeHtml(tag)}</span>`
        ).join('');
        
        return `
            <div class="rule-card" data-rule-id="${rule.id}">
                <div class="rule-card-header">
                    <div class="rule-title-section">
                        <h3 class="rule-card-title">${StringUtils.escapeHtml(metadata.name)}</h3>
                        <div class="version-badge">v${StringUtils.escapeHtml(version)}</div>
                    </div>
                    <div class="rule-status">
                        <span class="status-indicator status-${status}"></span>
                        <span class="revision-info">Rev ${StringUtils.escapeHtml(revision)}</span>
                    </div>
                </div>
                
                <div class="rule-card-body">
                    <p class="rule-card-description">
                        ${StringUtils.escapeHtml(StringUtils.truncate(metadata.description, 120))}
                    </p>
                    
                    <div class="rule-metadata-summary">
                        ${metadata.author ? `
                            <div class="metadata-item">
                                <span class="label">Author:</span>
                                <span class="value">${StringUtils.escapeHtml(metadata.author)}</span>
                            </div>
                        ` : ''}
                        
                        ${metadata.modified ? `
                            <div class="metadata-item">
                                <span class="label">Modified:</span>
                                <span class="value">${StringUtils.escapeHtml(metadata.modified)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${tags ? `
                        <div class="rule-tags-preview">
                            ${metadata.tags.slice(0, 3).map(tag => `<span class="tag-small">${StringUtils.escapeHtml(tag)}</span>`).join('')}
                            ${metadata.tags.length > 3 ? `<span class="tag-more">+${metadata.tags.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="rule-card-footer">
                    <div class="rule-status ${metadata.status}">
                        <span class="rule-status-indicator"></span>
                        <span>${StringUtils.capitalize(metadata.status)}</span>
                    </div>
                    
                    <div class="rule-actions">
                        <button class="btn btn-sm btn-secondary view-rule" 
                                data-rule-id="${ruleId}">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render empty state
     */
    renderEmpty() {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3 class="empty-state-title">No Validation Rules Found</h3>
                <p class="empty-state-description">
                    There are no validation rules in the database.
                </p>
            </div>
        `;
    }
    
    /**
     * Render error state
     */
    renderError(error) {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3 class="empty-state-title">Error Loading Rules</h3>
                <p class="empty-state-description">
                    Failed to load validation rules from the database.
                    <br><br>
                    <strong>Error:</strong> ${StringUtils.escapeHtml(error)}
                </p>
                <button class="btn btn-primary" onclick="ruleList.loadRules()">
                    Try Again
                </button>
            </div>
        `;
    }
    
    /**
     * Bind events for rule cards
     */
    bindRuleCardEvents() {
        // Rule card click to view details
        DOM.queryAll('.rule-card').forEach(card => {
            DOM.on(card, 'click', (e) => {
                if (e.target.closest('.rule-actions')) return;
                
                const ruleId = card.dataset.ruleId;
                this.viewRuleDetails(ruleId);
            });
        });
        
        // View details button
        DOM.queryAll('.view-rule').forEach(button => {
            DOM.on(button, 'click', (e) => {
                e.stopPropagation();
                const ruleId = button.dataset.ruleId;
                this.viewRuleDetails(ruleId);
            });
        });
    }
    
    /**
     * View rule details
     */
    async viewRuleDetails(ruleId) {
        console.log('viewRuleDetails called with ruleId:', ruleId);
        console.log('Available rules:', this.rules.map(r => r.id));
        console.log('window.ruleDetails available:', !!window.ruleDetails);
        
        // Find rule by matching the ruleId (without _design/) against rule.id (with _design/)
        const rule = this.rules.find(r => r.id === `_design/${ruleId}` || r.id === ruleId);
        if (!rule) {
            console.error('Rule not found for ruleId:', ruleId);
            Notifications.error('Rule not found');
            return;
        }
        
        console.log('Found rule:', rule);
        UIState.setSelectedRule(rule);
        
        // Use RuleDetails to show details
        if (window.ruleDetails) {
            console.log('Calling window.ruleDetails.showRuleDetails');
            window.ruleDetails.showRuleDetails(rule);
        } else {
            console.error('window.ruleDetails not available');
            Notifications.error('Rule details component not available');
        }
    }
    
    /**
     * Test rule
     */
    testRule(ruleId) {
        const rule = this.rules.find(r => r.id === ruleId);
        if (!rule) {
            Notifications.error('Rule not found');
            return;
        }
        
        UIState.setSelectedRule(rule);
        UIState.setTab('test');
        
        // Focus on test panel
        if (window.testPanel) {
            window.testPanel.focusOnRule(rule);
        }
    }
    
    /**
     * Filter rules by search term
     */
    filterRules(searchTerm) {
        if (!searchTerm) {
            this.render();
            return;
        }
        
        const filteredRules = this.rules.filter(rule => {
            const metadata = rule.metadata || {};
            const searchText = [
                metadata.name,
                metadata.description,
                metadata.author,
                ...(metadata.tags || [])
            ].join(' ').toLowerCase();
            
            return searchText.includes(searchTerm.toLowerCase());
        });
        
        const originalRules = this.rules;
        this.rules = filteredRules;
        this.render();
        this.rules = originalRules;
    }
    
    /**
     * Sort rules by criteria
     */
    sortRules(criteria = 'name', direction = 'asc') {
        this.rules.sort((a, b) => {
            let aValue, bValue;
            
            switch (criteria) {
                case 'name':
                    aValue = (a.metadata?.name || '').toLowerCase();
                    bValue = (b.metadata?.name || '').toLowerCase();
                    break;
                case 'modified':
                    aValue = new Date(a.metadata?.modified_date || 0);
                    bValue = new Date(b.metadata?.modified_date || 0);
                    break;
                case 'version':
                    aValue = a.metadata?.version || '0.0.0';
                    bValue = b.metadata?.version || '0.0.0';
                    break;
                case 'status':
                    aValue = a.metadata?.status || 'active';
                    bValue = b.metadata?.status || 'active';
                    break;
                default:
                    aValue = a.name;
                    bValue = b.name;
            }
            
            if (direction === 'desc') {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            } else {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            }
        });
        
        this.render();
    }
    
    /**
     * Get rule by ID
     */
    getRuleById(ruleId) {
        return this.rules.find(rule => rule.id === ruleId);
    }
    
    /**
     * Refresh rules list
     */
    refresh() {
        this.loadRules();
    }
}

// Initialize when DOM is ready
let ruleList = null;

// Export for global access
window.RuleList = RuleList;
