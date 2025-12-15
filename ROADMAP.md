# **CouchDB Rules Engine Development Roadmap**

## **🎉 Recent Achievements (December 2025)**

**Phase 1 Complete!** The CouchDB Rules Engine now includes:

- ✅ **Streamlined Web Interface** - View and inspect validation rules (read-only by design)
- ✅ **Interactive Rule Generator** - CLI tool for creating new rules with proper scaffolding
- ✅ **Enhanced Metadata** - Comprehensive rule documentation and versioning
- ✅ **Modular Testing** - Organized test suite with helper utilities
- ✅ **CORS Configuration** - Direct browser-to-CouchDB communication
- ✅ **Production Ready** - Comprehensive troubleshooting documentation

**Containerization Complete!** The application is now fully containerized:

- ✅ **Docker Compose Orchestration** - Single command deployment (`docker-compose up -d`)
- ✅ **Automated Setup** - CouchDB initialization with system databases and CORS
- ✅ **Container Networking** - Proper service communication and health checks
- ✅ **Web Interface Container** - Nginx-served static site with optimized delivery
- ✅ **Environment Configuration** - Configurable credentials and database settings
- ✅ **Production Architecture** - Scalable foundation for enterprise deployment

**Developer Tools Complete!** Rule creation is now streamlined through CLI tools:

- ✅ **Interactive Rule Generator** - `npm run create-rule` for guided rule creation
- ✅ **Auto-Detection in Loader Scripts** - Loader and unloader auto-detect new validators
- ✅ **Template-Based Generation** - Validator and test templates for consistency
- ✅ **Simplified Web Interface** - Focused on viewing/inspecting rules (not editing)

The foundation is now solid for advanced rule management capabilities and enterprise deployment.

---

## **Overview**

This document outlines the development roadmap for evolving the CouchDB Rules Engine prototype into a production-ready solution. The roadmap is structured in achievable phases, with each phase building upon the previous one while delivering immediate value.

## **Current State Analysis** (Updated December 2025)

**What Exists Now**:

* ✅ CouchDB prototype using validation functions as rules engine
* ✅ Enhanced validation rules with comprehensive metadata structure
* ✅ Modular test suite with comprehensive coverage
* ✅ Streamlined web interface for viewing and inspecting rules
* ✅ Interactive rule generator CLI (`npm run create-rule`)
* ✅ Auto-detecting loader/unloader scripts for rule management
* ✅ Docker Compose orchestration with single-command deployment
* ✅ Automated CouchDB initialization and system database creation
* ✅ Container networking with proper health checks and service discovery
* ✅ Nginx-based web interface container with optimized static file serving
* ✅ Component-based architecture (vanilla JavaScript)
* ✅ Sample valid/invalid application data

**Core Architecture**:

* ✅ **Containerized Deployment**: Docker Compose orchestration with CouchDB, web interface, and initializer containers
* ✅ **Automated Setup**: Initialization container handles database creation, CORS configuration, and rule loading
* ✅ **Service Networking**: Docker bridge network enables container-to-container communication
* ✅ **CLI-Based Rule Management**: Interactive generator and auto-detecting loader scripts
* ✅ CouchDB design documents containing JavaScript validation functions
* ✅ Enhanced metadata structure with versioning and documentation
* ✅ Built-in CouchDB document versioning (via `_rev` field)
* ✅ Direct browser-to-CouchDB REST API with CORS
* ✅ Validation rules execute on document insert/update
* ✅ Web-based rule viewing interface (read-only by design)

**Infrastructure & Deployment**:

* ✅ **Single Command Deployment**: `docker-compose up -d` starts entire stack
* ✅ **Environment Configuration**: Configurable CouchDB credentials and database settings
* ✅ **Health Checks**: Container health monitoring and dependency management
* ✅ **Data Persistence**: Docker volumes for CouchDB data and configuration
* ✅ **Production Ready**: Scalable containerized architecture

**Resolved Previous Limitations**:

* ✅ **Web Interface**: Added streamlined web interface for rule viewing and inspection
* ✅ **Rule Creation**: Interactive CLI generator replaces manual rule creation
* ✅ **Rule Metadata**: Implemented structured metadata with versioning
* ✅ **Testing Framework**: Modular test suite with helper utilities
* ✅ **CORS Configuration**: Direct browser access to CouchDB API
* ✅ **Manual Setup Complexity**: Replaced with single-command Docker Compose deployment
* ✅ **Environment Inconsistency**: Containerized deployment ensures identical environments
* ✅ **Service Management**: Automated orchestration with proper health checks and networking
* ✅ **Rule Scaffolding**: Template-based generation with automatic test file creation

