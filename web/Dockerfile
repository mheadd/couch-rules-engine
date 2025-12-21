# Using Docker Hardened Image for improved security
FROM dhi.io/nginx:1-alpine3.21-dev

# Copy web interface files
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1