#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker does not appear to be running. Please start Docker and try again."
  exit 1
fi

COUCHDB_USER=${COUCHDB_USER:-admin}
COUCHDB_PASSWORD=${COUCHDB_PASSWORD:-password}
COUCHDB_PORT=${COUCHDB_PORT:-5984}
DB_NAME=${DB_NAME:-test}

echo "Pulling CouchDB Docker image..."
docker pull couchdb

echo "Running CouchDB container..."
if docker ps -a --format '{{.Names}}' | grep -q "^couchdb-rules-engine$"; then
  echo "Error: A Docker container named 'couchdb-rules-engine' is already running or exists."
  echo "It looks like the setup script has already been run."
  echo "If you want to start fresh, remove the container with:"
  echo "  docker rm -f couchdb-rules-engine"
  echo "If the container exists but is not running, you can start it with:"
  echo "  docker start couchdb-rules-engine"
  exit 1
fi
docker run -d --name couchdb-rules-engine -p ${COUCHDB_PORT}:5984 \
  -e COUCHDB_USER=${COUCHDB_USER} \
  -e COUCHDB_PASSWORD=${COUCHDB_PASSWORD} \
  couchdb

echo "Waiting for CouchDB to start..."
until curl -s http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@localhost:${COUCHDB_PORT}/_up | grep -q '"status":"ok"'; do
  sleep 2
done

echo "Creating test database '${DB_NAME}'..."
curl -s -X PUT http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@localhost:${COUCHDB_PORT}/${DB_NAME}

echo "Installing npm dependencies..."
npm install

echo "Loading validation rules into CouchDB..."
npm run load ${DB_NAME} ${COUCHDB_USER} ${COUCHDB_PASSWORD}

echo "Setup complete. CouchDB is running on port ${COUCHDB_PORT}."