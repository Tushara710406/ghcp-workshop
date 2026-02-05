/**
 * Players Info Page Test Suite
 * 
 * Comprehensive tests for the Players Info page component including:
 * - Data fetching and display
 * - Card rendering
 * - Error handling
 * - Loading states
 * - Accessibility
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";

// Mock fetch globally
global.fetch = jest.fn();

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

describe("Players Info Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("happy path scenarios", () => {
    test("should display all player information in cards", async () => {
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
        json: async () => mockPlayers,
      });

      // Dynamic import to handle async component
      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      render(component);

      await waitFor(() => {
        expect(screen.getByText("LeBron James")).toBeInTheDocument();
        expect(screen.getByText("Stephen Curry")).toBeInTheDocument();
      });

      // Verify all player details are shown
      expect(screen.getByText("Lakers")).toBeInTheDocument();
      expect(screen.getByText("Warriors")).toBeInTheDocument();
      expect(screen.getByText("Forward")).toBeInTheDocument();
      expect(screen.getByText("Guard")).toBeInTheDocument();
    });

    test("should display player cards in grid layout", async () => {
      const mockPlayers = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        name: `Player ${i + 1}`,
        team: `Team ${i + 1}`,
        position: "Forward",
        height: "6'8\"",
        weight: "220 lbs",
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      const { container } = render(component);

      await waitFor(() => {
        // Verify grid container with responsive classes
        const grid = container.querySelector(".grid");
        expect(grid).toBeInTheDocument();
        expect(grid?.className).toMatch(/grid-cols-/);
      });
    });

    test("should render page title", async () => {
      const mockPlayers = [
        {
          id: 1,
          name: "LeBron James",
          team: "Lakers",
          position: "Forward",
          height: "6'9\"",
          weight: "250 lbs",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      render(component);

      await waitFor(() => {
        expect(screen.getByText("NBA Players Info")).toBeInTheDocument();
      });
    });
  });

  describe("edge cases", () => {
    test("should handle empty player list gracefully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      render(component);

      await waitFor(() => {
        expect(
          screen.getByText(/No player information available/i)
        ).toBeInTheDocument();
      });
    });

    test("should handle null data", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      render(component);

      await waitFor(() => {
        expect(
          screen.getByText(/No player information available/i)
        ).toBeInTheDocument();
      });
    });

    test("should display all player properties correctly", async () => {
      const mockPlayers = [
        {
          id: 42,
          name: "Test Player",
          team: "Test Team",
          position: "Center",
          height: "7'0\"",
          weight: "280 lbs",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      render(component);

      await waitFor(() => {
        expect(screen.getByText(/Player ID:/i)).toBeInTheDocument();
        expect(screen.getByText("42")).toBeInTheDocument();
        expect(screen.getByText(/Team:/i)).toBeInTheDocument();
        expect(screen.getByText("Test Team")).toBeInTheDocument();
        expect(screen.getByText(/Position:/i)).toBeInTheDocument();
        expect(screen.getByText("Center")).toBeInTheDocument();
        expect(screen.getByText(/Height:/i)).toBeInTheDocument();
        expect(screen.getByText(/7'0"/i)).toBeInTheDocument();
        expect(screen.getByText(/Weight:/i)).toBeInTheDocument();
        expect(screen.getByText(/280 lbs/i)).toBeInTheDocument();
      });
    });
  });

  describe("error scenarios", () => {
    test("should display error message on network failure", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      render(component);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to fetch player info|Network error/i)
        ).toBeInTheDocument();
      });
    });

    test("should handle API error response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      render(component);

      await waitFor(() => {
        expect(screen.getByText(/API error|500/i)).toBeInTheDocument();
      });
    });

    test("should handle 404 not found", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      render(component);

      await waitFor(() => {
        expect(screen.getByText(/404|not found/i)).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    test("should have proper heading hierarchy", async () => {
      const mockPlayers = [
        {
          id: 1,
          name: "LeBron James",
          team: "Lakers",
          position: "Forward",
          height: "6'9\"",
          weight: "250 lbs",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      const { container } = render(component);

      await waitFor(() => {
        const h1 = container.querySelector("h1");
        expect(h1).toBeInTheDocument();
        expect(h1?.textContent).toBe("NBA Players Info");
      });
    });

    test("should have accessible card structure", async () => {
      const mockPlayers = [
        {
          id: 1,
          name: "LeBron James",
          team: "Lakers",
          position: "Forward",
          height: "6'9\"",
          weight: "250 lbs",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      const { container } = render(component);

      await waitFor(() => {
        // Cards should have proper semantic structure
        const cards = container.querySelectorAll('[class*="card"]');
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    test("should have descriptive labels for player information", async () => {
      const mockPlayers = [
        {
          id: 1,
          name: "LeBron James",
          team: "Lakers",
          position: "Forward",
          height: "6'9\"",
          weight: "250 lbs",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      render(component);

      await waitFor(() => {
        // Verify all labels are present for screen readers
        expect(screen.getByText(/Player ID:/i)).toBeInTheDocument();
        expect(screen.getByText(/Team:/i)).toBeInTheDocument();
        expect(screen.getByText(/Position:/i)).toBeInTheDocument();
        expect(screen.getByText(/Height:/i)).toBeInTheDocument();
        expect(screen.getByText(/Weight:/i)).toBeInTheDocument();
      });
    });
  });

  describe("visual styling", () => {
    test("should apply hover effects to cards", async () => {
      const mockPlayers = [
        {
          id: 1,
          name: "LeBron James",
          team: "Lakers",
          position: "Forward",
          height: "6'9\"",
          weight: "250 lbs",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      const { container } = render(component);

      await waitFor(() => {
        const cards = container.querySelectorAll('[class*="hover"]');
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    test("should use proper spacing between cards", async () => {
      const mockPlayers = [
        {
          id: 1,
          name: "Player 1",
          team: "Team 1",
          position: "Forward",
          height: "6'9\"",
          weight: "250 lbs",
        },
        {
          id: 2,
          name: "Player 2",
          team: "Team 2",
          position: "Guard",
          height: "6'2\"",
          weight: "185 lbs",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      });

      const PlayersInfoPage = (
        await import("../src/app/(dashboard)/players-info/page")
      ).default;
      const component = await PlayersInfoPage();

      const { container } = render(component);

      await waitFor(() => {
        const grid = container.querySelector(".grid");
        expect(grid?.className).toMatch(/gap-/);
      });
    });
  });
});
