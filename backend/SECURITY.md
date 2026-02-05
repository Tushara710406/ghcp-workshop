# API Security Documentation

## Overview
This document describes the comprehensive security measures implemented in the NBA Sports Application Backend API.

## Security Features Implemented

### 1. Authentication & Authorization
- **API Key Authentication**: All write operations (POST, PUT, DELETE) require a valid API key
- **Header-based Authentication**: API key must be sent in `X-API-Key` header
- **Multiple Key Support**: System supports multiple API keys for different clients/environments
- **Secure Key Storage**: API keys are stored in environment variables, not hardcoded

#### Usage Example:
```bash
# Create a new player (requires authentication)
curl -X POST http://localhost:8080/api/players \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-api-key-12345" \
  -d '{
    "name": "John Doe",
    "position": "Point Guard",
    "team": "Lakers"
  }'
```

### 2. Input Validation & Sanitization
- **Required Field Validation**: All endpoints validate required fields before processing
- **Maximum Length Enforcement**: String fields have maximum length limits to prevent abuse
- **HTML/Script Sanitization**: All string inputs are sanitized using bleach library to prevent XSS attacks
- **JSON Validation**: All POST/PUT requests must have valid JSON content type
- **Type Validation**: Input types are validated before processing

#### Protected Fields:
- `name`: Max 100 characters
- `position`: Max 50 characters
- `team`: Max 100 characters
- `height`, `weight`: Max 20 characters
- `birthDate`: Max 50 characters

### 3. Rate Limiting & Throttling
Rate limits are applied per IP address to prevent abuse:

| Endpoint | Rate Limit | Purpose |
|----------|-----------|---------|
| GET /api/nba-results | 30/minute | Game results retrieval |
| GET /api/stadiums | 20/minute | Stadium information |
| GET /api/player-info | 30/minute | Player information |
| POST /api/players | 10/minute | Player creation |
| GET /api/coaches | 20/minute | Coach listing |
| GET /api/coaches/:id | 30/minute | Individual coach |
| POST /api/coaches | 5/minute | Coach creation |
| PUT /api/coaches/:id | 10/minute | Coach updates |
| DELETE /api/coaches/:id | 5/minute | Coach deletion |
| GET /api/optimize | 10/minute | Optimization endpoint |
| POST /api/summarize | 5/minute | Summarization |
| GET /api/press-conferences | 20/minute | Press conferences |

**Global Limits**: 200 requests per day, 50 requests per hour per IP

#### Rate Limit Response:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": "30 per 1 minute"
}
```

### 4. Logging & Monitoring
Comprehensive security event logging for:
- **Authentication Events**: Failed login attempts, invalid API keys
- **Authorization Events**: Unauthorized access attempts
- **Rate Limiting Events**: Rate limit violations with IP addresses
- **Data Modification Events**: All create, update, delete operations
- **Error Events**: 404, 500, and other errors with context
- **Security Events**: XSS attempts, injection attempts, suspicious activity

#### Log Format:
```
2026-02-04 10:30:45 - __main__ - WARNING - SECURITY EVENT - RATE_LIMIT_EXCEEDED: Path: /api/players, Limit: 10 per 1 minute - IP: 192.168.1.100
2026-02-04 10:31:22 - __main__ - INFO - Authenticated request from 192.168.1.100 to /api/players
2026-02-04 10:31:23 - __main__ - INFO - Player created successfully - ID: 42, Name: John Doe by 192.168.1.100
```

#### Log File Location:
- `security.log` - All security events and API access logs

### 5. CORS Configuration
- **Strict Origin Policy**: Only allows requests from configured frontend origins
- **Allowed Origins**: localhost:3000, localhost:3001 (configurable)
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization

### 6. Error Handling
Secure error handling that:
- **No Sensitive Data Leakage**: Error messages don't expose internal system details
- **Consistent Format**: All errors return consistent JSON structure
- **Proper HTTP Status Codes**: Uses appropriate status codes for different error types
- **Logged for Monitoring**: All errors are logged for security analysis

## Security Best Practices

### For Developers:
1. **Never commit .env files** - Keep API keys in environment variables
2. **Rotate API keys regularly** - Change keys periodically in production
3. **Monitor security logs** - Regularly review security.log for suspicious activity
4. **Use HTTPS in production** - Always use SSL/TLS for API communication
5. **Keep dependencies updated** - Regularly update Flask, bleach, and other packages

### For Deployment:
1. **Set strong API keys** - Use cryptographically secure random strings
2. **Configure firewall** - Limit access to API endpoints
3. **Enable HTTPS** - Use SSL certificates in production
4. **Set up monitoring** - Configure alerts for security events
5. **Regular backups** - Backup data files regularly
6. **Disable debug mode** - Set FLASK_DEBUG=False in production

### For API Consumers:
1. **Protect API keys** - Never expose keys in client-side code
2. **Respect rate limits** - Implement exponential backoff for retries
3. **Handle errors gracefully** - Check status codes and handle errors appropriately
4. **Use HTTPS** - Always use secure connections
5. **Validate responses** - Verify data integrity on client side

## Testing Security Features

### Install Dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Run the Server:
```bash
python app.py
```

### Test Authentication:
```bash
# Without API key (should fail with 401)
curl -X POST http://localhost:8080/api/players \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "position": "Guard", "team": "Lakers"}'

