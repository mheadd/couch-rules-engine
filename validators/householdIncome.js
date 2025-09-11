const { createRuleMetadata, VALIDATOR_METADATA } = require('../utils/rule-metadata');

// Validation rule for household income
exports.householdIncome = function (doc) {
    if (doc.income > 25000) {
        throw ({
            forbidden: 'Income must be lower than $25,000'
        });
    }
    return true;
};

// Export metadata for this validator
exports.metadata = createRuleMetadata(VALIDATOR_METADATA.householdIncome);