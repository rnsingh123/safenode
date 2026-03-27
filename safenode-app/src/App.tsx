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

import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

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
import '@ionic/react/css/palettes/dark.system.css';
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
        {/* Login Route - First page users see */}
        <Route exact path="/login" component={Login} />
        
        {/* Dashboard Route - Main app after authentication */}
        <Route exact path="/dashboard" component={Dashboard} />
        
        {/* Default Route - Redirect to login */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
