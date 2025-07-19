import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c9ab25d851834c41bbfe15f1f3bb5d2e',
  appName: 'mindful-sound-scapes',
  webDir: 'dist',
  server: {
    url: 'https://c9ab25d8-5183-4c41-bbfe-15f1f3bb5d2e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;