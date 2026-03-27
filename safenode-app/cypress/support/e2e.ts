/**
 * ============================================================================
 * CYPRESS/SUPPORT/E2E.TS - Cypress End-to-End Test Configuration
 * ============================================================================
 * Purpose: Global setup and configuration for Cypress E2E tests
 * 
 * What it does:
 * - Loads custom commands and helpers before running tests
 * - Sets up global configurations for all test files
 * - Imports support utilities
 * 
 * Debug Tips:
 * - This file runs before EVERY e2e test
 * - Add global commands here if needed by multiple tests
 * - Check Cypress logs in terminal for any setup errors
 * - See: https://docs.cypress.io/guides/references/best-practices
 * ============================================================================
 */

// ===== IMPORT CUSTOM COMMANDS =====
// Import custom commands and helpers defined in commands.ts
// These are available to all test files
import './commands'

// Alternative import syntax (CommonJS) - both work:
// require('./commands')