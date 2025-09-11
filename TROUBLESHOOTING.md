# Web Interface Troubleshooting Guide

## Issues and Solutions

### Issue: CORS Errors in Browser Console

**Symptoms:**
- Console shows "Access-Control-Allow-Origin" errors
- Web interface can't connect to CouchDB
- Failed to load resources from localhost:5984

**Solution:**
Configure CORS in CouchDB (requires BOTH configuration sections):

**Step 1: Enable CORS in [chttpd] section (CRITICAL - often missed!)**
```bash
# This is the key setting that enables CORS processing
curl -X PUT "http://admin:password@localhost:5984/_node/_local/_config/chttpd/enable_cors" -d '"true"'
```

**Step 2: Configure CORS settings in [cors] section**
```bash
# Enable CORS
curl -X PUT "http://admin:password@localhost:5984/_node/_local/_config/cors/enable" -d '"true"'

# Allow all origins (or specify your web server origin like "http://127.0.0.1:8080")
curl -X PUT "http://admin:password@localhost:5984/_node/_local/_config/cors/origins" -d '"*"'

# Enable credentials for authenticated requests
curl -X PUT "http://admin:password@localhost:5984/_node/_local/_config/cors/credentials" -d '"true"'

# Set allowed HTTP methods
curl -X PUT "http://admin:password@localhost:5984/_node/_local/_config/cors/methods" -d '"GET, PUT, POST, HEAD, DELETE"'

# Set allowed headers
curl -X PUT "http://admin:password@localhost:5984/_node/_local/_config/cors/headers" -d '"accept, authorization, content-type, origin, referer, x-csrf-token"'
```

**Step 3: Verify CORS is working**
```bash
# Test that CORS headers are present in response
curl -I -H "Origin: http://127.0.0.1:8080" "http://localhost:5984/rules_db/_all_docs"

# Should show headers like:
# Access-Control-Allow-Origin: http://127.0.0.1:8080
# Access-Control-Allow-Credentials: true
```

**Important Notes:**
- Both `chttpd/enable_cors = true` AND `cors/enable = true` are required
- Without `chttpd/enable_cors`, the CORS headers won't be sent regardless of [cors] settings
- For Docker containers, configuration may not persist across restarts unless volumes are used

### Issue: "Connecting to CouchDB..." Never Resolves

**Symptoms:**
- Web interface loads but shows "Connecting to CouchDB..." 
- Rules list doesn't populate
- No error messages in interface

**Solution:**
1. Check CouchDB is running: `curl http://localhost:5984`
2. Verify database exists: `curl http://localhost:5984/rules_db`
3. Check browser console for network errors
4. Verify CORS configuration (see above)

### Issue: Authentication Errors

**Symptoms:**
- 401 Unauthorized responses
- "Authentication required" errors

**Solution:**
Update credentials in `web/js/utils/couchdb-client.js`:
```javascript
this.config = {
    host: 'localhost',
    port: 5984,
    protocol: 'http',
    username: 'admin',  // Update with your admin username
    password: 'password', // Update with your admin password
    database: 'rules_db'
};
```

### Issue: Rules Not Loading

**Symptoms:**
- Interface loads but no rules appear
- Empty rules list

**Solution:**
1. Verify design documents exist:
   ```bash
   curl "http://admin:password@localhost:5984/rules_db/_all_docs?startkey=\"_design/\"&endkey=\"_design0\""
   ```
2. Check if validation rules are properly deployed
3. Verify the database name matches in the client configuration

## Testing Steps

### Step 1: Verify CouchDB Connection
```bash
curl http://localhost:5984
# Expected: {"couchdb":"Welcome",...}
```

### Step 2: Verify Database Exists
```bash
curl http://admin:password@localhost:5984/rules_db
# Expected: Database info with doc_count, etc.
```

### Step 3: Check Design Documents
```bash
curl "http://admin:password@localhost:5984/rules_db/_all_docs?startkey=\"_design/\"&endkey=\"_design0\""
# Expected: List of design documents
```

### Step 4: Test Web Interface
1. Start web server: `npm run serve:web`
2. Open http://127.0.0.1:8080
3. Check browser console for errors
4. Verify rules load in the interface

## Common Fixes

### CORS Not Working
- **Problem:** CORS headers not appearing in responses despite configuration
- **Root Cause:** Missing `chttpd/enable_cors = true` setting (most common issue)
- **Solution:** 
  1. Ensure both CORS configuration sections are set (see CORS section above)
  2. Restart CouchDB container: `docker restart couchdb-rules-engine`
  3. Verify with: `curl -I -H "Origin: http://127.0.0.1:8080" "http://localhost:5984/rules_db/_all_docs"`

### CORS Configuration Lost After Restart
- **Problem:** CORS settings don't persist when Docker container restarts
- **Solution:** For Docker deployments, either:
  - Recreate container with CORS environment variables
  - Use Docker volumes to persist CouchDB configuration
  - Run CORS configuration commands after each container restart

### Connection Settings Dialog Issues
- **Problem:** Modal won't close, settings don't take effect
- **Solution:** Clear browser cache and localStorage: `localStorage.clear()` in browser console

### JavaScript Method Errors
- **Problem:** "client.getInfo is not a function" or similar errors
- **Root Cause:** Incorrect method names in client calls
- **Solution:** Use correct CouchDB client methods:
  - `client.testConnection()` (not `getInfo()`)
  - `client.getDesignDocuments()` (not `getAllDesignDocuments()`)

### Network Connection Issues
- **Problem:** Can't reach CouchDB from web interface
- **Solution:** Check if CouchDB is bound to correct interfaces, verify firewall settings

### Authentication Issues
- **Problem:** Wrong credentials
- **Solution:** Update credentials in client configuration or check CouchDB admin setup
