# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in the CouchDB Rules Engine, please report it responsibly.

### How to Report

1. **Do not** open a public GitHub issue for security vulnerabilities.
2. Email the maintainer at **mheadd@gmail.com** with:
   - A description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fix (optional)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Assessment**: Within 1 week, we will assess the severity and impact
- **Resolution**: Security patches will be prioritized and released as soon as practical
- **Disclosure**: We will coordinate with you on public disclosure timing

## Security Considerations

### CouchDB Configuration

- The default `docker-compose.yml` uses example credentials (`admin`/`password`). **Always change these in production.**
- CouchDB admin credentials should be stored in environment variables, never committed to source control.
- Use HTTPS in production environments.

### Validation Functions

- CouchDB validation functions (`validate_doc_update`) execute server-side within the CouchDB runtime.
- Validation functions must be pure JavaScript (ES5 compatible) without access to external modules.
- All validation errors use `throw({forbidden: "message"})` format per CouchDB specification.

### Docker Security

- Containers use security hardening options including `no-new-privileges`, `cap_drop: ALL`, and read-only filesystems where possible.
- Resource limits are configured to prevent resource exhaustion.
- The web interface runs as a non-root user inside nginx.

### Dependencies

- Dependencies are kept minimal by design (only `mocha` for dev, `node-fetch` for runtime).
- Run `npm audit` regularly to check for known vulnerabilities.
