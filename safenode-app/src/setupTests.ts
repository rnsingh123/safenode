/**
 * ============================================================================
 * SETUPTEST.TS - Jest Testing Configuration
 * ============================================================================
 * Purpose: Configures testing environment before running test files
 * 
 * What it does:
 * 1. Extends Jest matchers with testing-library/jest-dom assertions
 * 2. Mocks window.matchMedia API for responsive design testing
 * 
 * Debug Tips:
 * - Tests may fail if matchMedia is not mocked
 * - Check Jest configuration in package.json if tests don't run
 * - Use 'npm test' to run tests in watch mode
 * ============================================================================
 */

// jest-dom adds custom Jest matchers for asserting on DOM nodes
// Allows assertions like: expect(element).toHaveTextContent(/react/i)
// See: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// Mock the matchMedia API
// Used for testing responsive design and media queries
// Returns a mock object with default non-matching behavior
window.matchMedia = window.matchMedia || function() {
  return {
      // Media query does not match
      matches: false,
      // Mock listener functions for backwards compatibility
      addListener: function() {},
      removeListener: function() {}
  };
};
