# 🌱 HabitSeed

A beautiful, intuitive habit tracking app designed to help you build consistent routines—one day at a time.

## ✨ Features

- 📝 Create and track daily habits with customizable colors
- 🔄 Track streaks and habit completion statistics
- 🗓️ Journal view to review your weekly progress
- 📊 Visual statistics to monitor your habit consistency
- 🌓 Dark/light theme with customizable appearance
- 💾 Data backup and restore capabilities
- 📱 Responsive design for mobile and desktop
- 🔒 Privacy-focused: all data stays on your device

## 🛠️ Tech Stack

- React 18 with TypeScript
- Vite for fast builds and development
- TailwindCSS with shadcn/ui components
- Lucide for beautiful icons
- IndexedDB for robust data storage
- Capacitor for mobile platform compatibility

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- For Android builds:
  - Android Studio
  - JDK 11+
  - Android SDK

### Installation

1. Clone the repository:
```bash
git clone https://github.com/haseebno1/habit-spark-check-33.git
cd habit-spark-check-33
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to start using the app.

### Building for Production

To build the web application:

```bash
npm run build
```

The built files will be in the `dist` directory and can be deployed to any static hosting service.

## 📱 Mobile Development

### Setting Up for Android

1. Build the web app and copy assets to Android:
```bash
npm run build
npx cap sync android
```

2. Open in Android Studio:
```bash
npx cap open android
```

3. Run on a device or emulator through Android Studio

## 📂 Project Structure

```
habit-spark/
├── src/
│   ├── components/       # UI components (HabitButton, HabitList, etc.)
│   ├── hooks/            # Custom React hooks (useHabits, useSettings)
│   ├── lib/              # Utilities and services (storage, haptics)
│   ├── pages/            # App pages (Index, Journal, Settings)
│   └── App.tsx           # Main component with routing
├── public/               # Static assets
├── index.html            # Entry HTML file
├── package.json          # Dependencies and scripts
├── tailwind.config.ts    # TailwindCSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 💾 Data Management

HabitSeed stores all your data locally:

- Uses IndexedDB for primary storage
- Provides localStorage fallback for older browsers
- Ensures your habit data remains private and secure
- Enables data backup and restore via JSON export/import

## ⚙️ Settings & Customization

The app includes a comprehensive settings page:

- **Appearance**: Toggle between light and dark themes
- **Preferences**: Customize habit limits and behavior
- **Data Management**: Backup, restore, and reset data
- **About**: Information about the app and developer

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or open issues to suggest improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons from [Lucide Icons](https://lucide.dev/)
- Storage implementations inspired by [Capacitor Storage](https://capacitorjs.com/docs/apis/storage)
