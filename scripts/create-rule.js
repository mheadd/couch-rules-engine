#!/usr/bin/env node
/**
 * Interactive CLI tool for creating new validation rules
 * Can be invoked by AI coding assistants or humans
 * 
 * Usage: npm run create-rule
 * Or: node scripts/create-rule.js
 */

const RuleGenerator = require('../generators/rule-generator');

async function main() {
    const generator = new RuleGenerator();
    
    try {
        await generator.run();
        console.log('\n✅ Rule created successfully!');
        console.log('\nNext steps:');
        console.log('1. Review the generated files');
        console.log('2. Run: npm test');
        console.log('3. Load to CouchDB: npm run load <db> <user> <pass>');
    } catch (error) {
        console.error('\n❌ Error creating rule:', error.message);
        process.exit(1);
    }
}

main();