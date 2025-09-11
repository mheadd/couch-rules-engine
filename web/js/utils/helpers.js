/**
 * Helper Utilities
 * Common operations, data formatting, and error handling
 */

/**
 * DOM Utilities
 */
const DOM = {
    /**
     * Get element by ID
     */
    get(id) {
        return document.getElementById(id);
    },
    
    /**
     * Query selector
     */
    query(selector) {
        return document.querySelector(selector);
    },
    
    /**
     * Query all selectors
     */
    queryAll(selector) {
        return document.querySelectorAll(selector);
    },
    
    /**
     * Create element with attributes and content
     */
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (content) {
            element.textContent = content;
        }
        
        return element;
    },
    
    /**
     * Show element
     */
    show(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.remove('hidden');
            element.style.display = '';
        }
    },
    
    /**
     * Hide element
     */
    hide(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.add('hidden');
        }
    },
    
    /**
     * Toggle element visibility
     */
    toggle(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.toggle('hidden');
        }
    },
    
    /**
     * Add event listener with automatic cleanup
     * Supports both direct and delegated events
     */
    on(element, event, selectorOrHandler, handler) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        
        if (!element) return;
        
        // If there are 4 parameters, it's event delegation: on(element, event, selector, handler)
        if (arguments.length === 4 && typeof selectorOrHandler === 'string') {
            const selector = selectorOrHandler;
            const delegatedHandler = (e) => {
                // Check if the target or any parent matches the selector
                const target = e.target.closest(selector);
                if (target && element.contains(target)) {
                    // Call handler with the matched element as context
                    handler.call(target, e);
                }
            };
            
            element.addEventListener(event, delegatedHandler);
            return () => element.removeEventListener(event, delegatedHandler);
        } 
        // If there are 3 parameters, it's direct event: on(element, event, handler)
        else if (arguments.length === 3) {
            const directHandler = selectorOrHandler;
            element.addEventListener(event, directHandler);
            return () => element.removeEventListener(event, directHandler);
        }
    }
};

/**
 * Date Formatting Utilities
 */
const DateUtils = {
    /**
     * Format ISO date string to human readable format
     */
    format(isoString, options = {}) {
        if (!isoString) return 'N/A';
        
        const date = new Date(isoString);
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    },
    
    /**
     * Get relative time (e.g., "2 days ago")
     */
    relative(isoString) {
        if (!isoString) return 'N/A';
        
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffDays > 7) {
            return this.format(isoString, { year: 'numeric', month: 'short', day: 'numeric' });
        } else if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }
};

/**
 * String Utilities
 */
