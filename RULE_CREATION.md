# Rule Creation Guide

This guide explains how to create new validation rules for the CouchDB Rules Engine using the interactive rule generator tool.

## Quick Start

```bash
npm run create-rule
```

Then follow the interactive prompts to define your new rule.

## Example: Creating an Optional Field Rule

```
Rule name: Age Verification
Description: Validates that age is between 18 and 65
Author: Mark Headd
Tags: eligibility, age, compliance
Field name to validate: age
Is this field required on all documents? (y/n): n  ← Creates optional field validation
Logic: doc.age >= 18 && doc.age <= 65
Error message: Age must be between 18 and 65
Valid document (JSON): {"age": 25, "name": "John"}
Invalid document (JSON): {"age": 15, "name": "Jane"}
```

## Example: Creating a Required Field Rule

```
Rule name: Application Type
Description: Validates application type is valid
Author: Mark Headd
Tags: eligibility, application, required
Field name to validate: applicationType
Is this field required on all documents? (y/n): y  ← Validates all documents
Logic: doc.applicationType === 'standard' || doc.applicationType === 'expedited'
Error message: Application type must be standard or expedited
Valid document (JSON): {"applicationType": "standard"}
Invalid document (JSON): {"applicationType": "invalid"}
Add this field to base mock data generator? (y/n): y
  Valid value: standard
  Invalid value: invalid
```

## Understanding Optional vs Required Fields

### The Critical Difference

**Optional fields** only validate documents that contain the field:
```javascript
// Generated code for optional field (answer 'n')
if (doc.age !== undefined && !(doc.age >= 18 && doc.age <= 65)) {
    throw ({ forbidden: 'Age must be between 18 and 65' });
}
```

**Required fields** validate all documents:
```javascript
// Generated code for required field (answer 'y')
if (!(doc.applicationType === 'standard' || doc.applicationType === 'expedited')) {
    throw ({ forbidden: 'Application type must be standard or expedited' });
}
```

### When to Use Each

**Use Optional Fields When:**
- The field is only relevant for certain document types
- Not all documents need this validation
- Field may be added later in document lifecycle

**Use Required Fields When:**
- Every document must have this field
- Core business requirement
- Essential for all documents in the database

### Why This Matters

CouchDB validation rules execute for **every** document insert/update. Without proper optional field handling:
```javascript
// ❌ WRONG - Rejects documents without 'age' field
if (!(doc.age >= 18 && doc.age <= 65)) {
    throw ({ forbidden: 'Age must be between 18 and 65' });
}
// Document { "name": "John", "income": 20000 } will be REJECTED!
```

With proper optional field handling:
```javascript
// ✅ CORRECT - Only validates if 'age' exists
if (doc.age !== undefined && !(doc.age >= 18 && doc.age <= 65)) {
    throw ({ forbidden: 'Age must be between 18 and 65' });
}
// Document { "name": "John", "income": 20000 } will be ACCEPTED!
```

## Interactive Prompts Explained

### 1. Rule Name
```
Rule name (e.g., "Household Income"): 
```
- Human-readable name for your rule
- Automatically converted to camelCase for function name
- Example: "Age Verification" → `ageVerification`

### 2. Description
```
Description: 
```
- Explain what the rule validates
- Example: "Validates that household income does not exceed $25,000 threshold"

### 3. Author
```
Author: 
```
- Your name or organization
- Example: "Mark Headd", "CouchDB Rules Team"

### 4. Tags
```
Tags (comma-separated): 
```
- Keywords for categorizing rules
- Example: "income, eligibility, financial, threshold"

### 5. Field Name (NEW)
```
Field name to validate (e.g., "age", "income"): 
```
- The document field this rule validates
- Used to generate proper optional field checks

### 6. Required or Optional (NEW)
```
Is this field required on all documents? (y/n): 
```
- **Answer 'n' (optional):** Only validates documents with this field
- **Answer 'y' (required):** Validates all documents, field must exist
- **When in doubt, choose optional ('n')**

### 7. Validation Logic
```
Logic: 
```
- JavaScript expression that must be TRUE for valid documents
- Use `doc.fieldName` to reference document properties

**Common Patterns:**
```javascript
// Range validation
doc.age >= 18 && doc.age <= 65

// Enum validation
doc.status === 'approved' || doc.status === 'pending'

// Minimum value
doc.income >= 0

// Pattern matching
/^[A-Z]{2}\d{6}$/.test(doc.code)
```

### 8. Error Message
```
Error message: 
```
- Clear message shown when validation fails
- Example: "Age must be between 18 and 65"

### 9. Mock Data (for required fields only)
If field is required, you'll be asked:
```
Add this field to base mock data generator? (y/n): 
  Valid value: 
  Invalid value: 
```
This updates test data to include your new field.

### 10. Test Cases
```
Valid document (JSON): 
Invalid document (JSON): 
```
- Provide sample JSON objects for testing
- Valid case should pass validation
- Invalid case should fail validation

## What Gets Generated

The generator creates:

1. **`validators/ruleName.js`** - Validator with metadata and function
2. **`test/unit/validators/ruleName.test.js`** - Complete test suite
3. **`index.js`** - Automatically updated with your new rule

## After Generation

### 1. Run Tests
```bash
npm test
```

All tests should pass including your new rule.

### 2. Load to CouchDB
```bash
npm run load <database> <username> <password>
```

Example:
```bash
npm run load rules_db admin mypassword
```

## Validation Patterns Quick Reference

```javascript
// Range validation
doc.age >= 18 && doc.age <= 65

// Enum validation  
doc.status === 'approved' || doc.status === 'pending'

// Minimum value
doc.income >= 0

// Pattern matching
/^[A-Z]{2}\d{6}$/.test(doc.code)

// Non-empty string
doc.name && doc.name.trim().length > 0

// Array not empty
doc.items && doc.items.length > 0
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Invalid JSON in test cases | Use proper JSON: `{"age": 25}` not `{age: 25}` |
| Tests fail after creation | Verify validation logic matches test cases |
| Rule not in CouchDB | Check rule is exported in `index.js` |
| Module not found error | Run from project root directory |

## Best Practices

- **Use optional fields by default** - Only make fields required when absolutely necessary
- **Clear error messages** - State what failed and expected values
- **Test boundary conditions** - Test min/max values and edge cases
- **Meaningful tags** - Use consistent domain keywords
- **Review generated code** - Check that optional/required logic is correct

## Adding More Test Cases

Edit the generated test file to add additional cases:

```javascript
const validCases = [
    {"age": 18, "name": "Min Age"},
    {"age": 30, "name": "Middle Age"},
    {"age": 65, "name": "Max Age"}
];
```

## Workflow

1. `npm run create-rule` - Create rule
2. `npm test` - Verify tests pass
3. `npm run load <db> <user> <pass>` - Load to CouchDB
4. Update status to "active" when ready for production

## Related Documentation

- [METADATA_GUIDE.md](METADATA_GUIDE.md) - Metadata requirements
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing strategies
- [README.md](README.md) - General project overview
