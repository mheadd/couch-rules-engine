# Testing Guide for CouchDB Rules Engine

This document provides comprehensive guidance for creating tests when adding new validation rules to the CouchDB Rules Engine.

## Overview

Our testing infrastructure follows a modular approach with clear separation between unit tests (individual validator functions) and integration tests (CouchDB operations and rule execution). When a new validator is added, specific test files and updates are required to maintain comprehensive test coverage.

## Test Structure

```
test/
├── unit/
│   └── validators/          # Individual validator unit tests
│       ├── validatorName.test.js
│       └── ...
├── integration/            # CouchDB and rule execution tests
│   ├── couchdb-connection.test.js
│   └── rule-execution.test.js
├── helpers/               # Reusable test utilities
│   ├── couchdb-helper.js
│   ├── mock-data-generator.js
│   └── test-setup.js
└── fixtures/             # Sample data and expected results
    ├── sample-documents/
    └── expected-results/
```

## Adding Tests for a New Validator

When a new validation rule is created in the `validators/` directory, follow these steps:

### 1. Create Unit Test File

**Location**: `test/unit/validators/{validatorName}.test.js`

**Naming Convention**: 
- File name must match the validator module name exactly
- Use camelCase for the filename (e.g., `myNewValidator.test.js`)
- Test file extension must be `.test.js` for discovery by mocha

**Required Test Structure**:

```javascript
const assert = require('assert');
const validator = require('../../../validators/{validatorName}');

describe('{Validator Display Name}', function() {
    describe('Valid cases', function() {
        it('should accept valid {condition description}', function() {
            const validDoc = {
                // Complete document with all required fields
                name: "Test Person",
                // ... include all validator dependencies
                {targetField}: {validValue}
            };
            assert.strictEqual(validator.{validatorFunctionName}(validDoc), true);
        });

        it('should accept {edge case description}', function() {
            const edgeCaseDoc = {
                // Document testing boundary conditions
            };
            assert.strictEqual(validator.{validatorFunctionName}(edgeCaseDoc), true);
        });

        // Add more valid test cases as needed
    });

    describe('Invalid cases', function() {
        it('should reject invalid {condition description}', function() {
            const invalidDoc = {
                // Complete document with invalid target field
                name: "Test Person",
                // ... include all validator dependencies
                {targetField}: {invalidValue}
            };
            assert.strictEqual(validator.{validatorFunctionName}(invalidDoc), false);
        });

        it('should reject {boundary condition description}', function() {
            const boundaryDoc = {
                // Document testing failure at boundaries
            };
            assert.strictEqual(validator.{validatorFunctionName}(boundaryDoc), false);
        });

        // Add more invalid test cases as needed
    });
});
```

### 2. Update Mock Data Generator

**File**: `test/helpers/mock-data-generator.js`

Add support for your new validator in the existing methods:

```javascript
// In generateValidPerson method, add:
{newValidatorField}: {defaultValidValue}, // Add appropriate default

// In generateInvalidPerson method, add:
{newValidatorField}: {defaultInvalidValue}, // Add appropriate invalid default

// Add new specific generator methods:
/**
 * Generate document with specific {validatorName} scenarios
 */
static generateFor{ValidatorName}(scenario = 'valid') {
    const base = this.generateValidPerson();
    
    switch(scenario) {
        case 'valid':
            return { ...base, {targetField}: {validValue} };
        case 'invalid':
            return { ...base, {targetField}: {invalidValue} };
        case 'boundary':
            return { ...base, {targetField}: {boundaryValue} };
        default:
            return base;
    }
}
```

### 3. Update Integration Tests

**File**: `test/integration/rule-execution.test.js`

Add test cases that include your new validator in the rule execution scenarios:

```javascript
// In existing test cases, ensure documents include your validator field
// Add specific test case if your validator has unique integration behavior:

it('should handle {validatorName} validation in real-world scenario', async function() {
    // Test document that exercises your validator within CouchDB context
    const testDoc = dataGenerator.generateFor{ValidatorName}('boundary');
    
    // Test insertion and validation behavior
    // ... test implementation
});
```

### 4. Update Package.json Test Scripts

**File**: `package.json`

The existing glob patterns in the test scripts should automatically discover your new test file:

```json
{
  "scripts": {
    "test": "mocha \"test/**/*.test.js\"",
    "test:unit": "mocha \"test/unit/**/*.test.js\"",
    "test:validators": "mocha \"test/unit/validators/*.test.js\"",
    "test:integration": "mocha \"test/integration/**/*.test.js\""
  }
}
```

**No changes required** - your new validator test will be automatically included.

### 5. Add Sample Documents (Optional)

**Location**: `test/fixtures/sample-documents/`

If your validator requires complex document structures, add sample files:

```json
// sample_{validatorName}_valid.json
{
    "name": "Sample Valid Person",
    // ... all required fields
    "{targetField}": {validValue}
}

// sample_{validatorName}_invalid.json
{
    "name": "Sample Invalid Person", 
    // ... all required fields
    "{targetField}": {invalidValue}
}
```

## Boilerplate Test Template

Here's a complete boilerplate test file for a new validator:

