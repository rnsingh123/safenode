/**
 * ============================================================================
 * CYPRESS/SUPPORT/COMMANDS.TS - Custom Cypress Commands
 * ============================================================================
 * Purpose: Define custom Cypress commands for test automation
 * 
 * What it does:
 * - Creates reusable commands for common test actions
 * - Reduces code duplication across test files
 * - Makes tests more readable and maintainable
 * 
 * Common Custom Commands Pattern:
 * Cypress.Commands.add('login', (username, password) => {
 *   cy.visit('/login')
 *   cy.get('input[name="username"]').type(username)
 *   cy.get('input[name="password"]').type(password)
 *   cy.get('button[type="submit"]').click()
 * })
 * 
 * Usage in tests:
 * cy.login('user@example.com', 'password123')
 * 
 * Debug Tips:
 * - Add console.log() statements in commands for debugging
 * - Use cy.debug() to pause execution
 * - Check Cypress Command Log for execution order
 * - Reference: https://docs.cypress.io/api/cypress-api/custom-commands
 * ============================================================================
 */

/// <reference types="cypress" />

// ===== CUSTOM COMMANDS EXAMPLES =====
// Uncomment and customize these commands for your app:

// ===== PARENT COMMAND =====
// Parent commands: Called directly on cy object
// Example: cy.login(email, password)
// Cypress.Commands.add('login', (email: string, password: string) => { ... })

// ===== CHILD COMMAND =====
// Child commands: Called on a previous subject (element)
// Example: cy.get('form').drag({ ...))
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// ===== DUAL COMMAND =====
// Dual commands: Can be called with or without previous subject
// Example: cy.dismiss() or cy.get('button').dismiss()
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// ===== OVERRIDE EXISTING COMMAND =====
// Override built-in Cypress commands with custom logic
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// ===== TYPE DEFINITIONS =====
// Declare custom commands for TypeScript support:
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//     }
//   }
// }