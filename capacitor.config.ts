import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.habitseed.app',
  appName: 'HabitSeed',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
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
      smallIcon: "ic_stat_leaf",
      iconColor: "#22c55e"
    }
  }
};

export default config;
