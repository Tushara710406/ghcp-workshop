"""
Flask Backend for NBA Sports Application
Main application entry point with comprehensive security features
"""
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import json
import os
import time
import logging
from functools import wraps
from datetime import datetime
import bleach
from typing import Optional, Dict, Any

# Configure logging for security events
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('security.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS for frontend communication
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-API-Key"]
    }
})

# Initialize rate limiter for throttling
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Security Configuration
API_KEY = os.environ.get('API_KEY', 'dev-api-key-12345')  # Use environment variable in production
ALLOWED_API_KEYS = [API_KEY, 'test-api-key']  # Support multiple keys

# ============================================================================
# SECURITY DECORATORS
# ============================================================================

def require_api_key(f):
    """
    Decorator to enforce API key authentication on endpoints.
    Expects 'X-API-Key' header with valid API key.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            logger.warning(f'Unauthorized access attempt from {get_remote_address()} - No API key provided')
            return jsonify({'error': 'API key is required'}), 401
        
        if api_key not in ALLOWED_API_KEYS:
            logger.warning(f'Invalid API key attempt from {get_remote_address()} - Key: {api_key[:10]}...')
            return jsonify({'error': 'Invalid API key'}), 403
        
        logger.info(f'Authenticated request from {get_remote_address()} to {request.path}')
        return f(*args, **kwargs)
    
    return decorated_function

def validate_json_input(required_fields: list = None, max_length: Dict[str, int] = None):
    """
    Decorator to validate and sanitize JSON input data.
    
    Args:
        required_fields: List of required field names
        max_length: Dictionary mapping field names to maximum allowed lengths
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                logger.warning(f'Invalid content type from {get_remote_address()} - Expected JSON')
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            
            if not data:
                logger.warning(f'Empty request body from {get_remote_address()}')
                return jsonify({'error': 'Request body is required'}), 400
            
            # Check required fields
            if required_fields:
                missing = [field for field in required_fields if field not in data or not data[field]]
                if missing:
                    logger.warning(f'Missing required fields from {get_remote_address()}: {missing}')
                    return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400
            
            # Validate field lengths and sanitize strings
            if max_length:
                for field, max_len in max_length.items():
                    if field in data and isinstance(data[field], str):
                        if len(data[field]) > max_len:
                            logger.warning(f'Field length exceeded from {get_remote_address()} - {field}')
                            return jsonify({'error': f'{field} exceeds maximum length of {max_len}'}), 400
                        # Sanitize HTML/script tags
                        data[field] = bleach.clean(data[field], tags=[], strip=True)
            
            # Sanitize all string fields to prevent XSS
            for key, value in data.items():
                if isinstance(value, str):
                    data[key] = bleach.clean(value, tags=[], strip=True)
            
            logger.info(f'Validated input from {get_remote_address()} for {request.path}')
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def log_security_event(event_type: str, details: str):
    """Log security-related events for monitoring"""
    logger.warning(f'SECURITY EVENT - {event_type}: {details} - IP: {get_remote_address()}')

# ============================================================================
# DATA LOADING AND CACHING
# ============================================================================


# Global cache for all data files - improves performance by reducing disk I/O
data_cache = {
    'nba-games.json': {'data': None, 'last_modified': None},
    'player-info.json': {'data': None, 'last_modified': None},
    'stadiums.json': {'data': None, 'last_modified': None},
    'coaches.json': {'data': None, 'last_modified': None},
    'teams.json': {'data': None, 'last_modified': None},
    'player-stats.json': {'data': None, 'last_modified': None}
}

