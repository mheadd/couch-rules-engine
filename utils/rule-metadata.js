/**
 * Rule Metadata Schema and Helper Functions
 * Provides utilities for creating and managing rule metadata according to roadmap specifications
 */

/**
 * Creates a standardized metadata object for validation rules
 * @param {Object} options - Metadata configuration options
 * @param {string} options.name - Human-readable rule name
 * @param {string} options.description - Detailed description of rule purpose
 * @param {string} [options.version='1.0.0'] - Semantic version
 * @param {string} [options.author='CouchDB Rules Engine'] - Rule author
 * @param {string[]} [options.tags=[]] - Category and keyword tags
 * @param {string} [options.status='active'] - Rule status (active|draft|inactive)
 * @param {string} [options.changeNotes='Initial implementation'] - Description of last change
 * @returns {Object} Standardized metadata object
 */
function createRuleMetadata(options) {
    const now = new Date().toISOString();
    
    return {
        name: options.name,
        description: options.description,
        version: options.version || '1.0.0',
        author: options.author || 'CouchDB Rules Engine',
        tags: options.tags || [],
        status: options.status || 'active',
        created_date: now,
        modified_date: now,
        change_notes: options.changeNotes || 'Initial implementation'
    };
}

/**
 * Updates existing metadata with new information
 * @param {Object} existingMetadata - Current metadata object
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated metadata object
 */
function updateRuleMetadata(existingMetadata, updates) {
    const updatedMetadata = {
        ...existingMetadata,
        ...updates,
        modified_date: new Date().toISOString()
    };
    
    // If version is being updated, ensure it's a semantic version
    if (updates.version && !isValidSemanticVersion(updates.version)) {
        throw new Error(`Invalid semantic version: ${updates.version}`);
    }
    
    return updatedMetadata;
}

/**
 * Validates a semantic version string
 * @param {string} version - Version string to validate
 * @returns {boolean} True if valid semantic version
 */
function isValidSemanticVersion(version) {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(-[a-zA-Z0-9\-\.]+)?(\+[a-zA-Z0-9\-\.]+)?$/;
    return semverRegex.test(version);
}

/**
 * Validates rule metadata structure
 * @param {Object} metadata - Metadata object to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
function validateMetadata(metadata) {
    const errors = [];
    const requiredFields = ['name', 'description', 'version', 'author', 'status'];
    
    // Check required fields
    requiredFields.forEach(field => {
        if (!metadata[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    });
    
    // Validate specific field formats
    if (metadata.version && !isValidSemanticVersion(metadata.version)) {
        errors.push(`Invalid semantic version: ${metadata.version}`);
    }
    
    if (metadata.status && !['active', 'draft', 'inactive'].includes(metadata.status)) {
        errors.push(`Invalid status: ${metadata.status}. Must be active, draft, or inactive`);
    }
    
    if (metadata.tags && !Array.isArray(metadata.tags)) {
        errors.push('Tags must be an array');
    }
    
    // Validate dates
    ['created_date', 'modified_date'].forEach(dateField => {
        if (metadata[dateField] && isNaN(Date.parse(metadata[dateField]))) {
            errors.push(`Invalid date format for ${dateField}: ${metadata[dateField]}`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Creates a complete design document structure with metadata and validation function
 * @param {string} ruleName - Name of the validation rule
 * @param {Function} validationFunction - The validation function
 * @param {Object} metadata - Rule metadata object
 * @returns {Object} Complete design document structure
 */
function createDesignDocument(ruleName, validationFunction, metadata) {
    // Validate metadata before creating document
    const validation = validateMetadata(metadata);
    if (!validation.isValid) {
        throw new Error(`Invalid metadata: ${validation.errors.join(', ')}`);
    }
    
    return {
        _id: `_design/${ruleName}`,
        rule_metadata: metadata,
        validate_doc_update: validationFunction
    };
}

/**
 * Pre-configured metadata for existing validation rules
 * This provides consistent metadata for all current validators
 */
const VALIDATOR_METADATA = {
    householdIncome: {
        name: 'Household Income Validator',
        description: 'Validates that household income does not exceed $25,000 threshold for program eligibility',
        version: '1.0.0',
        author: 'CouchDB Rules Engine',
        tags: ['income', 'eligibility', 'financial', 'threshold'],
        status: 'active',
        changeNotes: 'Initial implementation with $25,000 income threshold'
    },
    
    householdSize: {
        name: 'Household Size Validator',
        description: 'Validates that household size is at least 3 members for program eligibility',
        version: '1.0.0',
        author: 'CouchDB Rules Engine',
        tags: ['household', 'size', 'eligibility', 'members'],
        status: 'active',
        changeNotes: 'Initial implementation with minimum 3 member requirement'
    },
    
    numberOfDependents: {
        name: 'Number of Dependents Validator',
        description: 'Validates that household has at least 2 dependents for program eligibility',
        version: '1.0.0',
        author: 'CouchDB Rules Engine',
        tags: ['dependents', 'eligibility', 'family', 'children'],
        status: 'active',
        changeNotes: 'Initial implementation with minimum 2 dependent requirement'
    },
    
    interviewComplete: {
        name: 'Interview Complete Validator',
        description: 'Validates that required interview process has been completed before application processing',
        version: '1.0.0',
        author: 'CouchDB Rules Engine',
        tags: ['interview', 'process', 'completion', 'required', 'eligibility'],
        status: 'active',
        changeNotes: 'Initial implementation requiring non-empty interview completion status'
    }
};

module.exports = {
    createRuleMetadata,
    updateRuleMetadata,
    validateMetadata,
    createDesignDocument,
    isValidSemanticVersion,
    VALIDATOR_METADATA
};
