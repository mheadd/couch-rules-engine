const assert = require('assert');
const validator = require('../../../validators/householdSize');

describe('Household Size Validator', function() {
    describe('Valid cases', function() {
        it('should accept valid household size', function() {
            const validDoc = {
                name: "Sally Smith",
                income: 17500,
                householdSize: 3,
                numberOfDependents: 2,
                interviewComplete: "true"
            };
            assert.strictEqual(validator.householdSize(validDoc), true);
        });

        it('should accept household size at the threshold (3)', function() {
            const thresholdDoc = {
                name: "Test Person",
                income: 20000,
                householdSize: 3,
                numberOfDependents: 1,
                interviewComplete: "true"
            };
            assert.strictEqual(validator.householdSize(thresholdDoc), true);
        });

        it('should accept large household sizes', function() {
            const largeHouseholdDoc = {
                name: "Large Family",
                income: 24000,
                householdSize: 8,
                numberOfDependents: 6,
                interviewComplete: "true"
            };
            assert.strictEqual(validator.householdSize(largeHouseholdDoc), true);
        });
    });

    describe('Invalid cases', function() {
        it('should reject invalid household size', function() {
            const invalidDoc = {
                name: "Joe Johnson",
                income: 45000,
                householdSize: 2,
                numberOfDependents: 0,
                interviewComplete: ""
            };
            assert.throws(() => {
                validator.householdSize(invalidDoc);
            }, {
                forbidden: 'Household size must be greater than 2.'
            });
        });

        it('should reject household size of 1', function() {
            const singlePersonDoc = {
                name: "Single Person",
                income: 15000,
                householdSize: 1,
                numberOfDependents: 0,
                interviewComplete: "true"
            };
            assert.throws(() => {
                validator.householdSize(singlePersonDoc);
            }, {
                forbidden: 'Household size must be greater than 2.'
            });
        });

        it('should reject household size of 2', function() {
            const coupleDoc = {
                name: "Couple",
                income: 20000,
                householdSize: 2,
                numberOfDependents: 0,
                interviewComplete: "true"
            };
            assert.throws(() => {
                validator.householdSize(coupleDoc);
            }, {
                forbidden: 'Household size must be greater than 2.'
            });
        });
    });
});
