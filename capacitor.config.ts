import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.habitseed.app',
  appName: 'Habit Seed',
  webDir: 'dist',
  bundledWebRuntime: false,
  // Comment out server config for production build
  /*
  server: {
    url: 'http://192.168.0.101:5173',
    cleartext: true
  },
  */
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
    // Enable AndroidX
    androidxEnabled: true,
    // Enable permissions
    permissions: [
      "RECEIVE_BOOT_COMPLETED",
      "SCHEDULE_EXACT_ALARM"
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f8fafc", // Light mode bg
      androidSplashResourceName: "splash",
      showSpinner: false
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#18a058"
    }
  }
};

export default config;
