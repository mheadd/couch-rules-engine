/**
 * CouchDB Client Utility
 * Direct HTTP API communication with CouchDB
 * Supports authentication and CORS
 */

class CouchDBClient {
    constructor(config = {}) {
        // Default configuration
        this.config = {
            host: config.host || 'localhost',
            port: config.port || 5984,
            protocol: config.protocol || 'http',
            username: config.username || 'admin',
            password: config.password || 'password',
            database: config.database || 'rules_db',
            timeout: config.timeout || 10000,
            ...config
        };
        
        // Build base URL
        this.baseUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}`;
        this.dbUrl = `${this.baseUrl}/${this.config.database}`;
        
        // Create auth header
        this.auth = btoa(`${this.config.username}:${this.config.password}`);
        
        // Connection status
        this.connected = false;
        this.lastError = null;
    }
    
    /**
     * Get default headers for API requests
     */
    getHeaders(additionalHeaders = {}) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.auth}`,
            'Accept': 'application/json',
            ...additionalHeaders
        };
    }
    
    /**
     * Make HTTP request with error handling
     */
    async makeRequest(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        try {
            const response = await fetch(url, {
                headers: this.getHeaders(options.headers),
                signal: controller.signal,
                ...options
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.reason || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            this.lastError = error.message;
            throw error;
        }
    }
    
    /**
     * Test connection to CouchDB
     */
    async testConnection() {
        try {
            const result = await this.makeRequest(`${this.baseUrl}/_up`);
            this.connected = true;
            this.lastError = null;
            return { connected: true, info: result };
        } catch (error) {
            this.connected = false;
            this.lastError = error.message;
            return { connected: false, error: error.message };
        }
    }
    
    /**
     * Get database information
     */
    async getDatabaseInfo() {
        try {
            const info = await this.makeRequest(this.dbUrl);
            return { success: true, data: info };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Create database if it doesn't exist
     */
    async createDatabase() {
        try {
            await this.makeRequest(this.dbUrl, { method: 'PUT' });
            return { success: true, message: 'Database created successfully' };
        } catch (error) {
            if (error.message.includes('exists')) {
                return { success: true, message: 'Database already exists' };
            }
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get all design documents (validation rules)
     */
    async getDesignDocuments() {
        try {
            const result = await this.makeRequest(`${this.dbUrl}/_design_docs?include_docs=true`);
            
            const rules = result.rows.map(row => ({
                id: row.doc._id,
                rev: row.doc._rev,
                name: row.doc._id.replace('_design/', ''),
                metadata: row.doc.metadata || row.doc.rule_metadata || {},
                validationFunction: row.doc.validate_doc_update,
                doc: row.doc
            }));
            
            return { success: true, data: rules };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get a specific design document
     */
    async getDesignDocument(name) {
        try {
            const designId = name.startsWith('_design/') ? name : `_design/${name}`;
            const doc = await this.makeRequest(`${this.dbUrl}/${designId}`);
            
            return {
                success: true,
                data: {
                    id: doc._id,
                    rev: doc._rev,
                    name: doc._id.replace('_design/', ''),
                    metadata: doc.rule_metadata || {},
                    validationFunction: doc.validate_doc_update,
                    doc: doc
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Create a new design document (validation rule)
     */
    async createDesignDocument(name, validationFunction, metadata) {
        try {
            const designId = `_design/${name}`;
            const doc = {
                _id: designId,
                validate_doc_update: validationFunction,
                rule_metadata: {
                    name: metadata.name,
                    description: metadata.description,
                    version: metadata.version || '1.0.0',
                    author: metadata.author || 'Web Interface',
                    tags: metadata.tags || [],
                    status: metadata.status || 'active',
                    created_date: new Date().toISOString(),
                    modified_date: new Date().toISOString(),
                    change_notes: metadata.change_notes || 'Created via web interface'
                }
            };
            
            const result = await this.makeRequest(this.dbUrl, {
                method: 'POST',
                body: JSON.stringify(doc)
            });
            
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Update an existing design document
     */
    async updateDesignDocument(name, validationFunction, metadata, rev) {
        try {
            const designId = `_design/${name}`;
            const doc = {
                _id: designId,
                _rev: rev,
                validate_doc_update: validationFunction,
                rule_metadata: {
                    ...metadata,
                    modified_date: new Date().toISOString()
                }
            };
            
            const result = await this.makeRequest(`${this.dbUrl}/${designId}`, {
                method: 'PUT',
                body: JSON.stringify(doc)
            });
            
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Delete a design document
     */
    async deleteDesignDocument(name, rev) {
        try {
            const designId = name.startsWith('_design/') ? name : `_design/${name}`;
            const result = await this.makeRequest(`${this.dbUrl}/${designId}?rev=${rev}`, {
                method: 'DELETE'
            });
            
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Test a document against validation rules
     */
    async testDocument(document) {
        try {
            const result = await this.makeRequest(this.dbUrl, {
                method: 'POST',
                body: JSON.stringify(document)
            });
            
            return { 
                success: true, 
                valid: true,
                data: result,
                message: 'Document is valid'
            };
        } catch (error) {
            // Check if it's a validation error
            if (error.message.includes('forbidden')) {
                return {
                    success: true,
                    valid: false,
                    error: error.message,
                    message: 'Document failed validation'
                };
            }
            
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get sample documents for testing
     */
    async getSampleDocuments() {
        // Return predefined sample documents
        return {
            success: true,
            data: {
                valid: {
                    name: "Valid Test Person",
                    income: 20000,
                    householdSize: 4,
                    numberOfDependents: 2,
                    interviewComplete: "true"
                },
                invalid: {
                    name: "Invalid Test Person", 
                    income: 35000,
                    householdSize: 2,
                    numberOfDependents: 0,
                    interviewComplete: ""
                },
                boundary: {
                    name: "Boundary Test Person",
                    income: 25000,
                    householdSize: 3,
                    numberOfDependents: 2,
                    interviewComplete: "yes"
                }
            }
        };
    }
    
    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.connected,
            lastError: this.lastError,
            config: {
                host: this.config.host,
                port: this.config.port,
                database: this.config.database
            }
        };
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.baseUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}`;
        this.dbUrl = `${this.baseUrl}/${this.config.database}`;
        this.auth = btoa(`${this.config.username}:${this.config.password}`);
        this.connected = false;
        this.lastError = null;
    }
}

// Global instance
window.couchDBClient = null;

/**
 * Initialize CouchDB client with configuration
 */
function initializeCouchDB(config = {}) {
    window.couchDBClient = new CouchDBClient(config);
    return window.couchDBClient;
}

/**
 * Get the global CouchDB client instance
 */
function getCouchDBClient() {
    if (!window.couchDBClient) {
        // Load saved connection settings from localStorage
        const savedSettings = localStorage.getItem('couchdb-connection-settings');
        let config = {};
        
        if (savedSettings) {
            try {
                config = JSON.parse(savedSettings);
            } catch (e) {
                console.warn('Failed to parse saved connection settings:', e);
            }
        }
        
        window.couchDBClient = new CouchDBClient(config);
    }
    return window.couchDBClient;
}

/**
 * Reset the global CouchDB client instance
 * Call this after updating connection settings
 */
function resetCouchDBClient() {
    window.couchDBClient = null;
}
