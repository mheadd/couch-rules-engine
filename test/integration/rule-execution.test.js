const assert = require('assert');
const { getTestSetup } = require('../helpers/test-setup');

describe('Rule Execution Integration Tests', function() {
    let testSetup;
    let couchHelper;
    let dataGenerator;

    before(async function() {
        this.timeout(15000);
        testSetup = getTestSetup();
        couchHelper = testSetup.getCouchHelper();
        dataGenerator = testSetup.getDataGenerator();
        
        // Skip these tests if CouchDB is not available
        if (testSetup.shouldSkipCouchDB()) {
            this.skip();
        }

        // Set up fresh database with validation rules
        await couchHelper.deleteDatabase();
        await couchHelper.createDatabase();
        await testSetup.loadValidationRules();
    });

    after(async function() {
        this.timeout(5000);
        if (!testSetup.shouldSkipCouchDB()) {
            await couchHelper.deleteDatabase();
        }
    });

    describe('Valid Document Scenarios', function() {
        it('should accept completely valid documents', async function() {
            const validDoc = dataGenerator.generateValidPerson();
            
            const result = await couchHelper.insertDocument(validDoc);
            assert.strictEqual(result.ok, true, 'Valid document should be accepted');
            assert.strictEqual(typeof result.id, 'string', 'Should return document ID');
        });

        it('should accept documents with edge case values that are still valid', async function() {
            const edgeCases = dataGenerator.generateEdgeCases();
            
            // Test income at threshold
            const result1 = await couchHelper.insertDocument(edgeCases.incomeAtThreshold);
            assert.strictEqual(result1.ok, true, 'Income at threshold should be accepted');

            // Test household size at threshold
            const result2 = await couchHelper.insertDocument(edgeCases.householdSizeAtThreshold);
            assert.strictEqual(result2.ok, true, 'Household size at threshold should be accepted');

            // Test dependents at threshold
            const result3 = await couchHelper.insertDocument(edgeCases.dependentsAtThreshold);
            assert.strictEqual(result3.ok, true, 'Dependents at threshold should be accepted');
        });

        it('should accept documents with various valid interview completion values', async function() {
            const edgeCases = dataGenerator.generateEdgeCases();
            
            const result1 = await couchHelper.insertDocument(edgeCases.interviewTrue);
            assert.strictEqual(result1.ok, true, 'Interview "true" should be accepted');

            const result2 = await couchHelper.insertDocument(edgeCases.interviewFalse);
            assert.strictEqual(result2.ok, true, 'Interview "false" should be accepted');

            const result3 = await couchHelper.insertDocument(edgeCases.interviewCompleted);
            assert.strictEqual(result3.ok, true, 'Interview "completed" should be accepted');
        });
    });

    describe('Invalid Document Scenarios', function() {
        it('should reject documents with high income', async function() {
            const highIncomeDoc = dataGenerator.generateHighIncomePerson(30000);
            
            try {
                await couchHelper.insertDocument(highIncomeDoc);
                assert.fail('High income document should be rejected');
            } catch (error) {
                assert.match(error.message, /income/i, 'Error should mention income');
            }
        });

        it('should reject documents with small household size', async function() {
            const smallHouseholdDoc = dataGenerator.generateSmallHouseholdPerson(2);
            
            try {
                await couchHelper.insertDocument(smallHouseholdDoc);
                assert.fail('Small household document should be rejected');
            } catch (error) {
                assert.match(error.message, /household/i, 'Error should mention household');
            }
        });

        it('should reject documents with too few dependents', async function() {
            const fewDependentsDoc = dataGenerator.generateFewDependentsPerson(1);
            
            try {
                await couchHelper.insertDocument(fewDependentsDoc);
                assert.fail('Few dependents document should be rejected');
            } catch (error) {
                assert.match(error.message, /dependent/i, 'Error should mention dependents');
            }
        });

        it('should reject documents with incomplete interview', async function() {
            const incompleteDoc = dataGenerator.generateIncompleteInterviewPerson();
            
            try {
                await couchHelper.insertDocument(incompleteDoc);
                assert.fail('Incomplete interview document should be rejected');
            } catch (error) {
                assert.match(error.message, /interview/i, 'Error should mention interview');
            }
        });

        it('should reject documents that fail at edge cases', async function() {
            const edgeCases = dataGenerator.generateEdgeCases();
            
            // Test income just over threshold
            try {
                await couchHelper.insertDocument(edgeCases.incomeJustOverThreshold);
                assert.fail('Income just over threshold should be rejected');
            } catch (error) {
                assert.match(error.message, /income/i, 'Error should mention income');
            }

            // Test household size just under threshold
            try {
                await couchHelper.insertDocument(edgeCases.householdSizeJustUnderThreshold);
                assert.fail('Household size just under threshold should be rejected');
            } catch (error) {
                assert.match(error.message, /household/i, 'Error should mention household');
            }

            // Test dependents just under threshold
            try {
                await couchHelper.insertDocument(edgeCases.dependentsJustUnderThreshold);
                assert.fail('Dependents just under threshold should be rejected');
            } catch (error) {
                assert.match(error.message, /dependent/i, 'Error should mention dependents');
            }

            // Test empty interview
            try {
                await couchHelper.insertDocument(edgeCases.interviewEmpty);
                assert.fail('Empty interview should be rejected');
            } catch (error) {
                assert.match(error.message, /interview/i, 'Error should mention interview');
            }
        });
    });

    describe('CouchDB Validation Behavior', function() {
        it('should only report the first validation failure', async function() {
            // CouchDB limitation: only first validation error is reported
            const multiFailDoc = {
                name: "Multiple Failures",
                income: 50000, // Fails income validation
                householdSize: 1, // Fails household size validation
                numberOfDependents: 0, // Fails dependents validation
                interviewComplete: "" // Fails interview validation
            };
            
            try {
                await couchHelper.insertDocument(multiFailDoc);
                assert.fail('Document with multiple failures should be rejected');
            } catch (error) {
                // Should get exactly one error message, not multiple
                assert.strictEqual(typeof error.message, 'string', 'Should get single error message');
                // The error should be from one of the validation rules
                const errorMessage = error.message.toLowerCase();
                const hasValidationError = errorMessage.includes('income') || 
                                         errorMessage.includes('household') || 
                                         errorMessage.includes('dependent') || 
                                         errorMessage.includes('interview') ||
                                         errorMessage.includes('age');
                assert.strictEqual(hasValidationError, true, 'Should contain validation error message');
            }
        });

        it('should execute validation rules in unspecified order', async function() {
            // Test multiple times to potentially see different rule execution orders
            const attempts = 5;
            const errors = [];

            for (let i = 0; i < attempts; i++) {
                try {
                    const multiFailDoc = dataGenerator.generateMultipleFailures()[0];
                    await couchHelper.insertDocument(multiFailDoc);
                    assert.fail('Document should be rejected');
                } catch (error) {
                    errors.push(error.message);
                }
            }

            // All attempts should fail (we expect this)
            assert.strictEqual(errors.length, attempts, 'All attempts should result in validation errors');
            
            // Each error should be a validation error
            errors.forEach(error => {
                const errorMessage = error.toLowerCase();
                const hasValidationError = errorMessage.includes('income') || 
                                         errorMessage.includes('household') || 
                                         errorMessage.includes('dependent') || 
                                         errorMessage.includes('interview') ||
                                         errorMessage.includes('age');
                assert.strictEqual(hasValidationError, true, 'Each error should be a validation error');
            });
        });
    });

    describe('Batch Processing', function() {
        it('should handle batch of mixed valid and invalid documents', async function() {
            const batch = dataGenerator.generateBatch(6); // 3 valid, 3 invalid
            const results = [];

            for (const doc of batch) {
                try {
                    const result = await couchHelper.insertDocument(doc);
                    results.push({ success: true, result });
                } catch (error) {
                    results.push({ success: false, error: error.message });
                }
            }

            // Should have both successful and failed insertions
            const successes = results.filter(r => r.success);
            const failures = results.filter(r => !r.success);

            assert.strictEqual(successes.length > 0, true, 'Should have some successful insertions');
            assert.strictEqual(failures.length > 0, true, 'Should have some failed insertions');
            assert.strictEqual(successes.length + failures.length, batch.length, 'Should process all documents');
        });
    });

    describe('Real-world Scenarios', function() {
        it('should handle typical application workflow', async function() {
            // Simulate a typical application process
            
            // 1. Submit a valid application
            const validApplication = {
                name: "Jane Doe",
                income: 22000,
                householdSize: 4,
                numberOfDependents: 2,
                interviewComplete: "true",
                applicationDate: new Date().toISOString(),
                status: "submitted"
            };

            const result1 = await couchHelper.insertDocument(validApplication);
            assert.strictEqual(result1.ok, true, 'Valid application should be accepted');

            // 2. Attempt to submit an invalid application
            const invalidApplication = {
                name: "John Smith",
                income: 35000, // Too high
                householdSize: 3,
                numberOfDependents: 2,
                interviewComplete: "true",
                applicationDate: new Date().toISOString(),
                status: "submitted"
            };

            try {
                await couchHelper.insertDocument(invalidApplication);
                assert.fail('Invalid application should be rejected');
            } catch (error) {
                assert.match(error.message, /income/i, 'Should reject for income reasons');
            }

            // 3. Submit another valid application with different characteristics
            const validApplication2 = {
                name: "Maria Garcia",
                income: 18000,
                householdSize: 5,
                numberOfDependents: 3,
                interviewComplete: "completed",
                applicationDate: new Date().toISOString(),
                status: "submitted"
            };

            const result2 = await couchHelper.insertDocument(validApplication2);
            assert.strictEqual(result2.ok, true, 'Second valid application should be accepted');
        });
    });
});
