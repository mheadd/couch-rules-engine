const validators = require('./index');
const config = require('./config').options;

// Create URL to CouchDB instance and DB.
let dbName = process.argv[2];
let url = `${config.couchdb_url}${dbName}`;

// Create Basic Auth header
const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

// Insert new design documents.
for (let validator in validators) {

    // Create new design doc and POST to CouchDB
    let doc = {};
    doc._id = `_design/${validator}`;
    doc.validate_doc_update = `${validators[validator][validator]}`;

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
        console.log(`Successfully loaded ${validator} validator`);
    })
    .catch(err => {
        console.log(`An error occurred: ${err.message}`);
    });

}