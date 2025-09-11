/**
 * Test Setup utilities
 * Provides common setup and teardown functionality for tests
 */

const CouchDBHelper = require('./couchdb-helper');
const MockDataGenerator = require('./mock-data-generator');

class TestSetup {
    constructor(options = {}) {
        this.dbName = options.dbName || 'test_db';
        this.username = options.username || 'admin';
        this.password = options.password || 'password';
        this.couchHelper = new CouchDBHelper(this.dbName, this.username, this.password);
        this.skipCouchDB = options.skipCouchDB || false;
    }

    /**
     * Global test setup - run before all tests
     */
    async globalSetup() {
        if (this.skipCouchDB) {
            console.log('Skipping CouchDB setup (skipCouchDB=true)');
            return;
        }

        // Check if CouchDB is accessible
        const isAccessible = await this.couchHelper.isAccessible();
        if (!isAccessible) {
            console.warn('CouchDB is not accessible. Some tests may be skipped.');
            this.skipCouchDB = true;
            return;
        }

        console.log('Setting up test environment...');
        
        // Clean up any existing test database
        await this.couchHelper.deleteDatabase();
        
        // Create fresh test database
        await this.couchHelper.createDatabase();
        
        console.log(`Test database '${this.dbName}' created successfully`);
    }

    /**
     * Global test teardown - run after all tests
     */
    async globalTeardown() {
        if (this.skipCouchDB) {
            return;
        }

        console.log('Cleaning up test environment...');
        
        // Clean up test database
        await this.couchHelper.deleteDatabase();
        
        console.log(`Test database '${this.dbName}' cleaned up successfully`);
    }

    /**
     * Setup for individual test suites
     */
    async suiteSetup() {
        if (this.skipCouchDB) {
            return;
        }

        // Clean up any design documents from previous tests
        await this.couchHelper.cleanupDesignDocuments();
    }

    /**
     * Teardown for individual test suites
     */
    async suiteTeardown() {
        if (this.skipCouchDB) {
            return;
        }

        // Clean up design documents after tests
        await this.couchHelper.cleanupDesignDocuments();
    }

    /**
     * Load validation rules for testing
     */
    async loadValidationRules() {
        if (this.skipCouchDB) {
            return;
        }

        const validators = require('../../index');
        
        for (const [validatorName, validatorModule] of Object.entries(validators)) {
            const validationFunction = validatorModule[validatorName];
            await this.couchHelper.loadDesignDocument(validatorName, validationFunction);
        }
        
        console.log('Validation rules loaded for testing');
    }

    /**
     * Get test data generators
     */
    getDataGenerator() {
        return MockDataGenerator;
    }

    /**
     * Get CouchDB helper instance
     */
    getCouchHelper() {
        return this.couchHelper;
    }

    /**
     * Check if CouchDB tests should be skipped
     */
    shouldSkipCouchDB() {
        return this.skipCouchDB;
    }

    /**
     * Create a mocha before/after setup for test suites
     */
    getMochaHooks() {
        const self = this;
        
        return {
            before: async function() {
                this.timeout(10000); // Increase timeout for setup
                await self.suiteSetup();
            },
            
            after: async function() {
                this.timeout(5000); // Increase timeout for teardown
                await self.suiteTeardown();
            },
            
            beforeEach: function() {
                // Individual test setup if needed
            },
            
            afterEach: function() {
                // Individual test cleanup if needed
            }
        };
    }

    /**
     * Helper to run a function only if CouchDB is available
     */
    async runIfCouchDBAvailable(fn) {
        if (this.skipCouchDB) {
            console.log('Skipping test - CouchDB not available');
            return;
        }
        
        return await fn();
    }

    /**
     * Generate common test scenarios
     */
    getTestScenarios() {
        return {
            validDocument: MockDataGenerator.generateValidPerson(),
            invalidDocument: MockDataGenerator.generateInvalidPerson(),
            edgeCases: MockDataGenerator.generateEdgeCases(),
            multipleFailures: MockDataGenerator.generateMultipleFailures(),
            batch: MockDataGenerator.generateBatch(5)
        };
    }
}

// Export singleton instance for consistent usage across tests
let testSetupInstance = null;

function getTestSetup(options = {}) {
    if (!testSetupInstance) {
        testSetupInstance = new TestSetup(options);
    }
    return testSetupInstance;
}

// Export both class and singleton getter
module.exports = {
    TestSetup,
    getTestSetup
};