**Remaining Limitations**:

* Still only reports first validation error (CouchDB limitation)
* Rules execute in unspecified order
* No advanced rule types (scoring, graduated eligibility)
* Development workflow could be enhanced with hot reload (future scope)

---

## **✅ Containerization Phase: Docker Compose Orchestration** **COMPLETED**

**Timeline**: Completed September 2025 **Priority**: High - Infrastructure foundation

### **Objectives** ✅ **ALL COMPLETED**

* ✅ Containerize entire application stack for consistent deployment
* ✅ Implement single-command setup replacing manual configuration
* ✅ Establish production-ready infrastructure foundation
* ✅ Enable environment-agnostic deployment

### **Technical Implementation** ✅ **COMPLETED**

#### **Container Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────-┐  ┌────────────────────┐  │
│  │   CouchDB   │  │ Web Interface│  │    Initializer     │  │
│  │ Container   │  │  Container   │  │    Container       │  │
│  │             │  │              │  │                    │  │
│  │ - Database  │  │ - Nginx      │  │ - Setup automation │  │
│  │ - Admin UI  │  │ - Static web │  │ - CORS config      │  │
│  │ - REST API  │  │ - Port 8080  │  │ - Rule loading     │  │
│  │ - Port 5984 │  │              │  │ - System DB init   │  │
│  └─────────────┘  └─────────────-┘  └────────────────────┘  │
│           │               │                    │            │
│           └───────────────┼────────────────────┘            │
│                           │                                 │
│                  rules-engine-network                       │
└─────────────────────────────────────────────────────────────┘
```

#### **Key Components Implemented**

* ✅ **docker-compose.yml**: Production orchestration with health checks
* ✅ **web/Dockerfile**: Nginx-based static file serving
* ✅ **Dockerfile.initializer**: Automated setup and configuration
* ✅ **scripts/docker-init.sh**: Initialization script with system database creation
* ✅ **Environment Configuration**: CouchDB credentials and database settings
* ✅ **Network Isolation**: Docker bridge network for service communication

### **Deliverables** ✅ **ALL COMPLETED**

* ✅ Complete Docker Compose orchestration
* ✅ Automated CouchDB initialization with system databases (_users, _replicator)
* ✅ Containerized web interface with Nginx
* ✅ Environment-based configuration system
* ✅ Updated README with containerized deployment instructions
* ✅ Resolution of CouchDB system database initialization issues

### **Success Criteria** ✅ **ALL MET**

* ✅ Single command deployment: `docker-compose up -d`
* ✅ Web interface accessible at http://localhost:8080
* ✅ CouchDB accessible at http://localhost:5984
* ✅ All validation rules loaded automatically
* ✅ CORS properly configured for cross-origin requests
* ✅ Container health checks operational
* ✅ Data persistence through Docker volumes

---

## **Phase 1: Foundation & Testing Infrastructure** ✅ **COMPLETED**

**Timeline**: ~~1-2 weeks~~ **Completed September 2025** **Priority**: High - Essential foundation work

### **Objectives** ✅

* ✅ Establish robust testing framework
* ✅ Create basic web interface for rule management
* ✅ Enhance rule metadata structure
* ✅ Improve error handling

### **Technical Tasks**

#### **1.1 Testing Infrastructure Reorganization** ✅ **COMPLETED**

**Task**: Restructure tests into modular, discoverable files

```
test/
├── unit/
│   └── validators/
│       ├── householdIncome.test.js
│       ├── interviewComplete.test.js
│       ├── householdSize.test.js
│       └── numberOfDependents.test.js
├── integration/
│   ├── couchdb-connection.test.js
│   └── rule-execution.test.js
├── helpers/
│   ├── couchdb-helper.js
│   ├── mock-data-generator.js
│   └── test-setup.js
└── fixtures/
    ├── sample-documents/
    └── expected-results/
