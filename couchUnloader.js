const config = require('./config').options;

// Dynamic import for node-fetch (ES module)
async function unloadValidators() {
    const fetch = (await import('node-fetch')).default;

    // Create URL to CouchDB instance and DB
    let dbName = process.env.DB_NAME || process.argv[2] || 'rules_db';
    let url = `${config.couchdb_url}${dbName}`;

    console.log(`Using URL: ${url}`);

    // Create Basic Auth header
    const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

    try {
        // First check if database exists
        const dbResponse = await fetch(url, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (!dbResponse.ok) {
            if (dbResponse.status === 404) {
                console.log(`❌ Database '${dbName}' does not exist`);
                console.log(`💡 Available options:`);
                console.log(`   - Create the database first using couchLoader.js`);
                console.log(`   - Check if the database name is correct`);
                console.log(`   - Verify CouchDB is running and accessible`);
                return;
            } else {
                throw new Error(`Unable to access database '${dbName}'. Response code: ${dbResponse.status}`);
            }
        }

        console.log(`✅ Database '${dbName}' found, fetching design documents...`);

        // Get all design documents
        const designDocsResponse = await fetch(url + '/_design_docs', {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (!designDocsResponse.ok) {
            throw new Error(`Unable to fetch design documents. Response code: ${designDocsResponse.status}`);
        }

        const docs = await designDocsResponse.json();
        const rows = docs.rows;

        if (rows.length === 0) {
            console.log(`📋 No design documents found in '${dbName}' database`);
            return;
        }

        console.log(`📋 Found ${rows.length} design document(s) to remove:`);
        
        // Delete each design document
        const deletePromises = rows.map(async (row) => {
            const deleteUrl = `${url}/${row.id}?rev=${row.value.rev}`;
            
            try {
                const deleteResponse = await fetch(deleteUrl, { 
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Basic ${auth}`
                    }
                });

                if (deleteResponse.ok) {
                    console.log(`   ✅ Deleted ${row.id}`);
                    return { success: true, id: row.id };
                } else {
                    console.log(`   ❌ Failed to delete ${row.id}: HTTP ${deleteResponse.status}`);
                    return { success: false, id: row.id, status: deleteResponse.status };
                }
            } catch (error) {
                console.log(`   ❌ Error deleting ${row.id}: ${error.message}`);
                return { success: false, id: row.id, error: error.message };
            }
        });

        // Wait for all deletions to complete
        const results = await Promise.all(deletePromises);
        
        // Summary
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`\n📊 Unloading completed:`);
        console.log(`   ✅ Successfully removed: ${successful}`);
        if (failed > 0) {
            console.log(`   ❌ Failed to remove: ${failed}`);
        }

    } catch (error) {
        console.error(`❌ Fatal error during validator unloading: ${error.message}`);
        process.exit(1);
    }
}

// Execute the unloader
console.log('🗑️  Starting validator unloading...');
unloadValidators().catch(error => {
    console.error('❌ Fatal error during validator unloading:', error);
    process.exit(1);
});