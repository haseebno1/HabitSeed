# 🌱 Habit Seed

A simple, beautiful habit tracker that helps you grow your routines—one small step at a time.

## Features

- 📝 Create and track daily habits
- 🗓️ View progress in a weekly journal view
- 📊 See statistics about your habits
- 🌓 Light/dark mode
- 📱 Works as a web app or native Android app
- 🔒 Private and secure - all data stays on your device

## Tech Stack

- React + TypeScript
- Vite
- TailwindCSS
- Capacitor for Android
- IndexedDB / Capacitor Preferences for storage

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm
- For Android development:
  - Android Studio
  - JDK 11+
  - Android SDK

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/habit-seed.git
cd habit-seed
```

2. Install dependencies:
```bash
npm install
```

3. Run the web app in development mode:
```bash
npm run dev
```

### Building for Web

To build the web application:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Android Development

### First-time setup

1. Install Android Studio
2. Install required SDKs through Android Studio's SDK Manager
3. Set up environment variables:
   - `ANDROID_HOME` pointing to your Android SDK location
   - Add platform-tools to your PATH

### Building for Android

1. Build the web app and sync with Android:
```bash
npm run build:android
```

2. Open the Android project in Android Studio:
```bash
npm run open:android
```

3. Run the Android app on a connected device or emulator:
```bash
npm run run:android
```

### Manually update Android files

If you've made changes to the Capacitor configuration:

```bash
npm run sync:android
```

## Project Structure

```
habit-seed/
├── android/              # Android native files (generated)
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and services
│   ├── pages/            # App pages/screens
│   └── App.tsx           # Main component
├── capacitor.config.ts   # Capacitor configuration
├── index.html            # Entry HTML file
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # TailwindCSS configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md             # Project documentation
```

## Data Storage

Habit Seed uses different storage mechanisms depending on the platform:

- Web app: Uses IndexedDB with localStorage fallback
- Android app: Uses Capacitor Preferences API

All data is stored locally on the user's device for maximum privacy.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons from [Lucide Icons](https://lucide.dev/)