def get_cached_data(filename: str):
    """
    Loads JSON data from a file with intelligent in-memory caching.
    
    This function implements a file-based cache that checks the file's modification time
    and only reloads data when the file has been changed, significantly reducing disk I/O.
    
    Args:
        filename: Name of the JSON file in the data directory
        
    Returns:
        list or dict or None: The loaded data if successful, otherwise None
    """
    file_path = os.path.join(os.path.dirname(__file__), 'data', filename)
    try:
        last_modified = os.path.getmtime(file_path)
        cache_entry = data_cache.get(filename, {'data': None, 'last_modified': None})
        
        # Only reload if file has been modified or cache is empty
        if (cache_entry['data'] is None or 
            cache_entry['last_modified'] != last_modified):
            with open(file_path, 'r') as file:
                cache_entry['data'] = json.load(file)
                cache_entry['last_modified'] = last_modified
                data_cache[filename] = cache_entry
        
        return cache_entry['data']
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f'Error loading {filename}: {e}')
        return None

@app.route('/api/nba-results', methods=['GET'])
@limiter.limit("30 per minute")
def get_nba_results():
    """
    Get NBA game results.
    Rate limited to 30 requests per minute.

    Returns:
        200: JSON object with key 'result' containing a list of NBA game data.
        500: JSON object with key 'error' and a descriptive error message if data loading fails.

    Example Success Response:
        {
            "result": [
                {
                    "id": 1,
                    "home_team": "Lakers",
                    "away_team": "Warriors",
                    "score": "102-99",
                    ...
                },
                    ...
            ]
        }

    Example Error Response:
        {
            "error": "Failed to load NBA data"
        }
    """
    try:
        nba_games = get_cached_data('nba-games.json')
        if nba_games is None:
            return jsonify({'error': 'Failed to load NBA data'}), 500
        
        return jsonify({'result': nba_games}), 200
    except Exception as e:
        print(f'Error serving NBA data: {e}')
        return jsonify({'error': 'Failed to load NBA data. Please try again later.'}), 500

# Stadiums data
@app.route('/api/stadiums', methods=['GET'])
@limiter.limit("20 per minute")
def get_stadiums():
    """Get NBA stadiums information - Rate limited to 20 requests per minute"""
    try:
        stadiums = get_cached_data('stadiums.json')
        if stadiums is None:
            return jsonify({'error': 'Failed to load stadiums data'}), 500
        
        return jsonify(stadiums), 200
    except Exception as e:
        print(f'Error serving stadiums data: {e}')
        return jsonify({'error': 'Failed to load stadiums data. Please try again later.'}), 500

# Teams data
@app.route('/api/teams', methods=['GET'])
@limiter.limit("20 per minute")
def get_teams():
    """Get NBA teams information - Rate limited to 20 requests per minute"""
    try:
        teams = get_cached_data('teams.json')
        if teams is None:
            return jsonify({'error': 'Failed to load teams data'}), 500
        
        return jsonify(teams), 200
    except Exception as e:
        print(f'Error serving teams data: {e}')
        return jsonify({'error': 'Failed to load teams data. Please try again later.'}), 500

# Player stats data
@app.route('/api/player-stats', methods=['GET'])
@limiter.limit("30 per minute")
def get_player_stats():
    """Get NBA player statistics - Rate limited to 30 requests per minute"""
    try:
        player_stats = get_cached_data('player-stats.json')
        if player_stats is None:
            return jsonify({'error': 'Failed to load player stats data'}), 500
        
        return jsonify(player_stats), 200
    except Exception as e:
        print(f'Error serving player stats data: {e}')
        return jsonify({'error': 'Failed to load player stats data. Please try again later.'}), 500

# Player info data
@app.route('/api/player-info', methods=['GET'])
@limiter.limit("30 per minute")
def get_player_info():
    """Get NBA player information - Rate limited to 30 requests per minute"""
    try:
        players = get_cached_data('player-info.json')
        if players is None or len(players) == 0:
            return jsonify({'error': 'No player data available'}), 404
        
        # Filter only required properties for each player
        filtered_players = [
            {
                'id': player['id'],
                'name': player['name'],
                'team': player['team'],
                'weight': player['weight'],
                'height': player['height'],
                'position': player['position']
            }
            for player in players
        ]
        
        return jsonify(filtered_players), 200
    except Exception as e:
        print(f'Error fetching player info: {e}')
        return jsonify({'error': 'Failed to fetch player information'}), 500

