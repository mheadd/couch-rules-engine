# Architecture Guide

## System Overview

The CouchDB Rules Engine uses CouchDB's built-in `validate_doc_update` functions to create a configurable, document-driven rules/validation system. Rules are authored as JavaScript modules, loaded into CouchDB as design documents, and executed server-side on every document write.

```
┌─────────────────────────────────────────────────────────-┐
│                     Web Interface                        │
│               (Vanilla JS, served by nginx)              │
│                                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐   │
│   │ RuleList │  │RuleEditor│  │RuleDetail│  │TestPanel   │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └───-┬───┘   │
│        └──────────────┼────────────┼─────────────┘       │
│                       │   couchdb-client.js              │
└───────────────────────┼──────────────────────────────────┘
                        │ REST API (HTTP)
┌───────────────────────┼──────────────────────────────────┐
│                  CouchDB Server                          │
│                                                          │
│   ┌─────────────────────────────────────┐                │
│   │        Design Documents             │                │
│   │  _design/householdIncome            │                │
│   │  _design/householdSize              │                │
│   │  _design/interviewComplete          │                │
│   │  _design/numberOfDependents         │                │
│   │                                     │                │
│   │  Each contains:                     │                │
│   │   - rule_metadata {}                │                │
│   │   - validate_doc_update (function)  │                │
│   └─────────────────────────────────────┘                │
│                                                          │
│   ┌─────────────────────────────────────┐                │
│   │      Regular Documents              │                │
│   │  (validated on write by all rules)  │                │
│   └─────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. CouchDB as the Rules Engine

Validation logic runs inside CouchDB itself via `validate_doc_update` functions in design documents. This means:

- Rules execute **server-side** on every document insert/update
- No middleware layer needed for validation
- Rules are stored alongside the data they validate
- Only the **first** validation failure is reported (CouchDB limitation)
- Functions execute in **unspecified order**

### 2. Vanilla JavaScript Only

The web interface uses no frameworks — only plain JavaScript, HTML, and CSS. This keeps the project dependency-free on the frontend and aligns with the project's philosophy of simplicity and minimal dependencies.

### 3. Modular Validator Files

Each rule is a standalone Node.js module in `validators/` that exports a single validation function. The `index.js` file auto-discovers and re-exports all validators. This pattern makes it easy to add, remove, or test rules independently.

## Component Map

### Backend / CLI

| File                           | Purpose                                                                  |
| ------------------------------ | ------------------------------------------------------------------------ |
| `config.js`                    | CouchDB connection settings (URL, credentials) from env vars or CLI args |
| `index.js`                     | Auto-discovers and re-exports all validator modules                      |
| `couchLoader.js`               | Reads validators, wraps them as design docs, PUTs them into CouchDB      |
| `couchUnloader.js`             | DELETEs design documents for all validators from CouchDB                 |
| `validators/*.js`              | Individual validation rule modules                                       |
| `utils/rule-metadata.js`       | Helpers for creating/validating rule metadata                            |
| `generators/rule-generator.js` | Scaffolds new validator + test files from templates                      |
| `scripts/create-rule.js`       | CLI entry point for the rule generator                                   |

### Web Interface

| File                               | Purpose                                         |
| ---------------------------------- | ----------------------------------------------- |
| `web/index.html`                   | Single-page application shell                   |
| `web/js/app.js`                    | Main application logic, routing, initialization |
| `web/js/components/RuleList.js`    | Displays list of loaded rules                   |
| `web/js/components/RuleDetails.js` | Shows full rule metadata and source             |
| `web/js/components/RuleEditor.js`  | Create/edit rule UI                             |
| `web/js/components/TestPanel.js`   | Test documents against loaded rules             |
| `web/js/utils/couchdb-client.js`   | Thin wrapper around CouchDB REST API            |
| `web/js/utils/helpers.js`          | Utility functions for the web UI                |
| `web/css/main.css`                 | Core styles with CSS custom properties          |
| `web/css/components.css`           | Component-specific styles                       |

### Infrastructure

| File                     | Purpose                                                   |
| ------------------------ | --------------------------------------------------------- |
| `docker-compose.yml`     | CouchDB + web interface + initializer services            |
| `Dockerfile.initializer` | Builds the one-shot container that loads rules on startup |
| `web/Dockerfile`         | Builds the nginx-based web interface container            |
| `setup.sh`               | Legacy standalone Docker setup script                     |

### Testing

| Directory               | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `test/unit/validators/` | Unit tests for each validation rule           |
| `test/unit/utils/`      | Unit tests for utility modules                |
| `test/integration/`     | Integration tests requiring a running CouchDB |
| `test/helpers/`         | Test utilities, mocks, and setup              |
| `test/fixtures/`        | Sample documents and expected results         |

## Data Flow

### Rule Loading

```
validators/*.js  →  couchLoader.js  →  CouchDB design documents
                     (reads module,      (_design/ruleName with
                      wraps as design     validate_doc_update and
                      doc with metadata)  rule_metadata)
```

### Document Validation

```
Client writes document  →  CouchDB  →  Each _design/* validate_doc_update
                                         runs against the document
                                     →  First failure returns 403 Forbidden
                                     →  All pass → document saved (201)
```

### Web Interface

```
Browser  →  nginx (port 8080)  →  static HTML/JS/CSS
Browser  →  CouchDB REST API (port 5984)  →  rule CRUD + document operations
```

## Technology Stack

- **Runtime**: Node.js (backend CLI tools)
- **Database**: Apache CouchDB 3.5.x
- **Testing**: Mocha
- **Web Server**: nginx (containerized)
- **Containerization**: Docker / Docker Compose
- **CI**: GitHub Actions
