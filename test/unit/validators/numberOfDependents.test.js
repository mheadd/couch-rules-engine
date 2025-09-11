const assert = require('assert');
const validator = require('../../../validators/numberOfDependents');

describe('Number of Dependents Validator', function() {
    describe('Valid cases', function() {
        it('should accept valid number of dependents', function() {
            const validDoc = {
                name: "Sally Smith",
                income: 17500,
                householdSize: 3,
                numberOfDependents: 2,
                interviewComplete: "true"
            };
            assert.strictEqual(validator.numberOfDependents(validDoc), true);
        });

        it('should accept number of dependents at the threshold (2)', function() {
            const thresholdDoc = {
                name: "Test Person",
                income: 20000,
                householdSize: 3,
                numberOfDependents: 2,
                interviewComplete: "true"
            };
            assert.strictEqual(validator.numberOfDependents(thresholdDoc), true);
        });

        it('should accept higher numbers of dependents', function() {
            const manyDependentsDoc = {
                name: "Large Family",
                income: 24000,
                householdSize: 8,
                numberOfDependents: 6,
                interviewComplete: "true"
            };
            assert.strictEqual(validator.numberOfDependents(manyDependentsDoc), true);
        });
    });

    describe('Invalid cases', function() {
        it('should reject invalid number of dependents', function() {
            const invalidDoc = {
                name: "Joe Johnson",
                income: 45000,
                householdSize: 2,
                numberOfDependents: 0,
                interviewComplete: ""
            };
            assert.throws(() => {
                validator.numberOfDependents(invalidDoc);
            }, {
                forbidden: 'The number of dependents in the household must be 1 or more.'
            });
        });

        it('should reject zero dependents', function() {
            const zeroDependentsDoc = {
                name: "No Dependents",
                income: 15000,
                householdSize: 3,
                numberOfDependents: 0,
                interviewComplete: "true"
            };
            assert.throws(() => {
                validator.numberOfDependents(zeroDependentsDoc);
            }, {
                forbidden: 'The number of dependents in the household must be 1 or more.'
            });
        });

        it('should reject one dependent', function() {
            const oneDependentDoc = {
                name: "One Dependent",
                income: 20000,
                householdSize: 3,
                numberOfDependents: 1,
                interviewComplete: "true"
            };
            assert.throws(() => {
                validator.numberOfDependents(oneDependentDoc);
            }, {
                forbidden: 'The number of dependents in the household must be 1 or more.'
            });
        });
    });
});