# With valid API key (should succeed)
curl -X POST http://localhost:8080/api/players \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-api-key-12345" \
  -d '{"name": "Test", "position": "Guard", "team": "Lakers"}'
```

### Test Rate Limiting:
```bash
# Send multiple requests quickly to trigger rate limit
for i in {1..15}; do
  curl -X POST http://localhost:8080/api/players \
    -H "Content-Type: application/json" \
    -H "X-API-Key: dev-api-key-12345" \
    -d "{\"name\": \"Player$i\", \"position\": \"Guard\", \"team\": \"Lakers\"}"
  echo ""
done
```

### Test Input Validation:
```bash
# Missing required field (should fail with 400)
curl -X POST http://localhost:8080/api/players \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-api-key-12345" \
  -d '{"name": "Test"}'

# Invalid length (should fail with 400)
curl -X POST http://localhost:8080/api/players \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-api-key-12345" \
  -d '{"name": "'"$(python3 -c 'print("A"*150)')"'", "position": "Guard", "team": "Lakers"}'
```

## Monitoring & Alerts

### Key Metrics to Monitor:
1. **Failed Authentication Attempts** - Monitor for brute force attacks
2. **Rate Limit Violations** - Track IPs hitting rate limits frequently
3. **4xx/5xx Error Rates** - Monitor for unusual error patterns
4. **Response Times** - Track for performance degradation
5. **Data Modification Events** - Audit all create/update/delete operations

### Setting Up Alerts:
```python
# Example: Alert on multiple failed auth attempts
# Parse security.log and alert if same IP has >10 failed attempts in 1 hour
grep "Invalid API key attempt" security.log | \
  awk '{print $NF}' | \
  sort | uniq -c | \
  awk '$1 > 10 {print "ALERT: IP", $2, "has", $1, "failed attempts"}'
```

## Compliance & Standards
- **OWASP Top 10**: Addresses injection, broken authentication, sensitive data exposure
- **API Security Best Practices**: Follows RESTful API security guidelines
- **PCI DSS Considerations**: Ready for payment integration security requirements
- **GDPR Compliance**: Logging and data handling practices align with privacy regulations

## Future Enhancements
- [ ] Add JWT token-based authentication
- [ ] Implement OAuth2 for third-party integrations
- [ ] Add request signing for additional security
- [ ] Implement IP whitelisting/blacklisting
- [ ] Add two-factor authentication support
- [ ] Integrate with security monitoring tools (e.g., Sentry)
- [ ] Add SQL injection protection (when database is added)
- [ ] Implement rate limiting per user (not just IP)
