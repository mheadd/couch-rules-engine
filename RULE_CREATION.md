# Rule Creation Guide

This guide explains how to create new validation rules for the CouchDB Rules Engine using the interactive rule generator tool.

## Overview

The Rule Generator is an interactive CLI tool that helps you create:
- Properly formatted validator functions
- Comprehensive test files
- Metadata conforming to the METADATA_GUIDE.md
- Automatic integration with the existing codebase

## Quick Start

```bash
npm run create-rule
```

Follow the interactive prompts to define your new rule.

## Prerequisites

- Node.js installed
- CouchDB instance running (for testing)
- Familiarity with JavaScript validation logic
- Understanding of the [METADATA_GUIDE.md](METADATA_GUIDE.md)

## Interactive Workflow

### Step 1: Run the Generator

```bash
npm run create-rule
```

### Step 2: Answer the Prompts

The generator will ask you for the following information:

#### 1. Rule Name
```
Rule name (e.g., "Household Income"): 
```
- Provide a human-readable name for your rule
- Example: "Age Verification", "Income Threshold", "Household Size"
- This will be automatically converted to camelCase for the function name

#### 2. Description
```
Description: 
```
- Explain what the rule validates
- Be specific and clear
- Example: "Validates that household income does not exceed $25,000 threshold for program eligibility"

#### 3. Author
```
Author: 
```
- Your name or organization
- Example: "CouchDB Rules Engine", "Jane Developer"

#### 4. Tags
```
Tags (comma-separated): 
```
- Keywords for categorizing and searching rules
- Separate with commas
- Example: "income, eligibility, financial, threshold"

#### 5. Validation Logic
```
Enter validation logic (JavaScript expression):
Example: doc.age >= 18 && doc.age <= 65
Logic: 
```
- Write the JavaScript expression that must be TRUE for valid documents
- Use `doc.` to reference document properties
- Common patterns:
  - `doc.fieldName > value`
  - `doc.fieldName >= min && doc.fieldName <= max`
  - `doc.arrayField && doc.arrayField.length > 0`
  - `doc.status === 'approved'`

#### 6. Error Message
```
Error message: 
```
- Message shown when validation fails
- Be clear and actionable
- Example: "Age must be between 18 and 65"

#### 7. Valid Test Case
```
Valid test case example:
Valid document (JSON): 
```
- Provide a JSON object that SHOULD pass validation
- Example: `{"age": 25, "name": "John Doe"}`

#### 8. Invalid Test Case
```
Invalid test case example:
Invalid document (JSON): 
```
- Provide a JSON object that SHOULD fail validation
- Example: `{"age": 15, "name": "Jane Doe"}`

### Step 3: Review Generated Files

The generator creates three files:

1. **Validator**: `validators/yourRuleName.js`
   - Contains the validation function
   - Includes metadata
   - Exports the validator function

2. **Tests**: `test/unit/validators/yourRuleName.test.js`
   - Unit tests for your rule
   - Tests metadata structure
   - Tests valid and invalid cases

3. **Updated**: `index.js`
   - Automatically adds your rule to exports

### Step 4: Test Your Rule

Run the test suite to verify your new rule:

```bash
npm test
```

Or test just your new validator:

```bash
npm run test:validators -- --grep "Your Rule Name"
```

### Step 5: Load to CouchDB

Once tests pass, load your rule to CouchDB:

```bash
npm run load rules_db admin password
```

Or using Docker Compose:

```bash
docker-compose restart initializer
```

## Example Walkthrough

Let's create an "Age Verification" rule:

### Input
```
Rule name: Age Verification
Description: Validates that applicant age is between 18 and 65 for program eligibility
Author: CouchDB Rules Engine
Tags: age, eligibility, compliance, demographic
Logic: doc.age >= 18 && doc.age <= 65
Error message: Applicant age must be between 18 and 65 years
Valid document: {"age": 30, "name": "John Smith"}
Invalid document: {"age": 15, "name": "Jane Doe"}
```

### Generated Files

**validators/ageVerification.js**
```javascript
/**
 * Validates that applicant age is between 18 and 65 for program eligibility
 * 
 * @author CouchDB Rules Engine
 * @version 1.0.0
 */

exports.metadata = {
    "name": "Age Verification",
    "description": "Validates that applicant age is between 18 and 65 for program eligibility",
    "version": "1.0.0",
    "author": "CouchDB Rules Engine",
    "tags": ["age", "eligibility", "compliance", "demographic"],
    "status": "draft",
    "created_date": "2025-10-31T12:00:00.000Z",
    "modified_date": "2025-10-31T12:00:00.000Z"
};

exports.ageVerification = function (doc) {
    if (!(doc.age >= 18 && doc.age <= 65)) {
        throw ({
            forbidden: 'Applicant age must be between 18 and 65 years'
        });
    }
    
    return true;
};
```

**test/unit/validators/ageVerification.test.js**
```javascript
const assert = require('assert');
const validator = require('../../../validators/ageVerification');

describe('Age Verification Validator', function() {
    describe('Metadata', function() {
        it('should have valid metadata structure', function() {
            assert.strictEqual(typeof validator.metadata, 'object');
            assert.strictEqual(validator.metadata.name, 'Age Verification');
            assert.ok(validator.metadata.version);
            assert.ok(validator.metadata.author);
        });
    });
    
    describe('Valid cases', function() {
        it('should accept valid case 1', function() {
            const doc = {"age": 30, "name": "John Smith"};
            assert.strictEqual(validator.ageVerification(doc), true);
        });
    });
    
    describe('Invalid cases', function() {
        it('should reject invalid case 1', function() {
            const doc = {"age": 15, "name": "Jane Doe"};
            assert.throws(() => {
                validator.ageVerification(doc);
            }, /Applicant age must be between 18 and 65 years/);
        });
    });
});
```

