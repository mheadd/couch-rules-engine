# AI Coding Agent Guidelines for CouchDB Rules Engine

This document provides comprehensive guidance for AI coding agents working on the CouchDB Rules Engine project. It includes project context, technical constraints, coding patterns, and implementation guidelines.

## Project Overview

### Current Architecture
The CouchDB Rules Engine is a prototype that leverages CouchDB's document validation functions to create a rules-based validation system. The system allows for:

- JavaScript-based validation rules stored as CouchDB design documents
- Document validation on insert/update operations
- Modular rule organization with individual validator files
- REST API interaction with CouchDB for rule management
- Docker-based development environment

### Core Components

```
couch-rules-engine/
├── config.js              # CouchDB connection configuration
├── index.js               # Main validator module exports
├── couchLoader.js         # Loads validation rules into CouchDB
├── couchUnloader.js       # Removes validation rules from CouchDB
├── setup.sh               # Docker setup script for development
├── validators/            # Individual validation rule modules
│   ├── householdIncome.js
│   ├── householdSize.js
│   ├── interviewComplete.js
│   └── numberOfDependents.js
├── test/                  # Test suite
│   └── validator-tests.js
├── samples/               # Sample test data
│   ├── sample_person_valid.json
│   ├── sample_person_invalid.json
│   └── sample_bulk.json
└── web/                   # Future: Web interface (to be implemented)
```

## Technical Constraints and Requirements

### Mandatory Constraints

1. **Frontend**: Vanilla JavaScript only - NO frameworks (React, Vue, Angular, etc.)
2. **Styling**: Pure CSS with CSS custom properties for theming
3. **Backend**: Direct CouchDB REST API integration - no middleware layers initially
4. **Testing**: Mocha test framework with modular test organization
5. **Dependencies**: Minimize external dependencies - prefer built-in Node.js capabilities
6. **Authentication**: Use HTTP Basic Auth with CouchDB's built-in authentication

### Code Style and Patterns

#### Validation Rule Pattern
Each validation rule should follow this structure:

```javascript
// validators/ruleName.js
exports.ruleName = function (doc) {
    // Validation logic here
    if (invalidCondition) {
        throw ({
            forbidden: 'Human-readable error message'
        });
    }
    return true;
};
```

#### CouchDB Integration Pattern
Use the built-in `fetch` API with proper authentication:

```javascript
// Create Basic Auth header
const auth = Buffer.from(`${username}:${password}`).toString('base64');

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
    },
    body: JSON.stringify(data)
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.catch(err => {
    console.log(`An error occurred: ${err.message}`);
});
```

#### Test Organization Pattern
```javascript
// test/validators/ruleName.test.js
const assert = require('assert');
const validator = require('../../validators/ruleName');

describe('RuleName Validator', function() {
    describe('Valid cases', function() {
        it('should accept valid input', function() {
            const doc = { /* valid test data */ };
            assert.strictEqual(validator.ruleName(doc), true);
        });
    });
    
    describe('Invalid cases', function() {
        it('should reject invalid input', function() {
            const doc = { /* invalid test data */ };
            assert.throws(() => {
                validator.ruleName(doc);
            }, /expected error message/);
        });
    });
});
```

## Implementation Guidelines

### Working with AI Agents - Essential Context

When implementing features, always provide this context:

1. **Reference the ROADMAP.md**: Check current development phase and objectives
2. **Existing Code Patterns**: Follow patterns established in existing validators
3. **CouchDB Limitations**: Remember that validation functions have constraints
4. **Testing Requirements**: Every feature needs corresponding tests
5. **Documentation**: Update relevant documentation files

### Phase-Based Development Approach

The project follows a structured roadmap with four phases:

#### Phase 1: Foundation & Testing Infrastructure (Current Priority)
- Restructure tests into modular files
- Enhance rule metadata structure
- Create basic web interface
- Improve error handling

#### Phase 2: Advanced Rule Management
- Complete CRUD operations in web interface
- Integrated testing panel
- Rule templates and generation
- Enhanced error reporting

#### Phase 3: Production Readiness
- Security and authentication
- Rule deployment pipeline
- Monitoring and analytics
- Performance optimization

#### Phase 4: Advanced Features
- Advanced rule types (scoring, graduated eligibility)
- Comprehensive API development
- Rule analytics and optimization
- Integration and replication

### CouchDB-Specific Considerations

#### Design Document Structure
Rules are stored as CouchDB design documents with this structure:

```json
{
  "_id": "_design/ruleName",
  "rule_metadata": {
    "name": "Human-readable rule name",
    "description": "Detailed description",
    "version": "1.0.0",
    "author": "author-name",
    "tags": ["category", "keywords"],
    "status": "active|draft|inactive",
    "created_date": "2025-01-01T00:00:00Z",
    "modified_date": "2025-01-01T00:00:00Z"
  },
  "validate_doc_update": "function(newDoc, oldDoc, userCtx) { /* validation code */ }"
}
```

