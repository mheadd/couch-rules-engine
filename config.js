exports.options = {
    couchdb_url: `http://localhost:5984/`,
    username: process.argv[3] || 'admin',
    password: process.argv[4] || 'password'
}