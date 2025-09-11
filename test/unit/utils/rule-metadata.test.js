const assert = require('assert');
const { 
    createRuleMetadata, 
    updateRuleMetadata, 
    validateMetadata, 
    createDesignDocument,
    isValidSemanticVersion,
    VALIDATOR_METADATA 
} = require('../../../utils/rule-metadata');

describe('Rule Metadata Utilities', function() {
    describe('createRuleMetadata', function() {
        it('should create valid metadata with all required fields', function() {
            const options = {
                name: 'Test Rule',
                description: 'A test validation rule'
            };
            
            const metadata = createRuleMetadata(options);
            
            assert.strictEqual(metadata.name, 'Test Rule');
            assert.strictEqual(metadata.description, 'A test validation rule');
            assert.strictEqual(metadata.version, '1.0.0');
            assert.strictEqual(metadata.author, 'CouchDB Rules Engine');
            assert.strictEqual(metadata.status, 'active');
            assert.strictEqual(metadata.change_notes, 'Initial implementation');
            assert(Array.isArray(metadata.tags));
            assert(metadata.created_date);
            assert(metadata.modified_date);
        });

        it('should accept custom options and override defaults', function() {
            const options = {
                name: 'Custom Rule',
                description: 'Custom description',
                version: '2.1.0',
                author: 'Test Author',
                tags: ['custom', 'test'],
                status: 'draft',
                changeNotes: 'Custom change notes'
            };
            
            const metadata = createRuleMetadata(options);
            
            assert.strictEqual(metadata.name, 'Custom Rule');
            assert.strictEqual(metadata.version, '2.1.0');
            assert.strictEqual(metadata.author, 'Test Author');
            assert.deepStrictEqual(metadata.tags, ['custom', 'test']);
            assert.strictEqual(metadata.status, 'draft');
            assert.strictEqual(metadata.change_notes, 'Custom change notes');
        });

        it('should set created_date and modified_date to current time', function() {
            const beforeTime = new Date().toISOString();
            const metadata = createRuleMetadata({
                name: 'Test Rule',
                description: 'Test description'
            });
            const afterTime = new Date().toISOString();
            
            assert(metadata.created_date >= beforeTime);
            assert(metadata.created_date <= afterTime);
            assert(metadata.modified_date >= beforeTime);
            assert(metadata.modified_date <= afterTime);
        });
    });

    describe('updateRuleMetadata', function() {
        it('should update metadata and modify the modified_date', function(done) {
            const originalMetadata = createRuleMetadata({
                name: 'Original Rule',
                description: 'Original description'
            });
            
            // Wait a brief moment to ensure different timestamps
            setTimeout(() => {
                const updates = {
                    description: 'Updated description',
                    version: '1.1.0'
                };
                
                const updatedMetadata = updateRuleMetadata(originalMetadata, updates);
                
                assert.strictEqual(updatedMetadata.name, 'Original Rule');
                assert.strictEqual(updatedMetadata.description, 'Updated description');
                assert.strictEqual(updatedMetadata.version, '1.1.0');
                assert.strictEqual(updatedMetadata.created_date, originalMetadata.created_date);
                assert(updatedMetadata.modified_date > originalMetadata.modified_date);
                done();
            }, 10);
        });

        it('should throw error for invalid semantic version', function() {
            const metadata = createRuleMetadata({
                name: 'Test Rule',
                description: 'Test description'
            });
            
            assert.throws(() => {
                updateRuleMetadata(metadata, { version: 'invalid-version' });
            }, /Invalid semantic version/);
        });
    });

    describe('isValidSemanticVersion', function() {
        it('should validate correct semantic versions', function() {
            assert.strictEqual(isValidSemanticVersion('1.0.0'), true);
            assert.strictEqual(isValidSemanticVersion('0.1.0'), true);
            assert.strictEqual(isValidSemanticVersion('10.20.30'), true);
            assert.strictEqual(isValidSemanticVersion('1.0.0-alpha'), true);
            assert.strictEqual(isValidSemanticVersion('1.0.0+build.1'), true);
            assert.strictEqual(isValidSemanticVersion('1.0.0-alpha.1+build.1'), true);
        });

        it('should reject invalid semantic versions', function() {
            assert.strictEqual(isValidSemanticVersion('1.0'), false);
            assert.strictEqual(isValidSemanticVersion('1'), false);
            assert.strictEqual(isValidSemanticVersion('1.0.0.0'), false);
            assert.strictEqual(isValidSemanticVersion('invalid'), false);
            assert.strictEqual(isValidSemanticVersion(''), false);
            assert.strictEqual(isValidSemanticVersion('v1.0.0'), false);
        });
    });

    describe('validateMetadata', function() {
        it('should validate correct metadata structure', function() {
            const validMetadata = createRuleMetadata({
                name: 'Test Rule',
                description: 'Test description'
            });
            
            const result = validateMetadata(validMetadata);
            
            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.errors.length, 0);
        });

        it('should reject metadata missing required fields', function() {
            const invalidMetadata = {
                name: 'Test Rule'
                // Missing description, version, author, status
            };
            
            const result = validateMetadata(invalidMetadata);
            
            assert.strictEqual(result.isValid, false);
            assert(result.errors.some(error => error.includes('description')));
            assert(result.errors.some(error => error.includes('version')));
            assert(result.errors.some(error => error.includes('author')));
            assert(result.errors.some(error => error.includes('status')));
        });

        it('should reject invalid status values', function() {
            const metadata = createRuleMetadata({
                name: 'Test Rule',
                description: 'Test description',
                status: 'invalid-status'
            });
            
            const result = validateMetadata(metadata);
            
            assert.strictEqual(result.isValid, false);
            assert(result.errors.some(error => error.includes('Invalid status')));
        });

        it('should reject non-array tags', function() {
            const metadata = createRuleMetadata({
                name: 'Test Rule',
                description: 'Test description'
            });
            metadata.tags = 'not-an-array';
            
            const result = validateMetadata(metadata);
            
            assert.strictEqual(result.isValid, false);
            assert(result.errors.some(error => error.includes('Tags must be an array')));
        });

        it('should reject invalid date formats', function() {
            const metadata = createRuleMetadata({
                name: 'Test Rule',
                description: 'Test description'
            });
            metadata.created_date = 'invalid-date';
            
            const result = validateMetadata(metadata);
            
            assert.strictEqual(result.isValid, false);
            assert(result.errors.some(error => error.includes('Invalid date format')));
        });
    });

    describe('createDesignDocument', function() {
        it('should create proper design document structure', function() {
            const ruleName = 'testRule';
            const validationFunction = function(newDoc, oldDoc, userCtx) {
                if (!newDoc.valid) throw({forbidden: 'Invalid'});
            };
            const metadata = createRuleMetadata({
                name: 'Test Rule',
                description: 'Test description'
            });
            
            const designDoc = createDesignDocument(ruleName, validationFunction, metadata);
            
            assert.strictEqual(designDoc._id, '_design/testRule');
            assert.strictEqual(designDoc.validate_doc_update, validationFunction);
            assert.deepStrictEqual(designDoc.rule_metadata, metadata);
        });

        it('should throw error for invalid metadata', function() {
            const ruleName = 'testRule';
            const validationFunction = function() {};
            const invalidMetadata = { name: 'Test' }; // Missing required fields
            
            assert.throws(() => {
                createDesignDocument(ruleName, validationFunction, invalidMetadata);
            }, /Invalid metadata/);
        });
    });

    describe('VALIDATOR_METADATA', function() {
        it('should contain metadata for all existing validators', function() {
            const expectedValidators = ['householdIncome', 'householdSize', 'numberOfDependents', 'interviewComplete'];
            
            expectedValidators.forEach(validator => {
                assert(VALIDATOR_METADATA[validator], `Missing metadata for ${validator}`);
                assert(VALIDATOR_METADATA[validator].name, `Missing name for ${validator}`);
                assert(VALIDATOR_METADATA[validator].description, `Missing description for ${validator}`);
                assert(VALIDATOR_METADATA[validator].version, `Missing version for ${validator}`);
                assert(Array.isArray(VALIDATOR_METADATA[validator].tags), `Invalid tags for ${validator}`);
            });
        });

        it('should have valid metadata for each validator', function() {
            Object.keys(VALIDATOR_METADATA).forEach(validatorName => {
                const metadata = createRuleMetadata(VALIDATOR_METADATA[validatorName]);
                const validation = validateMetadata(metadata);
                
                assert.strictEqual(validation.isValid, true, 
                    `Invalid metadata for ${validatorName}: ${validation.errors.join(', ')}`);
            });
        });

        it('should contain appropriate tags for each validator', function() {
            assert(VALIDATOR_METADATA.householdIncome.tags.includes('income'));
            assert(VALIDATOR_METADATA.householdSize.tags.includes('household'));
            assert(VALIDATOR_METADATA.numberOfDependents.tags.includes('dependents'));
            assert(VALIDATOR_METADATA.interviewComplete.tags.includes('interview'));
        });
    });
});
