const { createRuleMetadata, VALIDATOR_METADATA } = require('../utils/rule-metadata');

// Validation rule for number of dependents in household
exports.numberOfDependents = function (doc) {
    if (doc.numberOfDependents < 2) {
        throw ({
            forbidden: 'The number of dependents in the household must be 1 or more.'
        });
    }
    return true;
};

// Export metadata for this validator
exports.metadata = createRuleMetadata(VALIDATOR_METADATA.numberOfDependents);