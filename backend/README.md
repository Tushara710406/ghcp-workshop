# NBA Sports Application - Backend API

Python Flask backend service for the NBA Sports Application with comprehensive security features.

## Overview

This backend provides secure RESTful API endpoints for the NBA Sports Application, including:
- NBA game results
- Stadium information
- Player information
- Coach management (CRUD operations)
- Optimization demos

## 🔒 Security Features

This API implements enterprise-grade security:
- ✅ **API Key Authentication** for write operations
- ✅ **Rate Limiting** to prevent abuse (10-30 requests/minute per endpoint)
- ✅ **Input Validation & Sanitization** to prevent XSS and injection attacks
- ✅ **Security Event Logging** for monitoring and auditing
- ✅ **CORS Protection** with strict origin policy

See [SECURITY.md](SECURITY.md) for detailed security documentation.

## Technology Stack

- **Python 3.8+**
- **Flask 3.0.0** - Web framework
- **Flask-CORS 4.0.0** - Cross-origin resource sharing support
- **Flask-Limiter 3.5.0** - Rate limiting and throttling
- **Bleach 6.1.0** - HTML sanitization and XSS prevention
- **JSON** - Data storage

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables (optional):**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and set your API key
   # API_KEY=your-secure-api-key-here
   ```

## Running the Backend

1. **Start the Flask server:**
   ```bash
   python app.py
   ```

2. **The server will start on:**
   ```
   http://localhost:8080
   ```

3. **Verify the server is running:**
   ```bash
   curl http://localhost:8080/api/health
   ```

## API Endpoints

### 🔓 Public Endpoints (No Authentication Required)

#### NBA Game Results
- **GET** `/api/nba-results` - Get all NBA game results
  - Rate Limit: 30 requests/minute

#### Stadiums
- **GET** `/api/stadiums` - Get all NBA stadium information
  - Rate Limit: 20 requests/minute

#### Player Information
- **GET** `/api/player-info` - Get filtered player information
  - Rate Limit: 30 requests/minute
  - Returns: id, name, team, weight, height, position

#### Coaches
- **GET** `/api/coaches` - Get all coaches
  - Rate Limit: 20 requests/minute
- **GET** `/api/coaches/:id` - Get a specific coach by ID
  - Rate Limit: 30 requests/minute

#### Health Check
- **GET** `/api/health` - Server health status

### 🔒 Protected Endpoints (Requires API Key)

**Authentication:** Include `X-API-Key` header with valid API key

#### Player Management
- **POST** `/api/players` - Create a new player
  - Rate Limit: 10 requests/minute
  - Required fields: `name`, `position`, `team`
  - Optional fields: `height`, `weight`, `birthDate`, `stats`
  - Example:
    ```bash
    curl -X POST http://localhost:8080/api/players \
      -H "Content-Type: application/json" \
      -H "X-API-Key: dev-api-key-12345" \
      -d '{
        "name": "LeBron James",
        "position": "Forward",
        "team": "Lakers",
        "height": "6-9",
        "weight": "250 lbs"
      }'
    ```

#### Coach Management
- **POST** `/api/coaches` - Create a new coach
  - Rate Limit: 5 requests/minute
  - Required fields: `name`
  
- **PUT** `/api/coaches/:id` - Update an existing coach
  - Rate Limit: 10 requests/minute
  
- **DELETE** `/api/coaches/:id` - Delete a coach
  - Rate Limit: 5 requests/minute

## 🔒 Security Testing

Run the comprehensive security test suite:

```bash
# Make sure the server is running first
python app.py

# In another terminal, run the security tests
python test_security.py
```

The test suite validates:
- ✅ API key authentication
- ✅ Input validation and sanitization
- ✅ Rate limiting functionality
- ✅ XSS prevention
- ✅ Security event logging

## 📊 Monitoring

Security events are logged to `security.log`. Monitor this file for:
- Failed authentication attempts
- Rate limit violations
- Input validation failures
- Suspicious activity

```bash
# View recent security events
tail -f security.log

# Count failed auth attempts by IP
grep "Invalid API key" security.log | awk '{print $NF}' | sort | uniq -c
```
- **GET** `/api/coaches/<id>` - Get a specific coach by ID
- **POST** `/api/coaches` - Create a new coach
- **PUT** `/api/coaches/<id>` - Update an existing coach
- **DELETE** `/api/coaches/<id>` - Delete a coach

### Other Endpoints
- **GET** `/api/optimize` - Token counting demonstration
- **POST** `/api/summarize` - Summarization endpoint (placeholder)
- **GET** `/api/press-conferences` - Press conferences (placeholder)
- **GET** `/api/health` - Health check endpoint

## Data Files

Data is stored in JSON files located in the `data/` directory:
- `nba-games.json` - NBA game results
- `stadiums.json` - Stadium information
- `player-info.json` - Player information
- `coaches.json` - Coach data

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

To modify CORS settings, edit the CORS configuration in `app.py`.

## Development

### Project Structure
```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── data/              # JSON data files
│   ├── nba-games.json
│   ├── stadiums.json
│   ├── player-info.json
│   └── coaches.json
└── README.md          # This file
```

### Error Handling

The API includes comprehensive error handling:
- **400** - Bad Request (missing required fields)
- **404** - Resource Not Found
- **500** - Internal Server Error

All errors return JSON responses with an `error` field describing the issue.

## Troubleshooting

### Port Already in Use
If port 8080 is already in use, you can change the port in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=YOUR_PORT)
```

### CORS Issues
If you encounter CORS errors, verify:
1. The backend is running on port 8080
2. The frontend is running on port 3000
3. CORS origins in `app.py` match your frontend URL

### Dependencies Not Found
Ensure you've activated your virtual environment and installed dependencies:
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## Production Deployment

For production deployment, consider:
1. Using a production WSGI server (e.g., Gunicorn, uWSGI)
2. Setting `debug=False` in `app.py`
3. Using environment variables for configuration
4. Implementing proper authentication and authorization
5. Using a proper database instead of JSON files
6. Adding rate limiting and security headers

## License

This project is part of the GitHub Copilot Workshop.