#### CouchDB Validation Function Limitations
- Only the first validation error is reported
- Functions execute in unspecified order
- Limited access to external resources
- Must be pure JavaScript functions
- Error format: `throw({forbidden: "message"})`

### Development Workflow

#### Setting Up Development Environment
```bash
# Clone and setup
git clone <repository>
cd couch-rules-engine

# Run setup script (pulls CouchDB Docker image and configures environment)
./setup.sh

# Run tests
npm test

# Load rules into CouchDB
npm run load test admin password

# Unload rules from CouchDB
npm run unload test admin password
```

#### Adding New Validation Rules

1. **Create validator file**: `validators/newRule.js`
2. **Export validation function**: Follow existing pattern
3. **Update index.js**: Add new rule to exports
4. **Create test file**: `test/validators/newRule.test.js`
5. **Add sample data**: Create test documents in `samples/`
6. **Test thoroughly**: Run `npm test` and manual CouchDB tests

#### Web Interface Development (Future)

When implementing the web interface:

```
web/
├── index.html                 # Single-page application
├── css/
│   ├── main.css              # Core styles with CSS custom properties
│   └── components.css        # Reusable component styles
└── js/
    ├── app.js                # Main application logic
    ├── components/
    │   ├── RuleList.js       # Rule listing component
    │   ├── RuleEditor.js     # Rule editing component
    │   └── TestPanel.js      # Rule testing component
    └── utils/
        ├── couchdb-client.js # CouchDB API wrapper
        └── helpers.js        # Utility functions
```

## Testing Strategy

### Test Organization
```
test/
├── unit/
│   └── validators/           # Individual validator tests
├── integration/
│   ├── couchdb-connection.test.js
│   └── rule-execution.test.js
├── helpers/
│   ├── couchdb-helper.js     # Test utilities
│   ├── mock-data-generator.js
│   └── test-setup.js
└── fixtures/
    ├── sample-documents/
    └── expected-results/
```

### Test Scripts
```json
{
  "scripts": {
    "test": "mocha test/**/*.test.js",
    "test:validators": "mocha test/unit/validators/**/*.test.js",
    "test:integration": "mocha test/integration/**/*.test.js",
    "test:watch": "mocha test/**/*.test.js --watch"
  }
}
```

## Common Implementation Patterns

### Error Handling
```javascript
// CouchDB validation function error
throw({forbidden: 'Human-readable error message'});

// REST API error handling
.catch(err => {
    console.log(`An error occurred: ${err.message}`);
    // Handle gracefully, don't crash the application
});
```

### Async Operations
```javascript
// Use async/await for cleaner code
async function loadRule(ruleName) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to load rule:', error.message);
        throw error;
    }
}
```

### CSS Custom Properties for Theming
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --success-color: #16a34a;
    --error-color: #dc2626;
    --font-family: system-ui, -apple-system, sans-serif;
    --border-radius: 0.375rem;
    --spacing-unit: 0.25rem;
}
```

## Success Criteria and Acceptance Tests

### Phase 1 Success Criteria
- [ ] All existing tests pass with new modular structure
- [ ] `npm run test:validators` runs only validator tests
- [ ] Web interface displays existing rules with metadata
- [ ] Can create new rules through web interface
- [ ] All rules updated with enhanced metadata structure

### Code Quality Standards
- [ ] All functions have JSDoc comments
- [ ] No console.log statements in production code
- [ ] All async operations have proper error handling
- [ ] Tests achieve >90% code coverage
- [ ] No security vulnerabilities in dependencies (`npm audit`)

## Troubleshooting Common Issues

### CouchDB Connection Issues
- Verify Docker container is running: `docker ps`
- Check CouchDB status: `curl http://admin:password@localhost:5984/_up`
- Restart container: `docker restart couchdb-rules-engine`

### Authentication Problems
- Ensure credentials are properly encoded in Base64
- Verify CouchDB user has proper permissions
- Check for special characters in passwords that need escaping

### Validation Function Errors
- Test validation functions in isolation before deploying
- Remember CouchDB functions can't access external modules
- Use simple JavaScript only (ES5 compatible)

## Next Steps for Implementation

1. **Start with Phase 1 tasks** from the ROADMAP.md
2. **Focus on testing infrastructure** first
3. **Implement basic web interface** with rule listing
4. **Add enhanced metadata support** to existing rules
5. **Create rule generation tools** for easier development

## Resources and References

- [CouchDB Documentation](https://docs.couchdb.org/)
- [CouchDB Validation Functions](https://docs.couchdb.org/en/stable/ddocs/ddocs.html#validate-document-update-functions)
- [Mocha Testing Framework](https://mochajs.org/)
- [Project ROADMAP.md](./ROADMAP.md) - Detailed development phases
- [Project README.md](./README.md) - Setup and usage instructions

---

**Remember**: This project emphasizes simplicity, minimal dependencies, and leveraging CouchDB's native capabilities. Always prefer vanilla JavaScript solutions over external libraries, and maintain the modular, testable architecture established in the prototype.