/**
 * {{description}}
 * 
 * @author {{author}}
 * @version 1.0.0
 */

/**
 * Rule metadata for {{functionName}}
 */
exports.metadata = {{metadata}};

/**
 * Validation function for {{functionName}}
 * 
 * @param {Object} doc - The document to validate
 * @returns {boolean} Returns true if valid
 * @throws {Object} Throws forbidden error if invalid
 */
exports.{{functionName}} = function (doc) {
    {{validationCode}}
    
    return true;
};