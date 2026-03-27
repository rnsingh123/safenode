/**
 * ============================================================================
 * CYPRESS/E2E/TEST.CY.TS - Example End-to-End Tests
 * ============================================================================
 * Purpose: Automated E2E tests for the SafeNode application
 * 
 * What it tests:
 * - App loads and renders root page
 * - Page contains expected UI elements
 * 
 * Running tests:
 * npm run test:e2e           - Run tests in headless mode
 * npm run test:e2e:open    - Open Cypress Test Runner GUI
 * 
 * Debug Tips:
 * - Use cy.pause() to pause at specific points
 * - Check Cypress Command Log for step-by-step execution
 * - Use cy.debug() to log values to console
 * - Take screenshots on failure: cy.screenshot()
 * - Reference: https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests
 * ============================================================================
 */

// Test suite for the application
describe('My First Test', () => {
  // Individual test case
  it('Visits the app root url', () => {
    // Navigate to the app root
    cy.visit('/')
    
    // Verify the page contains the expected element and text
    // This test ensures the home page container renders with correct content
    cy.contains('#container', 'Ready to create an app?')
  })
})