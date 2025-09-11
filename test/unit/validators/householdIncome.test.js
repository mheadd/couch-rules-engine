const assert = require('assert');
const validator = require('../../../validators/householdIncome');

describe('Household Income Validator', function() {
    describe('Valid cases', function() {
        it('should accept valid household income level', function() {
            const validDoc = {
                name: "Sally Smith",
                income: 17500,
                householdSize: 3,
                numberOfDependents: 2,
                interviewComplete: "true"
            };
            assert.strictEqual(validator.householdIncome(validDoc), true);
        });

        it('should accept income at the threshold (25000)', function() {
            const thresholdDoc = {
                name: "Test Person",
                income: 25000,
                householdSize: 2,
                numberOfDependents: 1,
                interviewComplete: "true"
            };
            assert.strictEqual(validator.householdIncome(thresholdDoc), true);
        });

        it('should accept low income values', function() {
            const lowIncomeDoc = {
                name: "Low Income Person",
                income: 1000,
                householdSize: 1,
                numberOfDependents: 0,
                interviewComplete: "true"
            };
            assert.strictEqual(validator.householdIncome(lowIncomeDoc), true);
        });
    });

    describe('Invalid cases', function() {
        it('should reject invalid household income level', function() {
            const invalidDoc = {
                name: "Joe Johnson",
                income: 45000,
                householdSize: 2,
                numberOfDependents: 0,
                interviewComplete: ""
            };
            assert.throws(() => {
                validator.householdIncome(invalidDoc);
            }, {
                forbidden: 'Income must be lower than $25,000'
            });
        });

        it('should reject income above threshold', function() {
            const highIncomeDoc = {
                name: "High Earner",
                income: 25001,
                householdSize: 4,
                numberOfDependents: 2,
                interviewComplete: "true"
            };
            assert.throws(() => {
                validator.householdIncome(highIncomeDoc);
            }, {
                forbidden: 'Income must be lower than $25,000'
            });
        });
    });
});