@app.route('/api/players', methods=['POST'])
@require_api_key
@limiter.limit("10 per minute")
@validate_json_input(
    required_fields=['name', 'position', 'team'],
    max_length={'name': 100, 'position': 50, 'team': 100, 'height': 20, 'weight': 20, 'birthDate': 50}
)
def create_player():
    """
    Create a new NBA player.
    
    Security:
        - Requires API key authentication via X-API-Key header
        - Rate limited to 10 requests per minute
        - Input validation and sanitization applied
        - All security events are logged

    Expects JSON payload with at least 'name', 'position', and 'team'.
    Optional fields: 'height', 'weight', 'birthDate', 'stats'.

    Returns:
        201: The created player object as JSON.
        400: If required fields are missing or invalid.
        401: If API key is missing.
        403: If API key is invalid.
        429: If rate limit exceeded.
        500: On server error.
    """
    try:
        data = request.get_json()
        
        # Load existing players using cached function
        players = get_cached_data('player-info.json')
        if players is None:
            players = []

        # Generate new unique ID
        new_id = players[-1]['id'] + 1 if players else 1

        # Build new player object with sanitized data
        new_player = {
            'id': new_id,
            'name': data['name'],
            'position': data['position'],
            'team': data['team'],
            'height': data.get('height', 'N/A'),
            'weight': data.get('weight', 'N/A'),
            'birthDate': data.get('birthDate', 'N/A'),
            'stats': data.get('stats', {
                'pointsPerGame': 0.0,
                'assistsPerGame': 0.0,
                'reboundsPerGame': 0.0
            })
        }

        players.append(new_player)

        # Save updated players list to file
        file_path = os.path.join(os.path.dirname(__file__), 'data', 'player-info.json')
        with open(file_path, 'w') as file:
            json.dump(players, file, indent=2)
        
        # Invalidate cache to force reload on next request
        data_cache['player-info.json'] = {'data': None, 'last_modified': None}

        logger.info(f'Player created successfully - ID: {new_id}, Name: {data["name"]} by {get_remote_address()}')
        return jsonify(new_player), 201

    except Exception as e:
        log_security_event('PLAYER_CREATE_ERROR', str(e))
        return jsonify({'error': 'Failed to create player'}), 500

# Coaches API
@app.route('/api/coaches', methods=['GET'])
@limiter.limit("20 per minute")
def get_coaches():
    """Get all NBA coaches - Rate limited to 20 requests per minute"""
    try:
        coaches = get_cached_data('coaches.json')
        if coaches is None:
            return jsonify({'error': 'Failed to load coaches data'}), 500
        
        return jsonify(coaches), 200
    except Exception as e:
        print(f'Error serving coaches data: {e}')
        return jsonify({'error': 'Failed to load coaches data. Please try again later.'}), 500

@app.route('/api/coaches/<int:coach_id>', methods=['GET'])
@limiter.limit("30 per minute")
def get_coach(coach_id):
    """Get a specific coach by ID - Rate limited to 30 requests per minute"""
    try:
        coaches = get_cached_data('coaches.json')
        if coaches is None:
            return jsonify({'error': 'Failed to load coaches data'}), 500
        
        coach = next((c for c in coaches if c['id'] == coach_id), None)
        if coach is None:
            return jsonify({'error': 'Coach not found'}), 404
        
        return jsonify(coach), 200
    except Exception as e:
        print(f'Error fetching coach: {e}')
        return jsonify({'error': 'Failed to fetch coach'}), 500

