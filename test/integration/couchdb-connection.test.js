const assert = require('assert');
const { getTestSetup } = require('../helpers/test-setup');

describe('CouchDB Connection Integration Tests', function() {
    let testSetup;
    let couchHelper;

    before(async function() {
        this.timeout(10000);
        testSetup = getTestSetup();
        couchHelper = testSetup.getCouchHelper();
        
        // Skip these tests if CouchDB is not available
        if (testSetup.shouldSkipCouchDB()) {
            this.skip();
        }
    });

    describe('Database Operations', function() {
        it('should connect to CouchDB instance', async function() {
            const isAccessible = await couchHelper.isAccessible();
            assert.strictEqual(isAccessible, true, 'CouchDB should be accessible');
        });

        it('should create a test database', async function() {
            const result = await couchHelper.createDatabase();
            assert.strictEqual(result.ok, true, 'Database creation should succeed');
        });

        it('should get database information', async function() {
            const info = await couchHelper.getDatabaseInfo();
            assert.strictEqual(info.db_name, couchHelper.dbName, 'Database name should match');
            assert.strictEqual(typeof info.doc_count, 'number', 'Document count should be a number');
        });

        it('should handle database that already exists', async function() {
            // Try to create the same database again
            const result = await couchHelper.createDatabase();
            assert.strictEqual(result.ok, true, 'Should handle existing database gracefully');
        });
    });

    describe('Document Operations', function() {
        beforeEach(async function() {
            // Ensure we have a clean database for each test
            await couchHelper.deleteDatabase();
            await couchHelper.createDatabase();
        });

        it('should insert a valid document', async function() {
            const doc = {
                name: "Test Person",
                income: 20000,
                householdSize: 4,
                numberOfDependents: 2,
                interviewComplete: "true"
            };

            const result = await couchHelper.insertDocument(doc);
            assert.strictEqual(result.ok, true, 'Document insertion should succeed');
            assert.strictEqual(typeof result.id, 'string', 'Should return document ID');
            assert.strictEqual(typeof result.rev, 'string', 'Should return document revision');
        });

        it('should handle document insertion without validation rules', async function() {
            // Since no validation rules are loaded, any document should be accepted
            const invalidDoc = {
                name: "Invalid Person",
                income: 50000, // This would normally fail validation
                householdSize: 1,
                numberOfDependents: 0,
                interviewComplete: ""
            };

            const result = await couchHelper.insertDocument(invalidDoc);
            assert.strictEqual(result.ok, true, 'Document should be accepted without validation rules');
        });
    });

    describe('Design Document Operations', function() {
        beforeEach(async function() {
            await couchHelper.deleteDatabase();
            await couchHelper.createDatabase();
        });

        it('should load a design document with validation function', async function() {
            const validationFunction = function(newDoc, oldDoc, userCtx) {
                if (newDoc.income > 25000) {
                    throw({forbidden: 'Income must be lower than $25,000'});
                }
                return true;
            };

            const result = await couchHelper.loadDesignDocument('testValidator', validationFunction);
            assert.strictEqual(result.ok, true, 'Design document should be loaded successfully');
        });

        it('should load a design document with metadata', async function() {
            const { createRuleMetadata } = require('../../utils/rule-metadata');
            const validator = function(newDoc, oldDoc, userCtx) {
                if (!newDoc.test_field) {
                    throw({forbidden: 'test_field is required'});
                }
                return true;
            };

            const metadata = createRuleMetadata({
                name: 'Test Validator with Metadata',
                description: 'A test validator that includes metadata'
            });

            const result = await couchHelper.loadDesignDocumentWithMetadata('testValidatorMeta', validator, metadata);
            assert.strictEqual(result.ok, true, 'Design document with metadata should be loaded successfully');
        });

        it('should retrieve design document with metadata', async function() {
            const { createRuleMetadata } = require('../../utils/rule-metadata');
            const validator = function(newDoc, oldDoc, userCtx) {
                return true;
            };

            const metadata = createRuleMetadata({
                name: 'Retrievable Test Validator',
                description: 'A test validator for metadata retrieval',
                tags: ['test', 'metadata', 'retrieval'],
                version: '1.2.3'
            });

            // Load the design document
            await couchHelper.loadDesignDocumentWithMetadata('retrievableValidator', validator, metadata);

            // Retrieve it back
            const retrievedDoc = await couchHelper.getDesignDocument('retrievableValidator');
            
            assert.strictEqual(retrievedDoc._id, '_design/retrievableValidator');
            assert(retrievedDoc.rule_metadata, 'Should contain rule_metadata');
            assert.strictEqual(retrievedDoc.rule_metadata.name, 'Retrievable Test Validator');
            assert.strictEqual(retrievedDoc.rule_metadata.description, 'A test validator for metadata retrieval');
            assert.strictEqual(retrievedDoc.rule_metadata.version, '1.2.3');
            assert.deepStrictEqual(retrievedDoc.rule_metadata.tags, ['test', 'metadata', 'retrieval']);
            assert(retrievedDoc.validate_doc_update, 'Should contain validation function');
        });

        it('should clean up design documents', async function() {
            // Load a couple of design documents
            const validator1 = function() { return true; };
            const validator2 = function() { return true; };

            await couchHelper.loadDesignDocument('validator1', validator1);
            await couchHelper.loadDesignDocument('validator2', validator2);

            // Clean them up
            const result = await couchHelper.cleanupDesignDocuments();
            assert.strictEqual(result.cleaned, 2, 'Should clean up 2 design documents');
        });
    });

    describe('Error Handling', function() {
        it('should handle connection to non-existent database gracefully', async function() {
            const nonExistentHelper = new (require('../helpers/couchdb-helper'))('non_existent_db');
            
            try {
                await nonExistentHelper.getDatabaseInfo();
                assert.fail('Should have thrown an error for non-existent database');
            } catch (error) {
                assert.strictEqual(typeof error.message, 'string', 'Should provide error message');
            }
        });

        it('should handle invalid document insertion', async function() {
            // First load a validation rule
            const strictValidator = function(newDoc, oldDoc, userCtx) {
                if (!newDoc.required_field) {
                    throw({forbidden: 'required_field is mandatory'});
                }
                return true;
            };

            await couchHelper.loadDesignDocument('strictValidator', strictValidator);

            // Try to insert document that violates validation
            const invalidDoc = {
                name: "Missing Required Field"
                // missing required_field
            };

            try {
                await couchHelper.insertDocument(invalidDoc);
                assert.fail('Should have thrown validation error');
            } catch (error) {
                assert.strictEqual(typeof error.message, 'string', 'Should provide validation error message');
            }
        });
    });

    describe('Configuration', function() {
        it('should use correct database URL configuration', function() {
            assert.strictEqual(typeof couchHelper.baseUrl, 'string', 'Base URL should be configured');
            assert.strictEqual(typeof couchHelper.dbUrl, 'string', 'Database URL should be configured');
            assert.match(couchHelper.dbUrl, /^https?:\/\//, 'Database URL should be a valid HTTP URL');
        });

        it('should have authentication configured', function() {
            assert.strictEqual(typeof couchHelper.auth, 'string', 'Authentication should be configured');
            assert.strictEqual(typeof couchHelper.username, 'string', 'Username should be configured');
            assert.strictEqual(typeof couchHelper.password, 'string', 'Password should be configured');
        });
    });
});
