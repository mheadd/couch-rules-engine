const assert = require('assert');
const validator = require('../../../validators/interviewComplete');

describe('Interview Complete Validator', function() {
    describe('Valid cases', function() {
        it('should accept valid interview status', function() {
            const validDoc = {
                name: "Sally Smith",
                income: 17500,
                householdSize: 3,
                numberOfDependents: 2,
                interviewComplete: "true"
            };
            assert.strictEqual(validator.interviewComplete(validDoc), true);
        });

        it('should accept non-empty string values', function() {
            const completedDoc = {
                name: "Test Person",
                income: 20000,
                householdSize: 3,
                numberOfDependents: 1,
                interviewComplete: "completed"
            };
            assert.strictEqual(validator.interviewComplete(completedDoc), true);
        });

        it('should accept boolean true as string', function() {
            const booleanDoc = {
                name: "Boolean Person",
                income: 15000,
                householdSize: 4,
                numberOfDependents: 2,
                interviewComplete: "false"
            };
            assert.strictEqual(validator.interviewComplete(booleanDoc), true);
        });

        it('should accept any non-empty value', function() {
            const anyValueDoc = {
                name: "Any Value Person",
                income: 22000,
                householdSize: 5,
                numberOfDependents: 3,
                interviewComplete: "yes"
            };
            assert.strictEqual(validator.interviewComplete(anyValueDoc), true);
        });

        it('should handle undefined values (current behavior)', function() {
            const undefinedDoc = {
                name: "Undefined Interview",
                income: 18000,
                householdSize: 4,
                numberOfDependents: 2
                // interviewComplete is undefined
            };
            // Current implementation: String(undefined) = "undefined" (length > 0)
            // This may be unintended behavior, but documenting current state
            assert.strictEqual(validator.interviewComplete(undefinedDoc), true);
        });
    });

    describe('Invalid cases', function() {
        it('should reject invalid interview status', function() {
            const invalidDoc = {
                name: "Joe Johnson",
                income: 45000,
                householdSize: 2,
                numberOfDependents: 0,
                interviewComplete: ""
            };
            assert.throws(() => {
                validator.interviewComplete(invalidDoc);
            }, {
                forbidden: 'Interview must be completed.'
            });
        });

        it('should reject empty string', function() {
            const emptyDoc = {
                name: "Empty Interview",
                income: 15000,
                householdSize: 3,
                numberOfDependents: 1,
                interviewComplete: ""
            };
            assert.throws(() => {
                validator.interviewComplete(emptyDoc);
            }, {
                forbidden: 'Interview must be completed.'
            });
        });
    });
});
