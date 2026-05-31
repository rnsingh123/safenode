/**
 * firebase.js — Firebase Admin SDK initializer
 *
 * Used to verify Firebase ID tokens sent from the React app.
 * The React app uses Firebase Phone Auth to get an idToken,
 * then sends it here for verification before issuing our own JWT.
 *
 * Setup:
 *  1. Go to Firebase Console → Project Settings → Service Accounts
 *  2. Click "Generate new private key" → download JSON file
 *  3. Set FIREBASE_SERVICE_ACCOUNT env var to the JSON content (stringified)
 *     OR set FIREBASE_SERVICE_ACCOUNT_PATH to the file path
 */

const admin = require('firebase-admin');

let initialized = false;

const initFirebase = () => {
  if (initialized) return;

  try {
    // Option A: Service account JSON as environment variable (recommended for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[Firebase] Initialized from env variable');
    }
    // Option B: Service account JSON file path
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const path = require('path');
      // Resolve relative to project root (safenode-backend/), not this file
      const absolutePath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const serviceAccount = require(absolutePath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[Firebase] Initialized from file path');
    }
    else {
      // No Firebase config — auth will fall back to password mode
      console.warn('[Firebase] No service account configured. Firebase auth disabled.');
      return;
    }
    initialized = true;
  } catch (err) {
    console.error('[Firebase] Init failed:', err.message);
  }
};

/**
 * Verify a Firebase ID token from the client.
 * Returns the decoded token (contains uid, phone_number, etc.)
 * Throws if token is invalid or expired.
 */
const verifyFirebaseToken = async (idToken) => {
  if (!initialized) throw new Error('Firebase not initialized');
  return admin.auth().verifyIdToken(idToken);
};

module.exports = { initFirebase, verifyFirebaseToken };
