const fs = require('fs').promises;
const path = require('path');
const config = require('./config').options;

// Dynamic import for node-fetch (ES module)
async function loadValidators() {
    const fetch = (await import('node-fetch')).default;

    // Create URL to CouchDB instance and DB
    let dbName = process.env.DB_NAME || process.argv[2] || 'rules_db';
    let url = `${config.couchdb_url}${dbName}`;

    console.log(`🚀 Loading validators to: ${url}`);

    // Create Basic Auth header
    const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

    try {
        // First verify database exists
        const dbResponse = await fetch(url, {
            method: 'HEAD',
            headers: { 'Authorization': `Basic ${auth}` }
        });

        if (!dbResponse.ok) {
            console.log(`❌ Database '${dbName}' does not exist or is not accessible`);
            console.log(`   Create it first or check your connection settings`);
            process.exit(1);
        }

        // Scan validators directory for .js files
        const validatorsDir = path.join(__dirname, 'validators');
        const files = await fs.readdir(validatorsDir);
        const validatorFiles = files.filter(file => file.endsWith('.js'));

        console.log(`📋 Found ${validatorFiles.length} validator files: ${validatorFiles.join(', ')}`);

        let successCount = 0;
        let updateCount = 0;
        let errorCount = 0;

        // Load each validator file dynamically
        for (const file of validatorFiles) {
            const filePath = path.join(validatorsDir, file);
            const validatorName = path.basename(file, '.js');

            try {
                // Dynamically require the validator module
                delete require.cache[require.resolve(filePath)]; // Clear cache for hot reloading
                const validatorModule = require(filePath);

                // Check if the module exports a function with the expected name
                if (typeof validatorModule[validatorName] !== 'function') {
                    console.log(`⚠️  Warning: ${file} does not export a function named '${validatorName}' - skipping`);
                    continue;
                }

                console.log(`\n� Processing validator: ${validatorName}`);

                // Check if design document already exists
                const docId = `_design/${validatorName}`;
                const docUrl = `${url}/${docId}`;
                
                let existingDoc = null;
                const checkResponse = await fetch(docUrl, {
                    method: 'GET',
                    headers: { 'Authorization': `Basic ${auth}` }
                });

                if (checkResponse.ok) {
                    existingDoc = await checkResponse.json();
                    console.log(`   📄 Found existing document (rev: ${existingDoc._rev})`);
                } else if (checkResponse.status === 404) {
                    console.log(`   ✨ Creating new design document`);
                } else {
                    console.log(`   ⚠️  Could not check existing document: HTTP ${checkResponse.status}`);
                }

                // Create design document with metadata and validation function
                let doc = {};
                doc._id = docId;
                
                // Include revision if updating existing document
                if (existingDoc && existingDoc._rev) {
                    doc._rev = existingDoc._rev;
                }
                
                doc.validate_doc_update = validatorModule[validatorName].toString();
                
                // Include metadata if available
                if (validatorModule.metadata) {
                    doc.rule_metadata = validatorModule.metadata;
                    console.log(`   ✓ Including metadata for ${validatorName} validator`);
                } else {
                    // Create basic metadata if none provided
                    doc.rule_metadata = {
                        name: validatorName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                        description: `Auto-generated from ${file}`,
                        version: "1.0.0",
                        author: "system",
                        tags: ["auto-generated"],
                        status: "active",
                        created_date: new Date().toISOString(),
                        modified_date: new Date().toISOString()
                    };
                    console.log(`   ⚠️  Generated basic metadata for ${validatorName}`);
                }

                // Always update the modified_date for existing documents
                if (existingDoc) {
                    doc.rule_metadata.modified_date = new Date().toISOString();
                }

                // Insert or update the design document
                const method = existingDoc ? 'PUT' : 'POST';
                const targetUrl = existingDoc ? docUrl : url;
                
                console.log(`   🔄 ${existingDoc ? 'Updating' : 'Creating'} design document...`);
                
                const response = await fetch(targetUrl, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${auth}`
                    },
                    body: JSON.stringify(doc)
                });

                if (response.ok) {
                    const responseData = await response.json();
                    if (existingDoc) {
                        console.log(`   ✅ Successfully updated ${validatorName} validator (new rev: ${responseData.rev})`);
                        updateCount++;
                    } else {
                        console.log(`   ✅ Successfully created ${validatorName} validator (rev: ${responseData.rev})`);
                        successCount++;
                    }
                } else {
                    const errorData = await response.text();
                    console.log(`   ❌ Failed to ${existingDoc ? 'update' : 'create'} ${validatorName}: HTTP ${response.status} - ${errorData}`);
                    errorCount++;
                }

            } catch (moduleError) {
                console.log(`❌ Error loading validator module ${file}: ${moduleError.message}`);
                errorCount++;
            }
        }

        // Summary
        console.log(`\n📊 Validation rule loading completed:`);
        console.log(`   ✅ New rules created: ${successCount}`);
        console.log(`   🔄 Rules updated: ${updateCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📋 Total processed: ${successCount + updateCount + errorCount}`);

        if (errorCount > 0) {
            process.exit(1);
        }

    } catch (dirError) {
        console.error(`❌ Error during validator loading: ${dirError.message}`);
        process.exit(1);
    }
}

// Execute the loader
console.log('🚀 Starting automatic validator discovery and loading...');
loadValidators().catch(error => {
    console.error('❌ Fatal error during validator loading:', error);
    process.exit(1);
});