```

**Implementation Notes**:

* Each validation rule gets its own test file
* Use glob pattern `test/**/*.test.js` for auto-discovery
* Create test helper utilities for CouchDB setup/teardown
* Add package.json scripts for targeted test execution

#### **1.2 Enhanced Rule Metadata Structure** ✅ **COMPLETED**

**Task**: Extend design documents with structured metadata

```json
{
  "_id": "_design/ruleName",
  "_rev": "auto-managed-by-couchdb",
  "rule_metadata": {
    "name": "Human-readable rule name",
    "description": "Detailed description of rule purpose",
    "version": "semantic-version",
    "author": "rule-author",
    "tags": ["category", "keywords"],
    "status": "active|draft|inactive",
    "created_date": "ISO-date",
    "modified_date": "ISO-date",
    "change_notes": "Description of last change"
  },
  "validate_doc_update": function(newDoc, oldDoc, userCtx) {
    // validation logic
  }
}
```


#### **1.3 Streamlined Web Interface (View-Only)** ✅ **COMPLETED**

**Task**: Create minimal vanilla JavaScript web interface for viewing rules

> **Architectural Decision**: The web interface is intentionally view-only. Rule creation and management is handled through CLI tools (`npm run create-rule`) which provide better developer experience, proper scaffolding, and automatic test generation. This separation keeps the web interface simple and focused on inspection/monitoring.

**File Structure**:

```
web/
├── index.html (single-page application)
├── css/
│   ├── main.css (minimal, themeable styles)
│   └── components.css (reusable component styles)
└── js/
    ├── app.js (main application)
    ├── components/
    │   ├── RuleList.js
    │   └── RuleDetails.js
    └── utils/
        ├── couchdb-client.js
        └── helpers.js
