# CouchDB Rules Engine Web Interface

## Quick Start Guide

This web interface provides a user-friendly way to manage and test validation rules stored in CouchDB.

### Prerequisites

1. **CouchDB Instance**: You need a running CouchDB instance with CORS enabled
2. **Validation Rules**: Rules should be stored as design documents in your CouchDB database
3. **Web Server**: Serve the web interface files via HTTP/HTTPS (not file://)

### Setup Instructions

1. **Enable CORS in CouchDB** (if not already enabled):
   ```bash
   curl -X PUT http://admin:password@localhost:5984/_config/cors/enable_cors -d '"true"'
   curl -X PUT http://admin:password@localhost:5984/_config/cors/origins -d '"*"'
   curl -X PUT http://admin:password@localhost:5984/_config/cors/credentials -d '"true"'
   curl -X PUT http://admin:password@localhost:5984/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
   curl -X PUT http://admin:password@localhost:5984/_config/cors/headers -d '"accept, authorization, content-type, origin, referer, x-csrf-token"'
   ```

2. **Serve the Web Interface**:
   ```bash
   # Using Python's built-in server
   cd web
   python3 -m http.server 8080
   
   # Or using Node.js http-server
   npx http-server . -p 8080 -c-1
   
   # Or using any other web server
   ```

3. **Access the Interface**:
   - Open your browser and navigate to `http://localhost:8080`
   - Configure the CouchDB connection settings
   - Start managing your validation rules!

### Configuration

On first launch, you'll be prompted to configure your CouchDB connection:

- **CouchDB URL**: The base URL of your CouchDB instance (e.g., `http://localhost:5984`)
- **Database Name**: Name of the database containing your validation rules
- **Username/Password**: Optional credentials for authentication

### Features

#### Rules Management
- Browse all validation rules with metadata
- View detailed rule information including:
  - Rule metadata (name, version, author, status, etc.)
  - Validation function code
  - Tags and categorization
  - Change history

#### Rule Testing
- Test validation rules against sample documents
- Use built-in sample documents or provide custom JSON
- View detailed test results including:
  - Validation pass/fail status
  - Error messages and warnings
  - Execution logs and timing
  - Rule metadata context

#### Direct CouchDB Integration
- No middleware required
- Uses CouchDB's built-in HTTP API
- CORS-enabled for direct browser access
- Real-time communication with your CouchDB instance

### Browser Support

This interface uses modern web technologies and requires:
- ES6+ JavaScript support
- CSS Custom Properties (variables)
- Fetch API
- Modern DOM APIs

Supported browsers:
- Chrome 61+
- Firefox 55+
- Safari 12+
- Edge 79+

### Troubleshooting

#### Connection Issues
1. Verify CouchDB is running and accessible
2. Check CORS configuration in CouchDB
3. Ensure the database exists and contains design documents
4. Verify authentication credentials (if required)

#### CORS Errors
If you see CORS-related errors in the browser console:
1. Make sure CORS is enabled in CouchDB (see setup instructions above)
2. Check that the `origins` setting includes your domain or is set to `*`
3. Restart CouchDB after making CORS configuration changes

#### No Rules Found
If no validation rules appear:
1. Verify the database name is correct
2. Check that design documents exist in the database
3. Ensure design documents have the expected validation function structure

### Development

The web interface is built with:
- **Vanilla JavaScript** (no frameworks)
- **CSS Custom Properties** for theming
- **Component-based architecture**
- **Responsive design principles**

File structure:
```
web/
├── index.html              # Main application shell
├── css/
│   ├── main.css           # Core styles and variables
│   └── components.css     # Component-specific styles
└── js/
    ├── app.js             # Main application orchestration
    ├── utils/
    │   ├── helpers.js     # DOM utilities and formatters
    │   └── couchdb-client.js # CouchDB API client
    └── components/
        ├── RuleList.js    # Rules browsing component
        ├── RuleEditor.js  # Rule viewing component
        └── TestPanel.js   # Rule testing component
```

### Security Considerations

- This interface communicates directly with CouchDB from the browser
- Ensure proper authentication and authorization in CouchDB
- Consider network security when exposing CouchDB to browsers
- Use HTTPS in production environments
- Validate and sanitize all user inputs

### Next Steps

This is Phase 1, Task 1.3 of the roadmap. Future phases will include:
- **Phase 2**: Advanced rule editing and creation
- **Phase 3**: Enhanced rule testing with batch operations
- **Phase 4**: Rule validation and deployment workflows

For more information, see the project's `ROADMAP.md` file.
