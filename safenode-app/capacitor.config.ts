import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.safenode.app',       // unique app ID — change to your domain
  appName: 'SafeNode',             // name shown on phone home screen
  webDir: 'dist',                  // Vite build output folder
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2e7d32',  // matches --clr-primary
      showSpinner: false,
    },
  },
};

export default config;