```

**Features**:

* List all validation rules with metadata
* View rule details including revision information
* Connection status monitoring
* Direct CouchDB REST API integration
* Responsive, minimal design using CSS custom properties

#### **1.4 Improved Error Aggregation**

**Task**: Modify validation functions to collect multiple errors

* Research CouchDB validation function limitations
* Design error aggregation strategy within CouchDB constraints
* Implement proof-of-concept with multiple validation checks

### **Deliverables** ✅ **ALL COMPLETED**

* ✅ Modular test suite with individual rule test files
* ✅ Test helper utilities for CouchDB operations  
* ✅ Enhanced rule metadata schema
* ✅ Streamlined web interface for rule viewing and inspection
* ✅ Documentation for new testing approach
* ✅ Updated package.json with comprehensive test scripts

### **Additional Achievements Beyond Original Scope**

* ✅ **CORS Configuration** - Complete setup for direct browser-to-CouchDB communication
* ✅ **Connection Settings Management** - Configurable CouchDB connection with persistence
* ✅ **Interactive Rule Generator** - CLI tool (`npm run create-rule`) for guided rule creation
* ✅ **Template-Based Scaffolding** - Automatic generation of validator and test files
* ✅ **Auto-Detecting Loader Scripts** - Loader and unloader auto-detect new validator files
* ✅ **Comprehensive Troubleshooting Guide** - Real-world tested solutions for common issues
* ✅ **Rule Details Component** - View rule metadata and CouchDB revision information

### **Success Criteria** ✅ **ALL MET**

* ✅ `npm test` runs all tests successfully
* ✅ `npm run test:validators` runs only validator tests
* ✅ Web interface displays existing rules correctly
* ✅ Can create new rules through CLI generator (`npm run create-rule`)
* ✅ All existing rules updated with new metadata structure
* ✅ Loader scripts auto-detect new validator files

---

## **Phase 2: Enhanced Development Experience** 🚀 **NEXT UP**

**Timeline**: 2-3 weeks **Priority**: Medium - Developer productivity focus

> **Note**: With containerization complete, Phase 2 focuses on enhancing the development workflow with hot reload, optimized configurations, and comprehensive documentation.

### **Objectives**

* Implement development-specific Docker Compose configuration
* Add hot reload capabilities for faster development iteration
* Optimize Nginx configuration with compression and security headers
* Create comprehensive development documentation
* Support multiple environment configurations (dev/staging/prod)

### **Key Features**

#### **2.1 Development Workflow Enhancement**

* **docker-compose.dev.yml** for development with volume mounts
* **Hot reload** for web interface changes without container rebuilds
* **Development logging** with enhanced verbosity and debugging
* **Live editing** through volume mounts for CSS/JS changes

#### **2.2 Nginx Optimization**

* **Production nginx.conf** with gzip compression and caching
* **Security headers** (CSP, HSTS, X-Frame-Options)
* **MIME type optimization** for JavaScript and CSS assets
* **Performance tuning** for static asset delivery

#### **2.3 Multi-Environment Support**

* **Environment variable validation** and documentation
* **Configuration templates** for different deployment scenarios
* **Local override files** (.env support)
* **Docker Compose profiles** for environment selection

#### **2.4 Enhanced Documentation**

* **DEVELOPMENT.md** - Comprehensive developer setup guide
* **Updated README** with development workflow instructions
* **Docker troubleshooting** documentation
* **Performance optimization** guidelines

### **Deliverables**

* Development-optimized Docker Compose configuration
* Hot reload functionality for web development
* Optimized Nginx configuration for production
* Comprehensive development documentation
* Multi-environment deployment support

---

## **Phase 3: Production Optimization** 🔮 **FUTURE**

**Timeline**: 3-4 weeks **Priority**: Medium - Production readiness

### **Objectives**

* Implement security hardening and vulnerability scanning
* Add monitoring and logging infrastructure
* Create deployment guides for multiple platforms
* Establish backup and recovery procedures
* Optimize for performance and scalability

### **Key Features**

#### **3.1 Security Hardening**

* **Container security** with non-root user execution
* **Network isolation** and secure defaults
* **Secrets management** best practices
* **Security scanning** integration

#### **3.2 Monitoring & Observability**

* **Prometheus metrics** collection and endpoints
* **Grafana dashboards** for visualization
* **Structured logging** with JSON format
* **Health check endpoints** for monitoring

#### **3.3 Multi-Platform Deployment**

* **Kubernetes manifests** and Helm charts
* **Docker Swarm** configuration
* **Cloud platform guides** (AWS, GCP, Azure)
* **CI/CD pipeline** templates

#### **3.4 Operations & Maintenance**

* **Automated backup** scripts and procedures
* **Disaster recovery** planning and testing
* **Performance optimization** and benchmarking
* **Operational runbooks** and troubleshooting

---

## **Legacy Phase 2: Advanced Rule Management** 📋 **PARTIALLY COMPLETED**

**Timeline**: Originally deferred, partially completed December 2025

> **Note**: The original Phase 2 scope included web-based CRUD operations, which has been superseded by the CLI-based rule generator approach. Rule templates and generation are now complete. Web-based editing features remain deferred in favor of the more developer-friendly CLI workflow.

### **Original Objectives** (Status Updated)

* ❌ ~~Implement full CRUD operations in web interface~~ - **Deferred**: Web interface is view-only by design
* ❌ ~~Add advanced rule testing capabilities in browser~~ - **Deferred**: Testing via `npm test` and CLI
* ✅ **Create rule templates and generators** - **COMPLETED**: `npm run create-rule`
* ✅ **Auto-detect validators in loader scripts** - **COMPLETED**: Loader/unloader auto-detection
* ⚠️ Enhanced validation with multiple error reporting - **Limited by CouchDB**

### **Technical Tasks**

#### **2.1 Complete Web Interface CRUD**

**Task**: Full create, read, update, delete functionality

* Rule editing with JavaScript syntax highlighting
* Form validation before saving to CouchDB
* Confirmation dialogs for destructive operations
* Real-time syntax checking for validation functions
* Version conflict resolution (using CouchDB _rev)

#### **2.2 Integrated Testing Panel**

**Task**: Test rules directly from web interface

* Sample document input panel
* Submit test documents to CouchDB
* Display validation results (success/error messages)
* Quick test with predefined sample data
* Integration with npm test for full test suite

#### **2.3 Rule Templates and Generation** ✅ **COMPLETED**

**Task**: Streamline new rule creation

* ✅ Common validation patterns as templates (`generators/templates/`)
* ✅ Rule generator script (`npm run create-rule`)
* ✅ Auto-generate test scaffolding for new rules
* ✅ Interactive CLI with guided prompts
* ✅ Proper handling of optional vs required fields
* ✅ Integration with existing codebase (auto-updates index.js)

#### **2.4 Enhanced Error Reporting System**

**Task**: Improve validation error handling

* Research CouchDB validation function capabilities
* Implement error aggregation within CouchDB constraints
* Structured error response format
* Field-level error mapping for UI feedback

### **Deliverables** (Updated Status)

* ❌ ~~Full-featured web interface with editing capabilities~~ - Deferred (web is view-only)
* ❌ ~~Integrated rule testing functionality in browser~~ - Deferred (use `npm test`)
* ✅ Rule generation tools and templates - **COMPLETED**
* ⚠️ Improved error handling and reporting - Limited by CouchDB constraints
* ✅ User documentation for rule creation (RULE_CREATION.md)

### **Success Criteria** (Revised)

* ❌ ~~Can create, edit, and delete rules through web interface~~ - N/A (CLI-based approach)
* ✅ Can create rules through CLI generator with test scaffolding
* ✅ New rules can be generated with proper scaffolding
* ✅ Loader/unloader scripts auto-detect new validators
* ⚠️ Multiple validation errors - Limited by CouchDB (only first error returned)

---

## **Phase 3: Production Readiness**

**Timeline**: 3-4 weeks **Priority**: Medium - Production deployment preparation

### **Objectives**

* Add authentication and security
* Implement rule deployment workflow
* Create monitoring and analytics
* Optimize performance

### **Technical Tasks**

#### **3.1 Security and Authentication**

**Task**: Secure rule management interface

* CouchDB authentication integration
* Role-based access control for rule management
* Secure communication (HTTPS)
* Input sanitization and validation

#### **3.2 Rule Deployment Pipeline**

**Task**: Controlled rule deployment process

* Staging vs. production environment support
* Rule approval workflow
* Rollback capabilities
* Change audit trail

#### **3.3 Monitoring and Analytics**

**Task**: Rule execution monitoring

* Rule performance metrics
* Usage analytics dashboard
* Error rate monitoring
* Alerting for rule failures

#### **3.4 Performance Optimization**

**Task**: Optimize for scale

* Rule execution performance analysis
* CouchDB configuration optimization
* Caching strategies
* Bulk processing capabilities

### **Deliverables**

* [ ] Secured web interface with authentication
* [ ] Rule deployment workflow
* [ ] Monitoring and analytics dashboard
* [ ] Performance optimization documentation
* [ ] Production deployment guide

### **Success Criteria**

* Secure access to rule management interface
* Controlled rule deployment process
* Monitoring provides actionable insights
* System performs well under load
* Clear production deployment procedures

---

## **Phase 4: Advanced Features**

**Timeline**: 4-5 weeks **Priority**: Low - Enhancement features

### **Objectives**

* Implement advanced rule types
* Add machine learning integration
* Create comprehensive API
* Build rule sharing and replication

### **Technical Tasks**

#### **4.1 Advanced Rule Types**

**Task**: Support for complex rule scenarios

* Scoring rules (weighted outcomes)
* Graduated eligibility levels
* Time-based and conditional rules
* Rule dependencies and execution order

#### **4.2 API Development**

**Task**: Comprehensive REST API

* Rule management API endpoints
* Webhook support for external integrations
* API documentation and testing
* Rate limiting and authentication

#### **4.3 Rule Analytics and Optimization**

**Task**: Data-driven rule improvement

* Rule effectiveness analytics
* A/B testing capabilities
* Automated rule optimization suggestions
* Business impact reporting

#### **4.4 Integration and Replication**

**Task**: Enterprise integration features

* Rule sharing between environments
* CouchDB replication configuration
* External system integration adapters
* Import/export capabilities

### **Deliverables**

* [ ] Advanced rule types implementation
* [ ] Complete REST API with documentation
* [ ] Analytics and optimization tools
* [ ] Integration and replication features
* [ ] Enterprise deployment documentation

### **Success Criteria**

* Support for complex rule scenarios
* Comprehensive API enables external integrations
* Analytics provide actionable insights
* Rules can be shared and replicated across environments
* Enterprise-ready feature set

---


## **Implementation Guidelines**

### **Technology Constraints**

* **Frontend**: Vanilla JavaScript only (no frameworks)
* **Styling**: CSS with custom properties for theming
* **Backend**: Direct CouchDB integration (no middleware initially)
* **Testing**: Mocha with modular test files
* **Documentation**: Markdown for all documentation

### **Code Organization Principles**

1. **Modular Architecture**: Each component should be self-contained
2. **Minimal Dependencies**: Avoid unnecessary external libraries
3. **Customizable UI**: Use CSS custom properties for easy theming
4. **Test-Driven**: Every feature should have corresponding tests
5. **Documentation-First**: Document APIs and workflows before implementation

### **Risk Mitigation**

**Technical Risks**:

* CouchDB validation function limitations → Research and prototype early
* Performance at scale → Benchmark and optimize incrementally
* Security concerns → Implement security measures in Phase 3

**Project Risks**:

* Scope creep → Stick to phase deliverables
* Complexity growth → Maintain simplicity principles
* Integration challenges → Test integration points early

### **Success Metrics**

**Phase 1 Success**: ✅ **ACHIEVED**

* ✅ All tests pass with new structure
* ✅ Web interface displays and inspects rules
* ✅ Enhanced metadata is fully implemented
* ✅ CLI-based rule generator provides scaffolding
* ✅ Auto-detecting loader scripts work correctly

**Overall Project Success**:

* ✅ Production-ready rule viewing system
* ✅ Scalable testing infrastructure
* ✅ Comprehensive documentation
* ✅ Maintainable, minimal codebase
* ⭕ Advanced rule types (future)
* ⭕ Enterprise API (future)

---

## **🚀 Current Status & Quick Start** (December 2025)

**The CouchDB Rules Engine is now containerized and production-ready!**

### **Quick Start**

```bash
# Clone and start the entire stack
git clone https://github.com/mheadd/couch-rules-engine.git
cd couch-rules-engine
docker-compose up -d

