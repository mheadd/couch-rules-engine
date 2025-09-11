/**
 * CouchDB Helper utilities for testing
 * Provides common functionality for CouchDB setup, teardown, and operations during testing
 */

const config = require('../../config').options;

class CouchDBHelper {
    constructor(dbName = 'test', username = 'admin', password = 'password') {
        this.dbName = dbName;
        this.username = username;
        this.password = password;
        this.baseUrl = config.couchdb_url;
        this.dbUrl = `${this.baseUrl}${this.dbName}`;
        this.auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    }

    /**
     * Create a test database
     */
    async createDatabase() {
        try {
            const response = await fetch(this.dbUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${this.auth}`
                }
            });
            
            if (response.ok) {
                return await response.json();
            } else if (response.status === 412) {
                // Database already exists
                return { ok: true, already_exists: true };
            } else {
                throw new Error(`Failed to create database: ${response.status}`);
            }
        } catch (error) {
            console.warn(`Database creation warning: ${error.message}`);
            // Return success for testing even if database already exists
            return { ok: true };
        }
    }

    /**
     * Delete a test database
     */
    async deleteDatabase() {
        try {
            const response = await fetch(this.dbUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${this.auth}`
                }
            });
            
            if (!response.ok && response.status !== 404) { // 404 = database doesn't exist
                throw new Error(`Failed to delete database: ${response.status}`);
            }
            
            return response.ok ? await response.json() : { ok: true };
        } catch (error) {
            console.warn(`Database deletion warning: ${error.message}`);
            // Return success for testing even if database doesn't exist
            return { ok: true };
        }
    }

    /**
     * Insert a document into the database
     */
    async insertDocument(doc) {
        const response = await fetch(this.dbUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${this.auth}`
            },
            body: JSON.stringify(doc)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.reason || `Failed to insert document: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Load a design document (validation rule) into the database
     */
    async loadDesignDocument(name, validationFunction) {
        const designDoc = {
            _id: `_design/${name}`,
            validate_doc_update: validationFunction.toString()
        };

        const response = await fetch(this.dbUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${this.auth}`
            },
            body: JSON.stringify(designDoc)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.reason || `Failed to load design document: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Load a design document with metadata into the database
     */
    async loadDesignDocumentWithMetadata(name, validationFunction, metadata) {
        const designDoc = {
            _id: `_design/${name}`,
            validate_doc_update: validationFunction.toString(),
            rule_metadata: metadata
        };

        const response = await fetch(this.dbUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${this.auth}`
            },
            body: JSON.stringify(designDoc)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.reason || `Failed to load design document with metadata: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Retrieve a design document from the database
     */
    async getDesignDocument(name) {
        const response = await fetch(`${this.dbUrl}/_design/${name}`, {
            headers: {
                'Authorization': `Basic ${this.auth}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.reason || `Failed to get design document: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Check if CouchDB is running and accessible
     */
    async isAccessible() {
        try {
            const response = await fetch(`${this.baseUrl}_up`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get database information
     */
    async getDatabaseInfo() {
        const response = await fetch(this.dbUrl, {
            headers: {
                'Authorization': `Basic ${this.auth}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get database info: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Clean up all design documents from the database
     */
    async cleanupDesignDocuments() {
        try {
            const response = await fetch(`${this.dbUrl}/_design_docs`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`
                }
            });

            if (!response.ok) {
                return { cleaned: 0 };
            }

            const docs = await response.json();
            let cleaned = 0;

            for (const row of docs.rows) {
                const deleteUrl = `${this.dbUrl}/${row.id}?rev=${row.value.rev}`;
                const deleteResponse = await fetch(deleteUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Basic ${this.auth}`
                    }
                });

                if (deleteResponse.ok) {
                    cleaned++;
                }
            }

            return { cleaned };
        } catch (error) {
            console.warn(`Cleanup warning: ${error.message}`);
            return { cleaned: 0 };
        }
    }
}

module.exports = CouchDBHelper;
