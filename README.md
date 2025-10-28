# Couch Rules: Using CouchDB as a Rules Engine

[![Run unit tests](https://github.com/mheadd/couch-rules-engine/actions/workflows/tests.yml/badge.svg)](https://github.com/mheadd/couch-rules-engine/actions/workflows/tests.yml)

This is a prototype effort to evaluate the suitability of using [CouchDB](http://couchdb.apache.org/) as the foundation for a rules engine using the built in [document validation features](http://docs.couchdb.org/en/stable/ddocs/ddocs.html#validate-document-update-functions).

## Features

✅ **Docker Compose Orchestration** - Single command deployment with automated setup  
✅ **Enhanced Rule Metadata Structure** - Comprehensive metadata for validation rules including version control, dependencies, and validation contexts  
✅ **Web Interface** - Modern web interface for managing validation rules and testing documents  
✅ **Direct CouchDB API** - CORS-enabled direct communication with CouchDB (no middleware required)  
✅ **Rule Testing** - Interactive testing panel for validating documents against rules  
✅ **Component Architecture** - Modular, vanilla JavaScript implementation  
✅ **Production Ready** - Containerized deployment with health checks and proper networking

<img src="ui.png" alt="CouchDB Rules Engine Web Interface" style="border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 100%; height: auto;">

Note - [ROADMAP.md](ROADMAP.md) contains next steps for building this project out.

## CouchDB overview

CouchDB is a document-oriented database that stores documents in JSON format and supports [map/reduce]([http://docs.couchdb.org/en/2.2.0/ddocs/ddocs.html#view-functions](https://docs.couchdb.org/en/stable/ddocs/views/intro.html)) for querying documents. CouchDB exposes a number of [REST endpoints](https://docs.couchdb.org/en/latest/intro/api.html) for interacting and managing single instances or clusters. In addition, CouchDB supports a special type of document called a [design document](https://docs.couchdb.org/en/stable/api/ddoc/index.html) that are used to query, display, aggregate and validate updates to data in a CouchDB database.

When creating or updating a document in a CouchDB database, validation functions are used to "prevent invalid or unauthorized document update requests from being stored."

> Document validation is optional, and each design document in the database may have at most one validation function. When a write request is received for a given database, the validation function in each design document in that database is called in an unspecified order. If any of the validation functions throw an error, the write will not succeed.

Validation functions offer a way to create sets of rules that can be applied to new or updated documents when they are inserted or changed in a CouchDB database. It's not hard to imagine how this feature might be used as part of a data collection process, or as part of an application for services or benefits. 

Validation rules can be used to ensure that only "valid" data is saved, or that only "eligible" applications for services are accepted.

## Potential benefits of this approach

* Ability to write validation rules in JavaScript.
* Ability to dis-aggregate complex rules into smaller bits of logic as separate, standalone design docs.
* Ability to create and use existing JavaScript testing frameworks to more effectively manage rule sets.
* Ability to replicate rule sets across CouchDB instances using built in [replication features](https://docs.couchdb.org/en/stable/replication/index.html#replication).

## Drawbacks / challenges

* If a document has multiple validation issues, only the first validation rule failure triggers an exception and returns a message.
* It's unclear if this approach will work for more complex types of rules sets - for examples, rule sets that may need to support _partial_ eligibility for something, or graduated benefits or services.
* CouchDB is not traditionally used as a proper rules engine, so this might be pushing the envelope a bit on the tool.

## Using this prototype

### Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/) for cloning the repository

### Quick Start

Clone this repo and start the entire stack with a single command:

```bash
git clone https://github.com/mheadd/couch-rules-engine.git
cd couch-rules-engine
docker-compose up -d
```

This will:
- Start CouchDB with admin credentials (admin/password)
- Create the `rules_db` database with all validation rules
- Configure CORS for web interface access
- Start the web interface on port 8080
- Set up proper Docker networking between services

### Access the Application

- **Web Interface**: http://localhost:8080
- **CouchDB Admin**: http://localhost:5984/_utils
- **CouchDB API**: http://localhost:5984

### Environment Configuration

The application supports environment-based configuration. Default values:

- `COUCHDB_USER`: admin
- `COUCHDB_PASSWORD`: password  
- `COUCHDB_SECRET`: mysecret
- `DB_NAME`: rules_db

### Managing the Stack

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# View running containers
docker-compose ps
```

### Web Interface Features

The web interface (http://localhost:8080) provides:
- View and manage validation rules with metadata
- Test documents against validation rules
- Real-time validation feedback
- Rule creation and editing capabilities
- Direct CouchDB integration

### Command Line Testing

You can also test submitting documents via command line:

---

### Running tests

Tests can be found in the `test` directory and can be run by doing the following:

```bash
npm test
```

### Submitting documents

Test submitting a **valid** application for service (located in the `samples` directory):

```bash
curl -X POST http://admin:password@localhost:5984/rules_db -d @samples/sample_person_valid.json -H 'Content-type: application/json'
```

Sample result:

```json
{
  "ok": true,
  "id": "7e2d9fe77a60c59bdc4d0f48e50111d4",
  "rev": "1-756e1cc042469549bba59e49813b866a"
}
```

Test submitting an **invalid** application for service (located in the `samples` directory):

```bash
curl -X POST http://admin:password@localhost:5984/rules_db -d @samples/sample_person_invalid.json -H 'Content-type: application/json'
```

Sample result:

```json
{
  "error": "forbidden",
  "reason": "Income must be lower than $25,000"
}
```

## Project Structure

```
├── docker-compose.yml          # Container orchestration
├── Dockerfile.initializer      # Automated setup container
├── web/                        # Web interface for rule management
│   ├── Dockerfile             # Nginx-based web container
│   ├── index.html             # Single-page application
│   ├── css/                   # Styling (vanilla CSS)
│   └── js/                    # JavaScript components
├── scripts/                   # Setup and utility scripts
│   └── docker-init.sh         # Container initialization script
├── validators/                # CouchDB validation rules
├── test/                      # Comprehensive test suite
│   ├── unit/                  # Individual rule tests
│   ├── integration/           # CouchDB integration tests
│   └── helpers/               # Test utilities
├── samples/                   # Sample documents for testing
└── utilities/                 # Helper scripts and utilities
```

## Architecture

The application uses a containerized architecture with Docker Compose:

- **CouchDB Container**: Database with validation rules and admin interface
- **Web Interface Container**: Nginx-served static site for rule management  
- **Initializer Container**: Automated setup, CORS configuration, and rule loading
- **Docker Network**: Isolated networking between containers
- **Health Checks**: Ensures proper startup sequence and service availability

## Documentation

- **[ROADMAP.md](ROADMAP.md)** - Development roadmap and future plans
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions  
- **[METADATA_GUIDE.md](METADATA_GUIDE.md)** - Rule metadata documentation
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing framework guide

## Quick Start Summary

1. **Prerequisites**: Install Docker and Docker Compose
2. **Clone & Start**: `git clone https://github.com/mheadd/couch-rules-engine.git && cd couch-rules-engine && docker-compose up -d`
3. **Web Interface**: http://localhost:8080
4. **CouchDB Admin**: http://localhost:5984/_utils  
5. **Run Tests**: `npm test`
6. **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Legacy Setup

For the legacy manual setup process, see the `setup.sh` file (now deprecated in favor of Docker Compose).
