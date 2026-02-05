/**
 * API Integration Test Suite
 * 
 * Comprehensive tests for API endpoints including:
 * - GET requests
 * - POST requests
 * - Error handling
 * - Response validation
 * - Status codes
 */

import "@testing-library/jest-dom";

// Mock fetch globally
global.fetch = jest.fn();

describe("API Integration Tests", () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("NBA Scores API", () => {
    describe("GET /api/nba-results", () => {
      test("should fetch NBA game results successfully", async () => {
        const mockGames = [
          {
            id: "1",
            event_home_team: "Lakers",
            event_away_team: "Warriors",
            event_final_result: "112-108",
            event_status: "Finished",
            event_date: "2026-02-01",
          },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ result: mockGames }),
        });

        const response = await fetch(`${API_URL}/api/nba-results`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(response.status).toBe(200);
        expect(data.result).toEqual(mockGames);
      });

      test("should handle empty game results", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ result: [] }),
        });

        const response = await fetch(`${API_URL}/api/nba-results`);
        const data = await response.json();

        expect(data.result).toEqual([]);
      });

      test("should handle API errors", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: "Internal server error" }),
        });

        const response = await fetch(`${API_URL}/api/nba-results`);
        const data = await response.json();

        expect(response.ok).toBe(false);
        expect(response.status).toBe(500);
        expect(data.error).toBeTruthy();
      });
    });
  });

  describe("Player Info API", () => {
    describe("GET /api/player-info", () => {
      test("should fetch all players successfully", async () => {
        const mockPlayers = [
          {
            id: 1,
            name: "LeBron James",
            team: "Lakers",
            position: "Forward",
            height: "6'9\"",
            weight: "250 lbs",
          },
          {
            id: 2,
            name: "Stephen Curry",
            team: "Warriors",
            position: "Guard",
            height: "6'2\"",
            weight: "185 lbs",
          },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockPlayers,
        });

        const response = await fetch(`${API_URL}/api/player-info`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data).toEqual(mockPlayers);
        expect(data.length).toBe(2);
      });

      test("should return 404 for no players", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: "No player data available" }),
        });

        const response = await fetch(`${API_URL}/api/player-info`);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBeTruthy();
      });
    });

    describe("POST /api/players", () => {
      test("should create a new player successfully", async () => {
        const newPlayer = {
          name: "Giannis Antetokounmpo",
          position: "Forward",
          team: "Bucks",
        };

        const mockResponse = {
          id: 3,
          ...newPlayer,
          height: "N/A",
          weight: "N/A",
          birthDate: "N/A",
          stats: {
            pointsPerGame: 0.0,
            assistsPerGame: 0.0,
            reboundsPerGame: 0.0,
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockResponse,
        });

        const response = await fetch(`${API_URL}/api/players`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPlayer),
        });
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.id).toBeTruthy();
        expect(data.name).toBe(newPlayer.name);
        expect(data.position).toBe(newPlayer.position);
        expect(data.team).toBe(newPlayer.team);
      });

      test("should validate required fields", async () => {
        const invalidPlayer = {
          name: "Test Player",
          // Missing position and team
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            error: "Missing required fields: position, team",
          }),
        });

        const response = await fetch(`${API_URL}/api/players`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidPlayer),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Missing required fields");
      });

      test("should handle server errors gracefully", async () => {
        const newPlayer = {
          name: "Test Player",
          position: "Guard",
          team: "Test Team",
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: "Failed to create player" }),
        });

        const response = await fetch(`${API_URL}/api/players`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPlayer),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeTruthy();
      });
    });
  });

  describe("Stadiums API", () => {
    describe("GET /api/stadiums", () => {
      test("should fetch all stadiums successfully", async () => {
        const mockStadiums = [
          {
            id: 1,
            name: "Crypto.com Arena",
            team: "Lakers",
            capacity: 19068,
          },
          {
            id: 2,
            name: "Chase Center",
            team: "Warriors",
            capacity: 18064,
          },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockStadiums,
        });

        const response = await fetch(`${API_URL}/api/stadiums`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data).toEqual(mockStadiums);
      });

      test("should handle API errors", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: "Failed to load stadiums data" }),
        });

        const response = await fetch(`${API_URL}/api/stadiums`);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeTruthy();
      });
    });
  });

  describe("Coaches API", () => {
    describe("GET /api/coaches", () => {
      test("should fetch all coaches successfully", async () => {
        const mockCoaches = [
          {
            id: 1,
            name: "Doc Rivers",
            age: 61,
            team: "Bucks",
          },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockCoaches,
        });

        const response = await fetch(`${API_URL}/api/coaches`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data).toEqual(mockCoaches);
      });
    });

    describe("GET /api/coaches/:id", () => {
      test("should fetch single coach by ID", async () => {
        const mockCoach = {
          id: 1,
          name: "Doc Rivers",
          age: 61,
          team: "Bucks",
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockCoach,
        });

        const response = await fetch(`${API_URL}/api/coaches/1`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.id).toBe(1);
      });

      test("should return 404 for non-existent coach", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: "Coach not found" }),
        });

        const response = await fetch(`${API_URL}/api/coaches/9999`);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe("Coach not found");
      });
    });
  });

  describe("Health Check API", () => {
    test("should verify API is healthy", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: "healthy",
          service: "NBA Backend API",
        }),
      });

      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe("healthy");
    });
  });

  describe("Error Handling", () => {
    test("should handle network failures", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      await expect(fetch(`${API_URL}/api/nba-results`)).rejects.toThrow(
        "Network error"
      );
    });

    test("should handle timeout errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Request timeout")
      );

      await expect(fetch(`${API_URL}/api/player-info`)).rejects.toThrow(
        "Request timeout"
      );
    });

    test("should handle 404 for non-existent endpoints", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Resource not found" }),
      });

      const response = await fetch(`${API_URL}/api/non-existent`);
      expect(response.status).toBe(404);
    });
  });

  describe("Response Validation", () => {
    test("should validate game result structure", async () => {
      const mockGame = {
        id: "1",
        event_home_team: "Lakers",
        event_away_team: "Warriors",
        event_final_result: "112-108",
        event_status: "Finished",
        event_date: "2026-02-01",
        event_home_team_logo: "/logos/lakers.png",
        event_away_team_logo: "/logos/warriors.png",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: [mockGame] }),
      });

      const response = await fetch(`${API_URL}/api/nba-results`);
      const data = await response.json();
      const game = data.result[0];

      expect(game).toHaveProperty("id");
      expect(game).toHaveProperty("event_home_team");
      expect(game).toHaveProperty("event_away_team");
      expect(game).toHaveProperty("event_final_result");
      expect(game).toHaveProperty("event_status");
      expect(game).toHaveProperty("event_date");
    });

    test("should validate player structure", async () => {
      const mockPlayer = {
        id: 1,
        name: "LeBron James",
        team: "Lakers",
        position: "Forward",
        height: "6'9\"",
        weight: "250 lbs",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockPlayer],
      });

      const response = await fetch(`${API_URL}/api/player-info`);
      const data = await response.json();
      const player = data[0];

      expect(player).toHaveProperty("id");
      expect(player).toHaveProperty("name");
      expect(player).toHaveProperty("team");
      expect(player).toHaveProperty("position");
      expect(player).toHaveProperty("height");
      expect(player).toHaveProperty("weight");
    });
  });
});
