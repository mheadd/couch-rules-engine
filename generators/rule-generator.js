const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class RuleGenerator {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.ruleData = {
            name: '',
            functionName: '',
            description: '',
            author: '',
            tags: [],
            validationLogic: '',
            testCases: {
                valid: [],
                invalid: []
            }
        };
    }
    
    /**
     * Prompt for user input
     */
    async prompt(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }
    
    /**
     * Convert display name to camelCase function name
     */
    toCamelCase(str) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '');
    }
    
    /**
     * Main workflow
     */
    async run() {
        console.log('\n🚀 CouchDB Rules Engine - Rule Generator\n');
        
        // Gather rule information
        await this.gatherRuleInfo();
        
        // Generate files
        await this.generateValidatorFile();
        await this.generateTestFile();
        await this.updateIndexFile();
        
        // Update mock data if requested
        if (this.ruleData.updateMockData) {
            await this.updateMockDataGenerator();
        }
        
        this.rl.close();
    }
    
    /**
     * Collect rule information through prompts
     */
    async gatherRuleInfo() {
        // Rule name
        this.ruleData.name = await this.prompt('Rule name (e.g., "Household Income"): ');
        this.ruleData.functionName = this.toCamelCase(this.ruleData.name);
        
        // Description
        this.ruleData.description = await this.prompt('Description: ');
        
        // Author
        this.ruleData.author = await this.prompt('Author: ');
        
        // Tags
        const tagsInput = await this.prompt('Tags (comma-separated): ');
        this.ruleData.tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
        
        // Field name and requirement
        console.log('\nField validation:');
        this.ruleData.fieldName = await this.prompt('Field name to validate (e.g., "age", "income"): ');
        const isRequired = await this.prompt('Is this field required on all documents? (y/n): ');
        this.ruleData.isFieldRequired = isRequired.toLowerCase() === 'y';
        
        // Validation logic
        console.log('\nEnter validation logic (JavaScript expression):');
        console.log(`Example: doc.${this.ruleData.fieldName} >= 18 && doc.${this.ruleData.fieldName} <= 65`);
        this.ruleData.validationLogic = await this.prompt('Logic: ');
        
        // Error message
        this.ruleData.errorMessage = await this.prompt('Error message: ');
        
        // Test cases
        console.log('\nDefine test cases:');
        await this.gatherTestCases();
        
        // Ask about updating mock data
        if (!this.ruleData.isFieldRequired) {
            console.log('\n💡 Since this field is optional, it won\'t be added to the base mock data.');
            console.log('   Documents will only be validated if they contain this field.');
        } else {
            const updateMock = await this.prompt('\nAdd this field to base mock data generator? (y/n): ');
            this.ruleData.updateMockData = updateMock.toLowerCase() === 'y';
            
            if (this.ruleData.updateMockData) {
                console.log('\n📝 Please provide default values for mock data:');
                this.ruleData.mockData = {
                    validValue: await this.prompt('  Valid value: '),
                    invalidValue: await this.prompt('  Invalid value: ')
                };
            }
        }
    }
    
    /**
     * Collect test case examples
     */
    async gatherTestCases() {
        // Valid case
        console.log('\nValid test case example:');
        const validCase = await this.prompt('Valid document (JSON): ');
        try {
            this.ruleData.testCases.valid.push(JSON.parse(validCase));
        } catch (e) {
            console.log('⚠️  Invalid JSON, using as string');
            this.ruleData.testCases.valid.push({ raw: validCase });
        }
        
        // Invalid case
        console.log('\nInvalid test case example:');
        const invalidCase = await this.prompt('Invalid document (JSON): ');
        try {
            this.ruleData.testCases.invalid.push(JSON.parse(invalidCase));
        } catch (e) {
            console.log('⚠️  Invalid JSON, using as string');
            this.ruleData.testCases.invalid.push({ raw: invalidCase });
        }
    }
    
    /**
     * Generate validator file
     */
    async generateValidatorFile() {
        const template = await fs.readFile(
            path.join(__dirname, 'templates/validator.template.js'),
            'utf8'
        );
        
        // Build validation logic with optional field check
        let validationCode;
        if (this.ruleData.isFieldRequired) {
            // Required field - always validate
            validationCode = `if (!(${this.ruleData.validationLogic})) {
        throw ({
            forbidden: '${this.ruleData.errorMessage}'
        });
    }`;
        } else {
            // Optional field - only validate if present
            validationCode = `// Only validate if ${this.ruleData.fieldName} field exists
    if (doc.${this.ruleData.fieldName} !== undefined && !(${this.ruleData.validationLogic})) {
        throw ({
            forbidden: '${this.ruleData.errorMessage}'
        });
    }`;
        }
        
        const content = template
            .replace(/{{functionName}}/g, this.ruleData.functionName)
            .replace(/{{description}}/g, this.ruleData.description)
            .replace(/{{author}}/g, this.ruleData.author)
            .replace(/{{validationCode}}/g, validationCode)
            .replace(/{{metadata}}/g, JSON.stringify(this.buildMetadata(), null, 4));
        
        const filePath = path.join(__dirname, '../validators', `${this.ruleData.functionName}.js`);
        await fs.writeFile(filePath, content);
        
        console.log(`\n✅ Created: validators/${this.ruleData.functionName}.js`);
    }
    
    /**
     * Generate test file
     */
    async generateTestFile() {
        const template = await fs.readFile(
            path.join(__dirname, 'templates/test.template.js'),
            'utf8'
        );
        
        const content = template
            .replace(/{{functionName}}/g, this.ruleData.functionName)
            .replace(/{{ruleName}}/g, this.ruleData.name)
            .replace(/{{validTestCases}}/g, JSON.stringify(this.ruleData.testCases.valid, null, 8))
            .replace(/{{invalidTestCases}}/g, JSON.stringify(this.ruleData.testCases.invalid, null, 8))
            .replace(/{{errorMessage}}/g, this.ruleData.errorMessage);
        
        const testDir = path.join(__dirname, '../test/unit/validators');
        await fs.mkdir(testDir, { recursive: true });
        
        const filePath = path.join(testDir, `${this.ruleData.functionName}.test.js`);
        await fs.writeFile(filePath, content);
        
        console.log(`✅ Created: test/unit/validators/${this.ruleData.functionName}.test.js`);
    }
    
    /**
     * Update index.js to export new rule
     */
    async updateIndexFile() {
        const indexPath = path.join(__dirname, '../index.js');
        const content = await fs.readFile(indexPath, 'utf8');
        
        // Add require statement
        const requireLine = `const ${this.ruleData.functionName} = require('./validators/${this.ruleData.functionName}');\n`;
        
        // Add to exports
        const exportLine = `    ${this.ruleData.functionName},\n`;
        
        let updated = content;
        
        // Insert require before module.exports
        if (!content.includes(requireLine)) {
            updated = updated.replace(
                /module\.exports/,
                `${requireLine}\nmodule.exports`
            );
        }
        
        // Insert into exports object
        if (!content.includes(exportLine)) {
            updated = updated.replace(
                /module\.exports = {/,
                `module.exports = {\n${exportLine}`
            );
        }
        
        await fs.writeFile(indexPath, updated);
        console.log(`✅ Updated: index.js`);
    }
    
    /**
     * Update mock data generator with new field
     */
    async updateMockDataGenerator() {
        const mockPath = path.join(__dirname, '../test/helpers/mock-data-generator.js');
        let content = await fs.readFile(mockPath, 'utf8');
        
        const fieldName = this.ruleData.fieldName;
        const validValue = this.ruleData.mockData.validValue;
        const invalidValue = this.ruleData.mockData.invalidValue;
        
        // Update generateValidPerson
        const validPattern = /const defaults = \{([^}]+)\};/;
        content = content.replace(validPattern, (match, fields) => {
            // Check if field already exists
            if (fields.includes(fieldName)) {
                console.log(`⚠️  Field "${fieldName}" already exists in generateValidPerson`);
                return match;
            }
            // Add new field before closing brace
            const newFields = fields.trimEnd() + ',\n            ' + fieldName + ': ' + 
                (isNaN(validValue) ? `"${validValue}"` : validValue);
            return `const defaults = {${newFields}\n        };`;
        });
        
        // Update generateInvalidPerson
        const invalidPattern = /const defaults = \{([^}]+)\/\/ Empty[\s\S]*?\};/;
        content = content.replace(invalidPattern, (match, fields) => {
            // Check if field already exists
            if (fields.includes(fieldName)) {
                console.log(`⚠️  Field "${fieldName}" already exists in generateInvalidPerson`);
                return match;
            }
            // Add new field with comment
            const comment = `// Invalid ${fieldName}`;
            const newField = `            ${fieldName}: ${isNaN(invalidValue) ? `"${invalidValue}"` : invalidValue}, ${comment}`;
            return match.replace('interviewComplete: "" // Empty', `interviewComplete: "", // Empty\n${newField}`);
        });
        
        await fs.writeFile(mockPath, content);
        console.log(`✅ Updated: test/helpers/mock-data-generator.js`);
    }
    
    /**
     * Build metadata object
     */
    buildMetadata() {
        const now = new Date().toISOString();
        return {
            name: this.ruleData.name,
            description: this.ruleData.description,
            version: "1.0.0",
            author: this.ruleData.author,
            tags: this.ruleData.tags,
            status: "draft",
            created_date: now,
            modified_date: now
        };
    }
}

module.exports = RuleGenerator;