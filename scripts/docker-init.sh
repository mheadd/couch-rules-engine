#!/bin/sh
set -e

# Wait for CouchDB to be up
until curl -s ${COUCHDB_URL}/_up | grep -q '"status":"ok"'; do
  echo "Waiting for CouchDB to be ready..."
  sleep 2
done

echo "Creating database: $DB_NAME"
curl -s -X PUT ${COUCHDB_URL}/$DB_NAME -u ${COUCHDB_USER}:${COUCHDB_PASSWORD}

echo "Ensuring system databases (_users, _replicator) exist..."
curl -s -X PUT ${COUCHDB_URL}/_users -u ${COUCHDB_USER}:${COUCHDB_PASSWORD}
curl -s -X PUT ${COUCHDB_URL}/_replicator -u ${COUCHDB_USER}:${COUCHDB_PASSWORD}

echo "Configuring CORS..."
curl -s -X PUT "${COUCHDB_URL}/_node/_local/_config/chttpd/enable_cors" -d '"true"' -u ${COUCHDB_USER}:${COUCHDB_PASSWORD}
curl -s -X PUT "${COUCHDB_URL}/_node/_local/_config/cors/enable" -d '"true"' -u ${COUCHDB_USER}:${COUCHDB_PASSWORD}
curl -s -X PUT "${COUCHDB_URL}/_node/_local/_config/cors/origins" -d '"*"' -u ${COUCHDB_USER}:${COUCHDB_PASSWORD}
curl -s -X PUT "${COUCHDB_URL}/_node/_local/_config/cors/credentials" -d '"true"' -u ${COUCHDB_USER}:${COUCHDB_PASSWORD}
curl -s -X PUT "${COUCHDB_URL}/_node/_local/_config/cors/methods" -d '"GET, PUT, POST, HEAD, DELETE"' -u ${COUCHDB_USER}:${COUCHDB_PASSWORD}
curl -s -X PUT "${COUCHDB_URL}/_node/_local/_config/cors/headers" -d '"accept, authorization, content-type, origin, referer, x-csrf-token"' -u ${COUCHDB_USER}:${COUCHDB_PASSWORD}

echo "Loading validation rules..."
node couchLoader.js $DB_NAME $COUCHDB_USER $COUCHDB_PASSWORD

echo "Initializer complete."