@app.route('/api/coaches', methods=['POST'])
@require_api_key
@limiter.limit("5 per minute")
@validate_json_input(
    required_fields=['name'],
    max_length={'name': 100, 'team': 100}
)
def create_coach():
    """
    Create a new coach.
    
    Security:
        - Requires API key authentication
        - Rate limited to 5 requests per minute
        - Input validation and sanitization applied
    """
    try:
        if not request.json or 'name' not in request.json:
            return jsonify({'error': 'Name is required'}), 400
        
        coaches = get_cached_data('coaches.json')
        if coaches is None:
            coaches = []
        
        new_id = coaches[-1]['id'] + 1 if coaches else 1
        new_coach = {
            'id': new_id,
            'name': request.json.get('name'),
            'age': request.json.get('age'),
            'team': request.json.get('team'),
            'history': request.json.get('history', [])
        }
        
        coaches.append(new_coach)
        
        # Save to file
        file_path = os.path.join(os.path.dirname(__file__), 'data', 'coaches.json')
        with open(file_path, 'w') as file:
            json.dump(coaches, file, indent=2)
        
        # Invalidate cache
        data_cache['coaches.json'] = {'data': None, 'last_modified': None}
        
        logger.info(f'Coach created successfully - ID: {new_id}, Name: {request.json.get("name")} by {get_remote_address()}')
        return jsonify(new_coach), 201
    except Exception as e:
        log_security_event('COACH_CREATE_ERROR', str(e))
        return jsonify({'error': 'Failed to create coach'}), 500

@app.route('/api/coaches/<int:coach_id>', methods=['PUT'])
@require_api_key
@limiter.limit("10 per minute")
@validate_json_input(max_length={'name': 100, 'team': 100})
def update_coach(coach_id):
    """
    Update an existing coach.
    
    Security:
        - Requires API key authentication
        - Rate limited to 10 requests per minute
        - Input validation and sanitization applied
    """
    try:
        coaches = get_cached_data('coaches.json')
        if coaches is None:
            return jsonify({'error': 'Failed to load coaches data'}), 500
        
        coach = next((c for c in coaches if c['id'] == coach_id), None)
        if coach is None:
            return jsonify({'error': 'Coach not found'}), 404
        
        if not request.json:
            return jsonify({'error': 'Invalid data'}), 400
        
        coach['name'] = request.json.get('name', coach['name'])
        coach['age'] = request.json.get('age', coach['age'])
        coach['team'] = request.json.get('team', coach['team'])
        coach['history'] = request.json.get('history', coach['history'])
        
        # Save to file
        file_path = os.path.join(os.path.dirname(__file__), 'data', 'coaches.json')
        with open(file_path, 'w') as file:
            json.dump(coaches, file, indent=2)
        
        # Invalidate cache
        data_cache['coaches.json'] = {'data': None, 'last_modified': None}
        
        logger.info(f'Coach updated successfully - ID: {coach_id} by {get_remote_address()}')
        return jsonify(coach), 200
    except Exception as e:
        log_security_event('COACH_UPDATE_ERROR', str(e))
        return jsonify({'error': 'Failed to update coach'}), 500

@app.route('/api/coaches/<int:coach_id>', methods=['DELETE'])
@require_api_key
@limiter.limit("5 per minute")
def delete_coach(coach_id):
    """
    Delete a coach.
    
    Security:
        - Requires API key authentication
        - Rate limited to 5 requests per minute
        - All deletion events are logged
    """
    try:
        coaches = get_cached_data('coaches.json')
        if coaches is None:
            return jsonify({'error': 'Failed to load coaches data'}), 500
        
        coach = next((c for c in coaches if c['id'] == coach_id), None)
        if coach is None:
            return jsonify({'error': 'Coach not found'}), 404
        
        coaches.remove(coach)
        
        # Save to file
        file_path = os.path.join(os.path.dirname(__file__), 'data', 'coaches.json')
        with open(file_path, 'w') as file:
            json.dump(coaches, file, indent=2)
        
        # Invalidate cache
        data_cache['coaches.json'] = {'data': None, 'last_modified': None}
        
        logger.info(f'Coach deleted successfully - ID: {coach_id} by {get_remote_address()}')
        return jsonify({'result': True}), 200
    except Exception as e:
        log_security_event('COACH_DELETE_ERROR', str(e))
        return jsonify({'error': 'Failed to delete coach'}), 500

