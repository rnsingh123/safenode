/**
 * ============================================================================
 * MAIN.TSX - Application Entry Point
 * ============================================================================
 * Purpose: The root entry point of the SafeNode application
 * 
 * Flow:
 * 1. Imports React and ReactDOM root creation utilities
 * 2. Finds the #root DOM element in index.html
 * 3. Creates a React root and renders the App component
 * 4. Wraps app in StrictMode for development warnings
 * 
 * Debug Tips:
 * - If app doesn't load, check if #root element exists in index.html
 * - StrictMode may cause intentional double-renders in development
 * - Check browser console for any render errors
 * ============================================================================
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Find the root DOM container element
const container = document.getElementById('root');

// Create a React root - this is the entry point for the entire app
const root = createRoot(container!);

// Render the App component wrapped in React.StrictMode for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);