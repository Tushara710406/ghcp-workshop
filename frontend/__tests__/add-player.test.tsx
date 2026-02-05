/**
 * Add Player Form Test Suite
 * 
 * Comprehensive tests for the Add Player form component including:
 * - Form rendering
 * - Input validation
 * - Form submission
 * - Error handling
 * - Success states
 * - Accessibility
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock fetch globally
global.fetch = jest.fn();

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: "/add-player",
  }),
}));

describe("Add Player Form", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("form rendering", () => {
    test("should render all form fields", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      // Verify all input fields are present
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/team/i)).toBeInTheDocument();
    });

    test("should render submit button", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      const submitButton = screen.getByRole("button", {
        name: /create player/i,
      });
      expect(submitButton).toBeInTheDocument();
    });

    test("should render form title", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      expect(screen.getByText(/create new nba player/i)).toBeInTheDocument();
    });

    test("should have empty inputs initially", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const positionInput = screen.getByLabelText(
        /position/i
      ) as HTMLInputElement;
      const teamInput = screen.getByLabelText(/team/i) as HTMLInputElement;

      expect(nameInput.value).toBe("");
      expect(positionInput.value).toBe("");
      expect(teamInput.value).toBe("");
    });
  });

  describe("form input handling", () => {
    test("should update name input on change", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: "LeBron James" } });

      expect(nameInput.value).toBe("LeBron James");
    });

    test("should update position input on change", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      const positionInput = screen.getByLabelText(
        /position/i
      ) as HTMLInputElement;
      fireEvent.change(positionInput, { target: { value: "Forward" } });

      expect(positionInput.value).toBe("Forward");
    });

    test("should update team input on change", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      const teamInput = screen.getByLabelText(/team/i) as HTMLInputElement;
      fireEvent.change(teamInput, { target: { value: "Lakers" } });

      expect(teamInput.value).toBe("Lakers");
    });

    test("should handle multiple field updates", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const positionInput = screen.getByLabelText(
        /position/i
      ) as HTMLInputElement;
      const teamInput = screen.getByLabelText(/team/i) as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: "Stephen Curry" } });
      fireEvent.change(positionInput, { target: { value: "Guard" } });
      fireEvent.change(teamInput, { target: { value: "Warriors" } });

      expect(nameInput.value).toBe("Stephen Curry");
      expect(positionInput.value).toBe("Guard");
      expect(teamInput.value).toBe("Warriors");
    });
  });

  describe("form submission - happy path", () => {
    test("should submit form successfully", async () => {
      const mockResponse = {
        id: 1,
        name: "LeBron James",
        position: "Forward",
        team: "Lakers",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "LeBron James" },
      });
      fireEvent.change(screen.getByLabelText(/position/i), {
        target: { value: "Forward" },
      });
      fireEvent.change(screen.getByLabelText(/team/i), {
        target: { value: "Lakers" },
      });

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create player/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/players"),
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "LeBron James",
              position: "Forward",
              team: "Lakers",
            }),
          })
        );
      });
    });

    test("should show success message after successful submission", async () => {
      const mockResponse = {
        id: 1,
        name: "LeBron James",
        position: "Forward",
        team: "Lakers",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "LeBron James" },
      });
      fireEvent.change(screen.getByLabelText(/position/i), {
        target: { value: "Forward" },
      });
      fireEvent.change(screen.getByLabelText(/team/i), {
        target: { value: "Lakers" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /create player/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/player created successfully/i)
        ).toBeInTheDocument();
      });
    });

    test("should clear form after successful submission", async () => {
      const mockResponse = {
        id: 1,
        name: "LeBron James",
        position: "Forward",
        team: "Lakers",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      // Fill and submit form
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const positionInput = screen.getByLabelText(
        /position/i
      ) as HTMLInputElement;
      const teamInput = screen.getByLabelText(/team/i) as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: "LeBron James" } });
      fireEvent.change(positionInput, { target: { value: "Forward" } });
      fireEvent.change(teamInput, { target: { value: "Lakers" } });
      fireEvent.click(
        screen.getByRole("button", { name: /create player/i })
      );

      await waitFor(() => {
        expect(nameInput.value).toBe("");
        expect(positionInput.value).toBe("");
        expect(teamInput.value).toBe("");
      });
    });
  });

  describe("form validation", () => {
    test("should require name field", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAttribute("required");
    });

    test("should require position field", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      const positionInput = screen.getByLabelText(/position/i);
      expect(positionInput).toHaveAttribute("required");
    });

    test("should require team field", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      const teamInput = screen.getByLabelText(/team/i);
      expect(teamInput).toHaveAttribute("required");
    });
  });

  describe("error scenarios", () => {
    test("should display error on network failure", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "LeBron James" },
      });
      fireEvent.change(screen.getByLabelText(/position/i), {
        target: { value: "Forward" },
      });
      fireEvent.change(screen.getByLabelText(/team/i), {
        target: { value: "Lakers" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /create player/i })
      );

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    test("should display error on 404 response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "LeBron James" },
      });
      fireEvent.change(screen.getByLabelText(/position/i), {
        target: { value: "Forward" },
      });
      fireEvent.change(screen.getByLabelText(/team/i), {
        target: { value: "Lakers" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /create player/i })
      );

      await waitFor(() => {
        expect(screen.getByText(/404|not found/i)).toBeInTheDocument();
      });
    });

    test("should display error on 500 server error", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "LeBron James" },
      });
      fireEvent.change(screen.getByLabelText(/position/i), {
        target: { value: "Forward" },
      });
      fireEvent.change(screen.getByLabelText(/team/i), {
        target: { value: "Lakers" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /create player/i })
      );

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });
  });

  describe("loading states", () => {
    test("should disable button during submission", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ ok: true, json: async () => ({}) }),
              100
            )
          )
      );

      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "LeBron James" },
      });
      fireEvent.change(screen.getByLabelText(/position/i), {
        target: { value: "Forward" },
      });
      fireEvent.change(screen.getByLabelText(/team/i), {
        target: { value: "Lakers" },
      });

      const submitButton = screen.getByRole("button", {
        name: /create player/i,
      });
      fireEvent.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });

    test("should show loading text during submission", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ ok: true, json: async () => ({}) }),
              100
            )
          )
      );

      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "LeBron James" },
      });
      fireEvent.change(screen.getByLabelText(/position/i), {
        target: { value: "Forward" },
      });
      fireEvent.change(screen.getByLabelText(/team/i), {
        target: { value: "Lakers" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /create player/i })
      );

      // Should show loading state
      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    test("should have proper form labels", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      // All inputs should have associated labels
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/team/i)).toBeInTheDocument();
    });

    test("should have descriptive button text", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      render(<AddPlayerPage />);

      const submitButton = screen.getByRole("button", {
        name: /create player/i,
      });
      expect(submitButton).toHaveTextContent(/create player/i);
    });

    test("should have proper heading structure", async () => {
      const AddPlayerPage = (
        await import("../src/app/(dashboard)/add-player/page")
      ).default;

      const { container } = render(<AddPlayerPage />);

      const heading = container.querySelector("h1, h2, h3");
      expect(heading).toBeInTheDocument();
    });
  });
});