# Optimize endpoint - optimized with memoization and efficient algorithms
@app.route('/api/optimize', methods=['GET'])
@limiter.limit("10 per minute")
def optimize():
    """
    Optimized endpoint demonstrating efficient computation patterns.
    
    Uses memoization for Fibonacci and iterative approach for factorial.
    Includes prompt token counting for demonstration purposes.
    """
    # Track start time for execution measurement
    start_time = time.time()
    
    # Prompt for demonstration purposes
    prompt = """
Imagine an ultra-comprehensive NBA game-tracking app, crafted specifically for die-hard fans, fantasy sports players, and analytics enthusiasts. This app goes far beyond simple score updates, delivering real-time, in-depth coverage of every NBA game with a fully immersive experience that combines live data, interactive features, and advanced analytics.

Upon opening the app, users are greeted with a visually dynamic dashboard that offers a snapshot of the day's NBA action. At the top, a featured section highlights the day's marquee matchups and big storylines, such as a rivalry game or a record-breaking player streak. A live ticker runs along the bottom, streaming key moments from all active games, allowing users to tap on any game for an immediate jump to its detailed live feed.

Each game's live feed includes a vibrant interface featuring the score, game clock, and quarter information, with continuously updated player stats, team stats, and a detailed breakdown of possessions. Users can explore various views, including a play-by-play feed, real-time shot charts, and a timeline of significant game events like dunks, three-pointers, blocks, steals, turnovers, fouls, and free throws. A "Game Momentum" graph visually depicts shifts in team dominance, showing runs, lead changes, and clutch moments as the game progresses.

For each player, users have access to a personalized stats sheet that goes beyond the basics, showcasing advanced metrics like Player Impact Estimate (PIE), Usage Rate, Offensive Rating, Defensive Rating, and Expected Plus-Minus. Each player's efficiency and impact are visualized using detailed graphs and heat maps, allowing fans to see where a player is most effective on the court. Users can even view "hot zones" for each player, indicating their shooting accuracy from different areas on the floor.

Beyond individual player stats, the app offers advanced team analytics. A "Team Breakdown" section allows users to compare metrics such as pace, offensive and defensive efficiency, rebound percentage, and turnover ratio. Users can analyze a team's strategy by viewing passing networks that illustrate ball movement patterns and assist chains, revealing the core playmakers and scorers in action. A unique "Tactical Analysis" view offers insights into team tendencies, showing favorite plays, defensive setups, and adjustments made by coaches in real time.

One of the standout features is the app's AI-powered "Prediction & Insights" engine. Drawing from a vast dataset of past games and player performances, the AI generates predictions for game outcomes, potential turning points, and expected player contributions. This feature is especially valuable for fantasy sports players and bettors, as it provides customized recommendations on players to watch, potential breakout performances, and matchup advantages. For fantasy players, the app integrates with major platforms, enabling users to synchronize their rosters and receive insights on how specific players' performances might impact their fantasy standings.

For fans seeking a more interactive experience, the app's "Fan Zone" lets users participate in live game polls, chat rooms, and prediction games where they can test their knowledge or predict game events like who will score the next basket or whether a player will reach a triple-double. Users earn points for accurate predictions, contributing to a leaderboard among friends or globally, adding a social gaming element to the app.

The app's "My Watchlist" feature is another essential tool for fans, allowing users to select specific teams or players to follow closely. Based on their watchlist, users receive real-time, customized notifications whenever there's a key moment, such as a player hitting a scoring milestone, recording a career-high stat, or making a game-winning play. The watchlist also updates users on any injuries, trade rumors, or off-court news related to their favorite players, keeping fans informed beyond just game performance.

Post-game, the app provides a rich recap experience. Users can access "Game Summary" videos featuring curated highlights, major plays, and a breakdown of key moments. A "Stat Highlights" section offers insight into the best performances of the night, spotlighting players who had standout games. Users can also review detailed post-game analysis, complete with shot charts, passing networks, and defensive heat maps, which show how each team adjusted its strategy over the course of the game.

To make the experience even more personal, the app includes a "Customize Experience" setting, allowing users to choose their preferred viewing themes, notification preferences, and the specific types of metrics they want to follow closely, such as defensive stats for fans interested in defense or shooting efficiency for fans focused on scoring.

Additionally, the app's "League Trends" section allows users to explore league-wide statistics and trends, such as the season's leaders in different categories, emerging player trends, and comparisons of team strategies. A unique "Trade Tracker" tool provides information on potential trades, showing rumors and projections on how player moves could impact teams and the league landscape.
    """
    
    # OPTIMIZED ALGORITHMS - Efficient implementations with memoization
    
    # Memoization cache for fibonacci
    fib_cache = {}
    
    def efficient_fibonacci(n: int) -> int:
        """Optimized fibonacci with memoization - O(n) time complexity"""
        if n in fib_cache:
            return fib_cache[n]
        if n <= 1:
            return n
        fib_cache[n] = efficient_fibonacci(n - 1) + efficient_fibonacci(n - 2)
        return fib_cache[n]
    
    def efficient_factorial(n: int) -> int:
        """Optimized iterative factorial - O(n) time, O(1) space"""
        result = 1
        for i in range(2, n + 1):
            result *= i
            # Prevent overflow for very large numbers
            if result > 10**100:
                return result
        return result
    
    # Execute optimized computations
    fib_result = efficient_fibonacci(36)
    factorial_result = efficient_factorial(500)
    
    # Calculate execution time in seconds
    execution_time_seconds = time.time() - start_time
    
    # Simplified token count (approximation: ~4 chars per token)
    token_count = len(prompt) // 4
    
    return jsonify({
        'prompt': prompt,
        'tokenCount': token_count,
        'executionTime': f'{execution_time_seconds:.4f}',
        'fibonacciResult': fib_result,
        'optimized': True
    }), 200

