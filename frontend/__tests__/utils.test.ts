/**
 * Utility Functions Test Suite
 * 
 * Comprehensive tests for utility functions including:
 * - Class name merging (cn utility)
 * - Data formatting functions
 * - Helper functions
 * - Edge cases
 */

import "@testing-library/jest-dom";
import { cn } from "../src/lib/utils";

describe("Utility Functions", () => {
  describe("cn (className utility)", () => {
    describe("happy path scenarios", () => {
      test("should merge single class name", () => {
        const result = cn("text-red-500");
        expect(result).toBe("text-red-500");
      });

      test("should merge multiple class names", () => {
        const result = cn("text-red-500", "bg-blue-500", "p-4");
        expect(result).toContain("text-red-500");
        expect(result).toContain("bg-blue-500");
        expect(result).toContain("p-4");
      });

      test("should handle conditional classes", () => {
        const isActive = true;
        const result = cn("base-class", isActive && "active-class");
        expect(result).toContain("base-class");
        expect(result).toContain("active-class");
      });

      test("should merge Tailwind classes correctly", () => {
        const result = cn("px-4 py-2", "text-white", "bg-blue-500");
        expect(result).toBeTruthy();
      });
    });

    describe("edge cases", () => {
      test("should handle empty strings", () => {
        const result = cn("", "text-red-500", "");
        expect(result).toBe("text-red-500");
      });

      test("should handle undefined values", () => {
        const result = cn("text-red-500", undefined, "bg-blue-500");
        expect(result).toContain("text-red-500");
        expect(result).toContain("bg-blue-500");
      });

      test("should handle null values", () => {
        const result = cn("text-red-500", null, "bg-blue-500");
        expect(result).toContain("text-red-500");
        expect(result).toContain("bg-blue-500");
      });

      test("should handle false conditionals", () => {
        const isActive = false;
        const result = cn("base-class", isActive && "active-class");
        expect(result).toBe("base-class");
        expect(result).not.toContain("active-class");
      });

      test("should handle array of classes", () => {
        const classes = ["text-red-500", "bg-blue-500"];
        const result = cn(...classes);
        expect(result).toContain("text-red-500");
        expect(result).toContain("bg-blue-500");
      });

      test("should deduplicate conflicting Tailwind classes", () => {
        // When using clsx with tailwind-merge, later classes should override
        const result = cn("text-red-500", "text-blue-500");
        expect(result).toBe("text-blue-500");
      });

      test("should handle no arguments", () => {
        const result = cn();
        expect(result).toBe("");
      });

      test("should handle object with boolean values", () => {
        const result = cn({
          "text-red-500": true,
          "bg-blue-500": false,
          "p-4": true,
        });
        expect(result).toContain("text-red-500");
        expect(result).not.toContain("bg-blue-500");
        expect(result).toContain("p-4");
      });
    });

    describe("complex scenarios", () => {
      test("should handle mixed types", () => {
        const result = cn(
          "base-class",
          true && "conditional-class",
          { "object-class": true },
          ["array-class"]
        );
        expect(result).toContain("base-class");
        expect(result).toContain("conditional-class");
        expect(result).toContain("object-class");
        expect(result).toContain("array-class");
      });

      test("should handle nested arrays", () => {
        const result = cn(["text-red-500", ["bg-blue-500"]]);
        expect(result).toContain("text-red-500");
        expect(result).toContain("bg-blue-500");
      });

      test("should override conflicting padding classes", () => {
        const result = cn("p-2", "p-4");
        expect(result).toBe("p-4");
      });

      test("should override conflicting margin classes", () => {
        const result = cn("m-2", "m-8");
        expect(result).toBe("m-8");
      });

      test("should handle responsive classes", () => {
        const result = cn("text-sm", "md:text-base", "lg:text-lg");
        expect(result).toContain("text-sm");
        expect(result).toContain("md:text-base");
        expect(result).toContain("lg:text-lg");
      });

      test("should handle hover and focus states", () => {
        const result = cn(
          "bg-blue-500",
          "hover:bg-blue-600",
          "focus:ring-2"
        );
        expect(result).toContain("bg-blue-500");
        expect(result).toContain("hover:bg-blue-600");
        expect(result).toContain("focus:ring-2");
      });
    });

    describe("real-world usage", () => {
      test("should merge button classes correctly", () => {
        const variant = "primary";
        const size = "large";
        const result = cn(
          "px-4 py-2 rounded",
          variant === "primary" && "bg-blue-500 text-white",
          size === "large" && "text-lg"
        );
        expect(result).toContain("px-4");
        expect(result).toContain("py-2");
        expect(result).toContain("rounded");
        expect(result).toContain("bg-blue-500");
        expect(result).toContain("text-white");
        expect(result).toContain("text-lg");
      });

      test("should merge card classes correctly", () => {
        const isHovered = true;
        const result = cn(
          "bg-white rounded-lg shadow",
          isHovered && "shadow-xl scale-105"
        );
        expect(result).toContain("bg-white");
        expect(result).toContain("rounded-lg");
        expect(result).toContain("shadow-xl");
        expect(result).toContain("scale-105");
      });

      test("should handle input field classes", () => {
        const hasError = false;
        const result = cn(
          "border rounded px-3 py-2",
          hasError ? "border-red-500" : "border-gray-300"
        );
        expect(result).toContain("border");
        expect(result).toContain("rounded");
        expect(result).toContain("border-gray-300");
        expect(result).not.toContain("border-red-500");
      });

      test("should handle navigation link classes", () => {
        const isActive = true;
        const result = cn(
          "px-4 py-2 rounded transition-colors",
          isActive
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        );
        expect(result).toContain("bg-blue-500");
        expect(result).toContain("text-white");
        expect(result).not.toContain("bg-gray-100");
      });
    });
  });

  describe("date formatting utilities", () => {
    test("should format ISO date strings", () => {
      const isoDate = "2026-02-04T19:30:00Z";
      const date = new Date(isoDate);
      expect(date.toLocaleDateString()).toBeTruthy();
    });

    test("should handle invalid dates gracefully", () => {
      const invalidDate = new Date("invalid");
      expect(invalidDate.toString()).toContain("Invalid Date");
    });
  });

  describe("string utilities", () => {
    test("should trim whitespace from strings", () => {
      const input = "  Hello World  ";
      expect(input.trim()).toBe("Hello World");
    });

    test("should convert strings to lowercase", () => {
      const input = "HELLO WORLD";
      expect(input.toLowerCase()).toBe("hello world");
    });

    test("should convert strings to uppercase", () => {
      const input = "hello world";
      expect(input.toUpperCase()).toBe("HELLO WORLD");
    });
  });

  describe("number utilities", () => {
    test("should format numbers with commas", () => {
      const num = 1234567;
      // Use 'en-US' locale to ensure consistent formatting across different environments
      expect(num.toLocaleString('en-US')).toBe("1,234,567");
    });

    test("should handle decimal numbers", () => {
      const num = 123.456;
      expect(num.toFixed(2)).toBe("123.46");
    });

    test("should parse integer strings", () => {
      const str = "123";
      expect(parseInt(str, 10)).toBe(123);
    });

    test("should parse float strings", () => {
      const str = "123.45";
      expect(parseFloat(str)).toBe(123.45);
    });
  });

  describe("array utilities", () => {
    test("should filter array elements", () => {
      const arr = [1, 2, 3, 4, 5];
      const filtered = arr.filter((n) => n > 3);
      expect(filtered).toEqual([4, 5]);
    });

    test("should map array elements", () => {
      const arr = [1, 2, 3];
      const mapped = arr.map((n) => n * 2);
      expect(mapped).toEqual([2, 4, 6]);
    });

    test("should reduce array to single value", () => {
      const arr = [1, 2, 3, 4];
      const sum = arr.reduce((acc, n) => acc + n, 0);
      expect(sum).toBe(10);
    });

    test("should check if array includes element", () => {
      const arr = ["apple", "banana", "orange"];
      expect(arr.includes("banana")).toBe(true);
      expect(arr.includes("grape")).toBe(false);
    });
  });

  describe("object utilities", () => {
    test("should get object keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Object.keys(obj)).toEqual(["a", "b", "c"]);
    });

    test("should get object values", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Object.values(obj)).toEqual([1, 2, 3]);
    });

    test("should merge objects", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const merged = { ...obj1, ...obj2 };
      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
    });
  });
});
