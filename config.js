exports.options = {
    couchdb_url: process.env.COUCHDB_URL ? `${process.env.COUCHDB_URL}/` : `http://localhost:5984/`,
    username: process.env.COUCHDB_USER || process.argv[3] || 'admin',
    password: process.env.COUCHDB_PASSWORD || process.argv[4] || 'password'
}