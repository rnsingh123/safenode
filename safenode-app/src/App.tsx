/**
 * ============================================================================
 * APP.TSX - Main Application Router & Layout
 * ============================================================================
 * Purpose: Configures routing, imports Ionic CSS, and wraps the app with providers
 * 
 * Key Components:
 * - IonApp: Root container for Ionic framework
 * - IonReactRouter: Handles client-side routing
 * - IonRouterOutlet: Container for routed components
 * 
 * Routes:
 * - /login: Login page (default)
 * - /dashboard: Main dashboard (after login)
 * - /: Redirects to /login
 * 
 * Debug Tips:
 * - Check browser Network tab if pages don't load
 * - Check React DevTools to inspect route state
 * - Missing CSS imports will cause styling issues
 * ============================================================================
 */

import { getToken } from './services/api';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import { getUserIdentity } from './pages/Register';

// ===== IONIC CORE CSS =====
// These CSS files are required for Ionic components to function properly
import '@ionic/react/css/core.css';

// ===== IONIC BASIC STYLES =====
// Normalization and structural styles
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// ===== IONIC UTILITY CSS =====
// Optional utility classes that can be disabled for smaller bundle size
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

// ===== THEME CSS =====
import './theme/variables.css';

// Initialize Ionic React framework
setupIonicReact();

/**
 * App Component - Root component of the application
 * 
 * Structure:
 * IonApp (root)
 *   └─ IonReactRouter (routing wrapper)
 *       └─ IonRouterOutlet (renders routed components)
 *          ├─ /login → Login component
 *          ├─ /dashboard → Dashboard component
 *          └─ / → Redirect to /login
 */
const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Register Route - First-time setup (shown once) */}
        <Route exact path="/register" component={Register} />

        {/* Login Route */}
        <Route exact path="/login" component={Login} />
        
        {/* Dashboard Route - Main app after authentication */}
        <Route exact path="/dashboard" component={Dashboard} />
        
        {/* Default Route - Go to register if first time, else login */}
        <Route exact path="/">
  {getUserIdentity() ? (
    getToken() ? (
      <Redirect to="/dashboard" />
    ) : (
      <Redirect to="/login" />
    )
  ) : (
    <Redirect to="/register" />
  )}
</Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
