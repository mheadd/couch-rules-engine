const assert = require('assert');
const householdIncome = require('../../../validators/householdIncome');
const householdSize = require('../../../validators/householdSize');
const numberOfDependents = require('../../../validators/numberOfDependents');
const interviewComplete = require('../../../validators/interviewComplete');
const { validateMetadata } = require('../../../utils/rule-metadata');

describe('Validator Metadata Export', function() {
    describe('All validators', function() {
        const validators = {
            householdIncome,
            householdSize,
            numberOfDependents,
            interviewComplete
        };

        Object.keys(validators).forEach(validatorName => {
            describe(`${validatorName} validator`, function() {
                it('should export metadata', function() {
                    const validator = validators[validatorName];
                    assert(validator.metadata, `${validatorName} should export metadata`);
                    assert(typeof validator.metadata === 'object', `${validatorName} metadata should be an object`);
                });

                it('should have valid metadata structure', function() {
                    const validator = validators[validatorName];
                    const validation = validateMetadata(validator.metadata);
                    
                    assert.strictEqual(validation.isValid, true, 
                        `${validatorName} metadata is invalid: ${validation.errors.join(', ')}`);
                });

                it('should have required metadata fields', function() {
                    const validator = validators[validatorName];
                    const metadata = validator.metadata;
                    
                    assert(metadata.name, `${validatorName} should have name`);
                    assert(metadata.description, `${validatorName} should have description`);
                    assert(metadata.version, `${validatorName} should have version`);
                    assert(metadata.author, `${validatorName} should have author`);
                    assert(metadata.status, `${validatorName} should have status`);
                    assert(Array.isArray(metadata.tags), `${validatorName} should have tags array`);
                    assert(metadata.created_date, `${validatorName} should have created_date`);
                    assert(metadata.modified_date, `${validatorName} should have modified_date`);
                });

                it('should still export the validation function', function() {
                    const validator = validators[validatorName];
                    const functionName = validatorName;
                    
                    assert(validator[functionName], `${validatorName} should export validation function`);
                    assert(typeof validator[functionName] === 'function', 
                        `${validatorName} validation function should be a function`);
                });
            });
        });
    });

    describe('Metadata content validation', function() {
        it('householdIncome should have income-related metadata', function() {
            const metadata = householdIncome.metadata;
            assert(metadata.name.toLowerCase().includes('income'));
            assert(metadata.description.toLowerCase().includes('income'));
            assert(metadata.tags.includes('income'));
        });

        it('householdSize should have household-related metadata', function() {
            const metadata = householdSize.metadata;
            assert(metadata.name.toLowerCase().includes('household'));
            assert(metadata.description.toLowerCase().includes('household'));
            assert(metadata.tags.includes('household'));
        });

        it('numberOfDependents should have dependents-related metadata', function() {
            const metadata = numberOfDependents.metadata;
            assert(metadata.name.toLowerCase().includes('dependents'));
            assert(metadata.description.toLowerCase().includes('dependents'));
            assert(metadata.tags.includes('dependents'));
        });

        it('interviewComplete should have interview-related metadata', function() {
            const metadata = interviewComplete.metadata;
            assert(metadata.name.toLowerCase().includes('interview'));
            assert(metadata.description.toLowerCase().includes('interview'));
            assert(metadata.tags.includes('interview'));
        });
    });

    describe('Metadata consistency', function() {
        it('all validators should have consistent author', function() {
            const validators = [householdIncome, householdSize, numberOfDependents, interviewComplete];
            const expectedAuthor = 'CouchDB Rules Engine';
            
            validators.forEach((validator, index) => {
                const validatorNames = ['householdIncome', 'householdSize', 'numberOfDependents', 'interviewComplete'];
                assert.strictEqual(validator.metadata.author, expectedAuthor, 
                    `${validatorNames[index]} should have consistent author`);
            });
        });

        it('all validators should have active status', function() {
            const validators = [householdIncome, householdSize, numberOfDependents, interviewComplete];
            const expectedStatus = 'active';
            
            validators.forEach((validator, index) => {
                const validatorNames = ['householdIncome', 'householdSize', 'numberOfDependents', 'interviewComplete'];
                assert.strictEqual(validator.metadata.status, expectedStatus, 
                    `${validatorNames[index]} should have active status`);
            });
        });

        it('all validators should have semantic version', function() {
            const validators = [householdIncome, householdSize, numberOfDependents, interviewComplete];
            const semverRegex = /^\d+\.\d+\.\d+/;
            
            validators.forEach((validator, index) => {
                const validatorNames = ['householdIncome', 'householdSize', 'numberOfDependents', 'interviewComplete'];
                assert(semverRegex.test(validator.metadata.version), 
                    `${validatorNames[index]} should have semantic version`);
            });
        });

        it('all validators should have eligibility-related tags', function() {
            const validators = [householdIncome, householdSize, numberOfDependents, interviewComplete];
            
            validators.forEach((validator, index) => {
                const validatorNames = ['householdIncome', 'householdSize', 'numberOfDependents', 'interviewComplete'];
                assert(validator.metadata.tags.includes('eligibility'), 
                    `${validatorNames[index]} should include eligibility tag`);
            });
        });
    });
});