## Validation Logic Patterns

### Numeric Comparisons
```javascript
// Greater than
doc.income > 25000

// Range check
doc.age >= 18 && doc.age <= 65

// Less than or equal
doc.dependents <= 10
```

### String Validations
```javascript
// Non-empty string
doc.status && doc.status.length > 0

// Specific value
doc.status === 'approved'

// Pattern matching
/^\d{5}$/.test(doc.zipCode)
```

### Array Validations
```javascript
// Array exists and not empty
doc.items && doc.items.length > 0

// Array length check
doc.dependents && doc.dependents.length >= 2

// Contains specific value
doc.tags && doc.tags.includes('eligible')
```

### Complex Logic
```javascript
// Multiple conditions
doc.income < 25000 && doc.householdSize >= 3

// Conditional validation
(!doc.hasChildren || (doc.hasChildren && doc.childCareExpenses > 0))

// Nested properties
doc.address && doc.address.state === 'PA'
```

## Best Practices

### 1. Clear Naming
- Use descriptive rule names
- Follow camelCase for function names
- Make purpose obvious

### 2. Comprehensive Descriptions
- Explain what is being validated
- Include threshold values
- Mention program or context

### 3. Specific Error Messages
- State exactly what failed
- Include expected values
- Be actionable

### 4. Complete Test Coverage
- Test boundary conditions
- Test valid edge cases
- Test invalid edge cases
- Consider null/undefined values

### 5. Meaningful Tags
- Use consistent terminology
- Include domain keywords
- Aid in rule discovery

## Troubleshooting

### Generator Errors

**Problem**: "Module not found" error
```
Solution: Ensure you're in the project root directory
cd /path/to/couch-rules-engine
npm run create-rule
```

**Problem**: Invalid JSON in test cases
```
Solution: Use proper JSON formatting
Valid: {"age": 25}
Invalid: {age: 25} or {'age': 25}
```

### Test Failures

**Problem**: Test fails immediately after creation
```
Solution: Verify your validation logic matches test cases
- Check that valid case satisfies the logic
- Check that invalid case violates the logic
```

**Problem**: Metadata test fails
```
Solution: Ensure all required metadata fields are present
- name, description, version, author, tags, status
```

### Loading to CouchDB

**Problem**: Rule doesn't appear in CouchDB
```
Solution: Check that the rule is exported in index.js
- Verify require statement is present
- Verify export is in module.exports object
```

## Advanced Usage

### Adding Multiple Test Cases

After generation, you can manually add more test cases to the test file:

```javascript
describe('Valid cases', function() {
    const validCases = [
        {"age": 18, "name": "Min Age"},
        {"age": 30, "name": "Middle Age"},
        {"age": 65, "name": "Max Age"}
    ];
    
    validCases.forEach((testDoc, index) => {
        it(`should accept valid case ${index + 1}`, function() {
            assert.strictEqual(validator.yourRule(testDoc), true);
        });
    });
});
```

### Updating Metadata

To update metadata after creation, edit the validator file:

```javascript
exports.metadata = {
    // ... existing fields ...
    "status": "active",  // Change from "draft" to "active"
    "modified_date": new Date().toISOString(),
    "change_notes": "Updated validation threshold"
};
```

### Complex Validation Logic

For complex rules, you can edit the generated validator to add helper functions:

```javascript
exports.yourRule = function (doc) {
    // Helper function
    function isValidAge(age) {
        return age >= 18 && age <= 65;
    }
    
    // Helper function
    function hasRequiredFields(doc) {
        return doc.age !== undefined && doc.name !== undefined;
    }
    
    // Validation logic using helpers
    if (!hasRequiredFields(doc)) {
        throw ({ forbidden: 'Missing required fields' });
    }
    
    if (!isValidAge(doc.age)) {
        throw ({ forbidden: 'Age must be between 18 and 65' });
    }
    
    return true;
};
```

## Integration with Workflow

### 1. Create Rule
```bash
npm run create-rule
```

### 2. Test Locally
```bash
npm test
```

### 3. Load to Development CouchDB
```bash
npm run load rules_db admin password
```

### 4. Test with Real Documents
```bash
curl -X POST http://admin:password@localhost:5984/rules_db \
  -d '{"age": 25, "name": "Test User"}' \
  -H 'Content-Type: application/json'
```

### 5. Update Status to Active
Edit the validator file and change status from "draft" to "active"

### 6. Deploy to Production
```bash
docker-compose up --build -d
```

## Related Documentation

- **[METADATA_GUIDE.md](METADATA_GUIDE.md)** - Metadata structure and requirements
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing best practices
- **[ROADMAP.md](ROADMAP.md)** - Future enhancements for rule creation
- **[README.md](README.md)** - General project documentation

## Future Enhancements

The rule generator may be enhanced with:
- Batch/non-interactive mode for AI assistants
- Rule templates for common patterns
- Automatic CRUD operation generation
- Integration with web interface
- Rule validation and linting
- Dependency checking between rules

## Support

For issues or questions about rule creation:
1. Check existing validators in `validators/` for examples
2. Review test patterns in `test/unit/validators/`
3. Consult the METADATA_GUIDE.md for metadata requirements
4. Review TESTING_GUIDE.md for test patterns
