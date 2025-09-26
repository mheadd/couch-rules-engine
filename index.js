const fs = require('fs');
const path = require('path');

// Automatically discover and export all validators
const validators = {};
const validatorsDir = path.join(__dirname, 'validators');

try {
    const files = fs.readdirSync(validatorsDir);
    const validatorFiles = files.filter(file => file.endsWith('.js'));
    
    for (const file of validatorFiles) {
        const validatorName = path.basename(file, '.js');
        const validatorModule = require(path.join(validatorsDir, file));
        
        // Only include if it exports the expected validator function
        if (typeof validatorModule[validatorName] === 'function') {
            validators[validatorName] = validatorModule;
        }
    }
} catch (error) {
    console.error('Error loading validators:', error.message);
}

module.exports = validators;