import { multiply } from './calculator';

// create unit tests for calculator.js using Jest and Copilot
describe('multiply', () => {
    it('should return the product of two positive numbers', () => {
        expect(multiply(2, 3)).toBe(6);
    });

    it('should return the product of a positive and a negative number', () => {
        expect(multiply(-4, 5)).toBe(-20);
    });

    it('should return the product of two negative numbers', () => {
        expect(multiply(-2, -8)).toBe(16);
    });

    it('should return 0 if one of the arguments is 0', () => {
        expect(multiply(0, 10)).toBe(0);
        expect(multiply(7, 0)).toBe(0);
    });

    it('should handle multiplication with floating point numbers', () => {
        expect(multiply(2.5, 4)).toBeCloseTo(10);
        expect(multiply(-3.2, 2)).toBeCloseTo(-6.4);
    });

    it('should handle multiplication with very large numbers', () => {
        expect(multiply(1e10, 3)).toBe(3e10);
    });
});