const StringUtils = {
    /**
     * Truncate string with ellipsis
     */
    truncate(str, length = 100) {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + '...';
    },
    
    /**
     * Capitalize first letter
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    /**
     * Convert camelCase to Title Case
     */
    camelToTitle(str) {
        if (!str) return '';
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    },
    
    /**
     * Escape HTML characters
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

/**
 * Validation Utilities
 */
const ValidationUtils = {
    /**
     * Validate semantic version
     */
    isValidSemver(version) {
        const semverRegex = /^(\d+)\.(\d+)\.(\d+)(-[a-zA-Z0-9\-\.]+)?(\+[a-zA-Z0-9\-\.]+)?$/;
        return semverRegex.test(version);
    },
    
    /**
     * Validate rule name
     */
    isValidRuleName(name) {
        const nameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
        return nameRegex.test(name);
    },
    
    /**
     * Validate JavaScript function syntax
     */
    isValidJavaScript(code) {
        try {
            new Function(code);
            return true;
        } catch (error) {
            return false;
        }
    },
    
    /**
     * Validate email address
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};

/**
 * UI State Management
 */
const UIState = {
    currentTab: 'rules',
    isLoading: false,
    selectedRule: null,
    
    /**
     * Set current tab
     */
    setTab(tabName) {
        this.currentTab = tabName;
        this.updateTabDisplay();
    },
    
    /**
     * Update tab display
     */
    updateTabDisplay() {
        // Hide all tab contents
        DOM.queryAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        DOM.queryAll('.nav-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show current tab
        const currentTabContent = DOM.get(`${this.currentTab}-tab`);
        const currentTabButton = DOM.query(`[data-tab="${this.currentTab}"]`);
        
        if (currentTabContent) {
            currentTabContent.classList.add('active');
        }
        
        if (currentTabButton) {
            currentTabButton.classList.add('active');
        }
    },
    
    /**
     * Set loading state
     */
    setLoading(isLoading) {
        this.isLoading = isLoading;
        const overlay = DOM.get('loading-overlay');
        if (overlay) {
            if (isLoading) {
                overlay.classList.add('show');
            } else {
                overlay.classList.remove('show');
            }
        }
    },
    
    /**
     * Set selected rule
     */
    setSelectedRule(rule) {
        this.selectedRule = rule;
    }
};

/**
 * Notification System
 */
const Notifications = {
    /**
     * Show success message
     */
    success(message, duration = 5000) {
        this.show('success', message, duration);
    },
    
    /**
     * Show error message
     */
    error(message, duration = 8000) {
        this.show('error', message, duration);
    },
    
    /**
     * Show notification
     */
    show(type, message, duration) {
        const toast = DOM.get(`${type}-toast`);
        const messageEl = DOM.get(`${type}-message`);
        
        if (toast && messageEl) {
            messageEl.textContent = message;
            toast.classList.add('show');
            
            // Auto-hide after duration
            setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
        }
    },
    
    /**
     * Hide all notifications
     */
    hideAll() {
        DOM.queryAll('.toast').forEach(toast => {
            toast.classList.remove('show');
        });
    }
};

/**
 * Modal System
 */
const Modal = {
    /**
     * Show modal with content
     */
    show(title, content, footer = null) {
        const modal = DOM.get('rule-modal');
        const titleEl = DOM.get('modal-title');
        const bodyEl = DOM.get('modal-body');
        const footerEl = DOM.query('.modal-footer');
        
        if (modal && titleEl && bodyEl) {
            titleEl.textContent = title;
            bodyEl.innerHTML = content;
            
            if (footer && footerEl) {
                footerEl.innerHTML = footer;
            }
            
            modal.classList.add('show');
        }
    },
    
    /**
     * Hide modal
     */
    hide() {
        const modal = DOM.get('rule-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
};

/**
 * Status Management
 */
const StatusManager = {
    /**
     * Update connection status
     */
    updateStatus(connected, message) {
        const indicator = DOM.get('status-indicator');
        const text = DOM.get('status-text');
        
        if (indicator && text) {
            indicator.className = 'status-indicator';
            
            if (connected) {
                indicator.classList.add('connected');
                text.textContent = message || 'Connected to CouchDB';
            } else {
                indicator.classList.add('error');
                text.textContent = message || 'Connection failed';
            }
        }
    }
};

/**
 * Data Formatting
 */
const DataFormat = {
    /**
     * Format rule metadata for display
     */
    formatRuleMetadata(metadata) {
        return {
            name: metadata.name || 'Unnamed Rule',
            description: metadata.description || 'No description provided',
            version: metadata.version || '1.0.0',
            author: metadata.author || 'Unknown',
            tags: Array.isArray(metadata.tags) ? metadata.tags : [],
            status: metadata.status || 'active',
            created: DateUtils.format(metadata.created_date),
            modified: DateUtils.relative(metadata.modified_date),
            changeNotes: metadata.change_notes || 'No change notes'
        };
    },
    
    /**
     * Format validation function for display
     */
    formatValidationFunction(func) {
        if (typeof func === 'string') {
            return func;
        }
        if (typeof func === 'function') {
            return func.toString();
        }
        return 'No validation function';
    }
};

/**
 * Debounce utility
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle utility
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate unique ID
 */
function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
