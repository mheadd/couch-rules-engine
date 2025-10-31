const assert = require('assert');
const validator = require('../../../validators/{{functionName}}');

describe('{{ruleName}} Validator', function() {
    describe('Metadata', function() {
        it('should have valid metadata structure', function() {
            assert.strictEqual(typeof validator.metadata, 'object');
            assert.strictEqual(validator.metadata.name, '{{ruleName}}');
            assert.ok(validator.metadata.version);
            assert.ok(validator.metadata.author);
        });
    });
    
    describe('Valid cases', function() {
        const validCases = {{validTestCases}};
        
        validCases.forEach((testDoc, index) => {
            it(`should accept valid case ${index + 1}`, function() {
                assert.strictEqual(validator.{{functionName}}(testDoc), true);
            });
        });
    });
    
    describe('Invalid cases', function() {
        const invalidCases = {{invalidTestCases}};
        
        invalidCases.forEach((testDoc, index) => {
            it(`should reject invalid case ${index + 1}`, function() {
                assert.throws(() => {
                    validator.{{functionName}}(testDoc);
                }, /{{errorMessage}}/);
            });
        });
    });
});