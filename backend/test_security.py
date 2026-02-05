#!/usr/bin/env python3
"""
Security Testing Script for NBA API
Tests authentication, rate limiting, input validation, and logging
"""
import requests
import time
import json

BASE_URL = "http://localhost:8080"
VALID_API_KEY = "dev-api-key-12345"
INVALID_API_KEY = "invalid-key"

def print_test(test_name):
    """Print test header"""
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print('='*60)

def print_result(response):
    """Print response details"""
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

# ============================================================================
# Authentication Tests
# ============================================================================

def test_authentication():
    """Test API key authentication"""
    
    print_test("1. POST without API key (should fail with 401)")
    response = requests.post(
        f"{BASE_URL}/api/players",
        json={"name": "Test Player", "position": "Guard", "team": "Lakers"}
    )
    print_result(response)
    assert response.status_code == 401, "Should fail without API key"
    
    print_test("2. POST with invalid API key (should fail with 403)")
    response = requests.post(
        f"{BASE_URL}/api/players",
        headers={"X-API-Key": INVALID_API_KEY},
        json={"name": "Test Player", "position": "Guard", "team": "Lakers"}
    )
    print_result(response)
    assert response.status_code == 403, "Should fail with invalid API key"
    
    print_test("3. POST with valid API key (should succeed with 201)")
    response = requests.post(
        f"{BASE_URL}/api/players",
        headers={"X-API-Key": VALID_API_KEY},
        json={"name": "Security Test Player", "position": "Guard", "team": "Lakers"}
    )
    print_result(response)
    assert response.status_code == 201, "Should succeed with valid API key"

# ============================================================================
# Input Validation Tests
# ============================================================================

def test_input_validation():
    """Test input validation and sanitization"""
    
    print_test("4. Missing required field (should fail with 400)")
    response = requests.post(
        f"{BASE_URL}/api/players",
        headers={"X-API-Key": VALID_API_KEY},
        json={"name": "Test Player", "team": "Lakers"}  # Missing 'position'
    )
    print_result(response)
    assert response.status_code == 400, "Should fail with missing required field"
    
    print_test("5. Field exceeds maximum length (should fail with 400)")
    response = requests.post(
        f"{BASE_URL}/api/players",
        headers={"X-API-Key": VALID_API_KEY},
        json={"name": "A" * 150, "position": "Guard", "team": "Lakers"}
    )
    print_result(response)
    assert response.status_code == 400, "Should fail with field too long"
    
    print_test("6. XSS attempt - HTML in input (should be sanitized)")
    response = requests.post(
        f"{BASE_URL}/api/players",
        headers={"X-API-Key": VALID_API_KEY},
        json={
            "name": "<script>alert('XSS')</script>Test Player",
            "position": "Guard",
            "team": "Lakers"
        }
    )
    print_result(response)
    if response.status_code == 201:
        # Check that script tags were removed
        assert "<script>" not in response.json()["name"], "HTML should be sanitized"
        print("✓ HTML tags successfully sanitized")

# ============================================================================
# Rate Limiting Tests
# ============================================================================

def test_rate_limiting():
    """Test rate limiting functionality"""
    
    print_test("7. Rate limiting test (10 requests/minute limit)")
    print("Sending 12 requests quickly to trigger rate limit...")
    
    success_count = 0
    rate_limited = False
    
    for i in range(12):
        response = requests.post(
            f"{BASE_URL}/api/players",
            headers={"X-API-Key": VALID_API_KEY},
            json={"name": f"Rate Test Player {i}", "position": "Guard", "team": "Lakers"}
        )
        
        if response.status_code == 201:
            success_count += 1
            print(f"  Request {i+1}: ✓ Success (201)")
        elif response.status_code == 429:
            rate_limited = True
            print(f"  Request {i+1}: ✗ Rate limited (429)")
            print(f"  Response: {response.json()}")
        
        time.sleep(0.1)  # Small delay between requests
    
    print(f"\nResults: {success_count} successful, Rate limited: {rate_limited}")
    assert rate_limited, "Rate limiting should have been triggered"

# ============================================================================
# READ Endpoint Tests (No authentication required)
# ============================================================================

def test_read_endpoints():
    """Test GET endpoints that don't require authentication"""
    
    print_test("8. GET endpoints without authentication (should succeed)")
    
    endpoints = [
        "/api/nba-results",
        "/api/stadiums",
        "/api/player-info",
        "/api/coaches"
    ]
    
    for endpoint in endpoints:
        response = requests.get(f"{BASE_URL}{endpoint}")
        print(f"  {endpoint}: Status {response.status_code}")
        assert response.status_code == 200, f"{endpoint} should be accessible"
    
    print("✓ All GET endpoints accessible without authentication")

# ============================================================================
# Main Test Runner
# ============================================================================

def main():
    """Run all security tests"""
    print("\n" + "="*60)
    print("NBA API SECURITY TEST SUITE")
    print("="*60)
    print("\nMake sure the Flask server is running on http://localhost:8080")
    print("Press Enter to start tests, or Ctrl+C to cancel...")
    input()
    
    try:
        # Test server is running
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code != 200:
            print("❌ Server is not responding. Please start the Flask server.")
            return
        
        print("✓ Server is running")
        
        # Run test suites
        test_authentication()
        test_input_validation()
        test_read_endpoints()
        test_rate_limiting()
        
        print("\n" + "="*60)
        print("✅ ALL SECURITY TESTS COMPLETED")
        print("="*60)
        print("\nCheck backend/security.log for detailed security event logs")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to server.")
        print("Please make sure the Flask server is running:")
        print("  cd backend")
        print("  python app.py")
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests cancelled by user")
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")

if __name__ == "__main__":
    main()
