/**
 * ============================================================================
 * EXPLORECONTAINER.TSX - Example Container Component
 * ============================================================================
 * Purpose: Template component for exploring and building with Ionic
 * 
 * Note: This component is likely not used in the main app flow.
 * It serves as a starting template for new screens/containers.
 * 
 * Debug Tips:
 * - Check if this component is imported/used in any route
 * - Can be removed if not needed in production
 * ============================================================================
 */

import './ExploreContainer.css';

// Type definition for component props (currently empty)
interface ContainerProps { }

/**
 * ExploreContainer - Template component
 * Displays welcome message with link to Ionic documentation
 */
const ExploreContainer: React.FC<ContainerProps> = () => {
  return (
    <div id="container">
      <strong>Ready to create an app?</strong>
      <p>
        Start with Ionic{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://ionicframework.com/docs/components"
        >
          UI Components
        </a>
      </p>
    </div>
  );
};

export default ExploreContainer;