```javascript
const assert = require('assert');
const validator = require('../../../validators/myNewValidator');

describe('My New Validator', function() {
    describe('Valid cases', function() {
        it('should accept valid my new field', function() {
            const validDoc = {
                name: "Valid Test Person",
                income: 20000,
                householdSize: 4,
                numberOfDependents: 2,
                interviewComplete: "true",
                myNewField: "validValue"
            };
            assert.strictEqual(validator.myNewValidator(validDoc), true);
        });

        it('should accept my new field at threshold', function() {
            const thresholdDoc = {
                name: "Threshold Test Person",
                income: 20000,
                householdSize: 4,
                numberOfDependents: 2,
                interviewComplete: "true",
                myNewField: "thresholdValue"
            };
            assert.strictEqual(validator.myNewValidator(thresholdDoc), true);
        });

        it('should accept various valid my new field values', function() {
            const edgeCaseDoc = {
                name: "Edge Case Test Person",
                income: 20000,
                householdSize: 4,
                numberOfDependents: 2,
                interviewComplete: "true",
                myNewField: "edgeCaseValidValue"
            };
            assert.strictEqual(validator.myNewValidator(edgeCaseDoc), true);
        });
    });

    describe('Invalid cases', function() {
        it('should reject invalid my new field', function() {
            const invalidDoc = {
                name: "Invalid Test Person",
                income: 20000,
                householdSize: 4,
                numberOfDependents: 2,
                interviewComplete: "true",
                myNewField: "invalidValue"
            };
            assert.strictEqual(validator.myNewValidator(invalidDoc), false);
        });

        it('should reject my new field below threshold', function() {
            const belowThresholdDoc = {
                name: "Below Threshold Test Person",
                income: 20000,
                householdSize: 4,
                numberOfDependents: 2,
                interviewComplete: "true",
                myNewField: "belowThresholdValue"
            };
            assert.strictEqual(validator.myNewValidator(belowThresholdDoc), false);
        });

        it('should reject my new field above threshold', function() {
            const aboveThresholdDoc = {
                name: "Above Threshold Test Person",
                income: 20000,
                householdSize: 4,
                numberOfDependents: 2,
                interviewComplete: "true",
                myNewField: "aboveThresholdValue"
            };
            assert.strictEqual(validator.myNewValidator(aboveThresholdDoc), false);
        });
    });
});
```

## Naming Conventions

### Files
- **Unit Test Files**: `{validatorName}.test.js` (camelCase, matches validator filename)
- **Validator Files**: `{validatorName}.js` (camelCase)
- **Sample Documents**: `sample_{validatorName}_{scenario}.json` (snake_case)

### Functions
- **Validator Function**: Should match the validator filename (e.g., `myNewValidator`)
- **Test Descriptions**: Use descriptive language that explains the business logic
- **Mock Generator Methods**: `generateFor{ValidatorName}()` (PascalCase for validator name)

### Test Document Structure
All test documents should include the complete set of fields required by existing validators to avoid cross-validation failures:

```javascript
const completeTestDoc = {
    name: "Required for document identity",
    income: 20000,                    // Required by householdIncome validator
    householdSize: 4,                 // Required by householdSize validator  
    numberOfDependents: 2,            // Required by numberOfDependents validator
    interviewComplete: "true",        // Required by interviewComplete validator
    // Add your new validator field here
    yourNewField: "appropriateValue"
};
```

## Test Coverage Guidelines

### Minimum Test Cases Required
1. **Valid scenarios** (at least 2-3 test cases):
   - Standard valid case
   - Boundary/threshold valid case
   - Edge case that should still pass

2. **Invalid scenarios** (at least 2-3 test cases):
   - Clear invalid case
   - Boundary/threshold invalid case
   - Edge case that should fail

### Best Practices
- **Use descriptive test names** that explain business logic, not just technical conditions
- **Include context in assertions** - use meaningful variable names
- **Test boundary conditions** - values at thresholds, empty strings, undefined, etc.
- **Maintain consistency** with existing validator test patterns
- **Keep tests focused** - one assertion per test when possible
- **Use complete documents** - include all fields required by other validators

## Running Your Tests

After creating your test files, verify they work correctly:

```bash
# Run all tests
npm test

# Run only your validator tests
npm run test:validators

# Run only unit tests
npm run test:unit

# Run with file watching for development
npm run test:watch
```

## Integration with CouchDB

Your validator will automatically be integrated into the CouchDB validation rules when the `couchLoader.js` script is run. The integration tests will verify that your validator works correctly within the CouchDB environment.

## Troubleshooting

### Common Issues
1. **Test not discovered**: Ensure filename ends with `.test.js`
2. **Validator not found**: Check the require path `../../../validators/{validatorName}`
3. **Integration test failures**: Ensure your test documents include all required fields
4. **Cross-validation conflicts**: Verify your test data doesn't violate existing validator rules

### Debug Steps
1. Run tests individually: `npx mocha test/unit/validators/yourValidator.test.js`
2. Check validator function export: `node -e "console.log(require('./validators/yourValidator'))"`
3. Verify test document structure against existing validators
4. Check CouchDB connection if integration tests fail

This guide ensures consistency across all validator tests and maintains the modular, discoverable test structure established in Phase 1, Task 1.1 of the project roadmap.