# Access the application
# Web Interface: http://localhost:8080
# CouchDB Admin: http://localhost:5984/_utils
```

### **What Works Right Now**

* ✅ **Single Command Deployment** - Complete stack starts with `docker-compose up -d`
* ✅ **Web Interface** - View and inspect rules at http://localhost:8080
* ✅ **Interactive Rule Generator** - Create new rules with `npm run create-rule`
* ✅ **Automated Setup** - CouchDB initialization, CORS, and rule loading
* ✅ **Container Orchestration** - Proper networking and health checks
* ✅ **Test Suite** - Comprehensive testing with `npm test`
* ✅ **Auto-Detecting Loader** - Loader scripts find new validators automatically
* ✅ **Production Architecture** - Scalable containerized foundation

### **Development Workflow**

```bash
# Run tests
npm test

# Create a new validation rule (interactive)
npm run create-rule

# Load rules to CouchDB
npm run load <db> <user> <password>

# View container logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

### **Ready for Enterprise**

The application now provides a solid foundation for:
- **Development teams** with consistent containerized environments
- **Production deployment** with Docker Compose orchestration
- **Scaling** through container replication and load balancing
- **Monitoring** integration (Phase 3)
- **Security hardening** (Phase 3)

---

## **Next Steps**

1. **Current State**: Containerized, production-ready, with CLI-based rule management ✅
2. **Phase 2**: Enhanced development experience with hot reload and optimizations
3. **Phase 3**: Production hardening with security, monitoring, and multi-platform deployment
4. **Future**: Advanced rule types (scoring, graduated eligibility)
5. **Long-term**: API development and enterprise integrations

---

## **Architectural Decisions**

### **Web Interface: View-Only by Design**

The web interface is intentionally limited to viewing and inspecting rules, not creating or editing them. This decision was made for several reasons:

1. **Developer Experience**: CLI tools provide better scaffolding, automatic test generation, and integration with development workflows
2. **Code Quality**: The rule generator ensures consistent structure, proper metadata, and required test coverage
3. **Simplicity**: Keeping the web interface read-only reduces complexity and potential security concerns
4. **Separation of Concerns**: Development tasks (rule creation) stay in the development environment; operational tasks (viewing/monitoring) are web-based

### **CLI-Based Rule Management**

Rule creation and management is handled through:

* `npm run create-rule` - Interactive rule generator with guided prompts
* `npm run load <db> <user> <pass>` - Auto-detecting loader for all validators
* `npm run unload <db> <user> <pass>` - Clean removal of rules from CouchDB
* `npm test` - Comprehensive test suite for validation

This approach ensures rules are properly tested, documented, and version-controlled before deployment.

---

This roadmap provides a clear path from the current containerized foundation to advanced rule engine capabilities while maintaining the innovative use of CouchDB's native features.