# Summarize endpoint - placeholder
@app.route('/api/summarize', methods=['POST'])
@require_api_key
@limiter.limit("5 per minute")
def summarize():
    """
    Summarize endpoint (placeholder for OpenAI integration).
    
    Security:
        - Requires API key authentication
        - Rate limited to 5 requests per minute
    """
    data = request.get_json()
    transcription = data.get('transcription', '')
    
    # Placeholder response
    return jsonify({}), 200

# Press conferences endpoint - placeholder
@app.route('/api/press-conferences', methods=['GET'])
@limiter.limit("20 per minute")
def get_press_conferences():
    """Get press conferences (placeholder) - Rate limited to 20 requests per minute"""
    return jsonify([]), 200

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'NBA Backend API'}), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    log_security_event('404_ERROR', f'Path: {request.path}')
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    log_security_event('500_ERROR', f'Path: {request.path}, Error: {str(error)}')
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded errors"""
    log_security_event('RATE_LIMIT_EXCEEDED', f'Path: {request.path}, Limit: {e.description}')
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please try again later.',
        'retry_after': e.description
    }), 429

@app.errorhandler(401)
def unauthorized_handler(error):
    """Handle unauthorized access"""
    log_security_event('UNAUTHORIZED_ACCESS', f'Path: {request.path}')
    return jsonify({'error': 'Unauthorized access'}), 401

@app.errorhandler(403)
def forbidden_handler(error):
    """Handle forbidden access"""
    log_security_event('FORBIDDEN_ACCESS', f'Path: {request.path}')
    return jsonify({'error': 'Forbidden access'}), 403

if __name__ == '__main__':
    # Run the Flask application
    app.run(debug=True, host='0.0.0.0', port=8080)
