#!/bin/bash

# CouchDB Rules Engine Setup Script
# 
# This script sets up a complete development environment including:
# - CouchDB Docker container with admin user
# - Rules database with validation rules
# - CORS configuration for web interface
# - npm dependencies installation
#
# Usage: ./setup.sh
# Environment variables (optional):
#   COUCHDB_USER (default: admin)
#   COUCHDB_PASSWORD (default: password) 
#   COUCHDB_PORT (default: 5984)
#   DB_NAME (default: rules_db)

# Exit immediately if a command exits with a non-zero status
set -e

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker does not appear to be running. Please start Docker and try again."
  exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
  echo "Error: npm is not installed. Please install Node.js and npm first."
  echo "Visit: https://nodejs.org/"
  exit 1
fi

COUCHDB_USER=${COUCHDB_USER:-admin}
COUCHDB_PASSWORD=${COUCHDB_PASSWORD:-password}
COUCHDB_PORT=${COUCHDB_PORT:-5984}
DB_NAME=${DB_NAME:-rules_db}

echo "Pulling CouchDB Docker image..."
docker pull couchdb

echo "Running CouchDB container..."
if docker ps -a --format '{{.Names}}' | grep -q "^couchdb-rules-engine$"; then
  echo "⚠️  A Docker container named 'couchdb-rules-engine' already exists."
  echo ""
  read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing existing container..."
    docker rm -f couchdb-rules-engine
  else
    echo "Setup cancelled. To start the existing container, run:"
    echo "  docker start couchdb-rules-engine"
    exit 0
  fi
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

echo "Configuring CORS for web interface..."
# Enable CORS in HTTP daemon (critical step!)
curl -s -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@localhost:${COUCHDB_PORT}/_node/_local/_config/chttpd/enable_cors" -d '"true"' > /dev/null

# Configure CORS settings
curl -s -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@localhost:${COUCHDB_PORT}/_node/_local/_config/cors/enable" -d '"true"' > /dev/null
curl -s -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@localhost:${COUCHDB_PORT}/_node/_local/_config/cors/origins" -d '"*"' > /dev/null
curl -s -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@localhost:${COUCHDB_PORT}/_node/_local/_config/cors/credentials" -d '"true"' > /dev/null
curl -s -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@localhost:${COUCHDB_PORT}/_node/_local/_config/cors/methods" -d '"GET, PUT, POST, HEAD, DELETE"' > /dev/null
curl -s -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@localhost:${COUCHDB_PORT}/_node/_local/_config/cors/headers" -d '"accept, authorization, content-type, origin, referer, x-csrf-token"' > /dev/null

echo "Verifying CORS configuration..."
# Give CORS configuration a moment to take effect
sleep 2
if curl -s -I -H "Origin: http://127.0.0.1:8080" "http://localhost:${COUCHDB_PORT}/${DB_NAME}/_all_docs" | grep -q "Access-Control-Allow-Origin"; then
  echo "✅ CORS configured successfully"
else
  echo "⚠️  CORS configuration may need manual verification"
  echo "   Run: curl -I -H \"Origin: http://127.0.0.1:8080\" \"http://localhost:${COUCHDB_PORT}/${DB_NAME}/_all_docs\""
fi

echo "Installing npm dependencies..."
npm install

echo "Loading validation rules into CouchDB..."
npm run load ${DB_NAME} ${COUCHDB_USER} ${COUCHDB_PASSWORD}

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 What's available:"
echo "   • CouchDB running on port ${COUCHDB_PORT}"
echo "   • Database '${DB_NAME}' created with validation rules"
echo "   • CORS configured for web interface access"
echo ""
echo "🚀 Quick start:"
echo "   • Web interface: npm run serve:web → http://127.0.0.1:8080"
echo "   • Run tests: npm test"
echo "   • Direct API: http://localhost:${COUCHDB_PORT}/_utils (CouchDB admin)"
echo ""
echo "📚 Documentation:"
echo "   • README.md - Getting started guide"
echo "   • TROUBLESHOOTING.md - Common issues and solutions"
echo ""
echo "🔧 Troubleshooting:"
echo "   • If CORS issues persist, see TROUBLESHOOTING.md"
echo "   • Container name: couchdb-rules-engine"
echo "   • To restart: docker restart couchdb-rules-engine"