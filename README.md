# Basic API with server-side authentication

## .env fields
- **AUTH_JWT_KEY** : required
- **DB_REMOTE_HOST** : optional (defaults to localhost)
- **DB_REMOTE_PORT** : optional (defaults to 3306)
- **DB_REMOTE_DATABASE** : required
- **DB_REMOTE_USER** : required
- **DB_REMOTE_PASSWORD** : required
- **PATH_TO_PRIVATE_KEY** : required
- **PATH_TO_FULL_CERT** : required
- **HTTPS_PORT** : required
- **CORS** : optional - CORS-enabled servers separated by |  e.g. **CORS=server1.com|server2.com|server3.com**