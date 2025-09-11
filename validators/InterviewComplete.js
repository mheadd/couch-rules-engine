const { createRuleMetadata, VALIDATOR_METADATA } = require('../utils/rule-metadata');

// Validation rule for eligibility interview
exports.interviewComplete = function (doc) {
    if (String(doc.interviewComplete).length == 0) {
        throw ({
            forbidden: 'Interview must be completed.'
        });
    }
    return true;
};

// Export metadata for this validator
exports.metadata = createRuleMetadata(VALIDATOR_METADATA.interviewComplete);