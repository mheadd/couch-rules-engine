const validators = require('./index');
const config = require('./config').options;

// Create URL to CouchDB instance and DB.
let dbName = process.argv[2];
let url = `${config.couchdb_url}${dbName}`;

// Create Basic Auth header
const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

console.log('Validation rules loaded for testing');

// Insert new design documents with metadata.
for (let validator in validators) {

    // Create new design doc with metadata and validation function
    let doc = {};
    doc._id = `_design/${validator}`;
    doc.validate_doc_update = `${validators[validator][validator]}`;
    
    // Include metadata if available
    if (validators[validator].metadata) {
        doc.rule_metadata = validators[validator].metadata;
        console.log(`Adding metadata for ${validator} validator`);
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(doc)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(`Successfully loaded ${validator} validator with metadata`);
    })
    .catch(err => {
        console.log(`An error occurred: ${err.message}`);
    });

}