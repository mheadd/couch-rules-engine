const config = require('./config').options;

// Create URL to CouchDB instance and DB.
let dbName = process.argv[2];
let url = `${config.couchdb_url}${dbName}`;

// Create Basic Auth header
const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

// Remove old design documents.
fetch(url + '/_design_docs', {
    headers: {
        'Authorization': `Basic ${auth}`
    }
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`Unable to access CouchDB instance. Response code: ${response.status}`);
        }
        return response.json();
    })
    .then(docs => {
        let rows = docs.rows;
        for (let row in rows) {
            let deleteUrl = `${url}/${rows[row].id}?rev=${rows[row].value.rev}`;
            fetch(deleteUrl, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    console.log(`Deleted design document ${rows[row].id}`);
                })
                .catch(error => {
                    console.log(`Could not delete design document: ${rows[row].id}`);
                });
        }
    })
    .catch(err => {
        console.log(`An error occurred: ${err.message}`);
    });