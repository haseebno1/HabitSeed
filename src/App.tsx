import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SplashScreen from "./components/SplashScreen";

// Define Capacitor interface if not available
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
    }
  }
}

// Create a new QueryClient instance outside of component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000 * 5, // 5 min
    },
  },
});

// Make App a function component to ensure proper React context
const App: React.FC = () => {
  const [splashFinished, setSplashFinished] = useState(false);
  
  // Flag for whether we should show our custom splash screen
  // Only show on first load for web, native uses the OS splash
  const shouldShowSplash = !window.Capacitor?.isNativePlatform() && 
    !sessionStorage.getItem('splashShown');
  
  // Set the flag in session storage when splash finishes
  const handleSplashFinish = () => {
    setSplashFinished(true);
    sessionStorage.setItem('splashShown', 'true');
  };
  
  useEffect(() => {
    // Initialize Android notification channels when app starts
    const setupNotificationChannels = async () => {
      try {
        if (window.Capacitor?.isNativePlatform()) {
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          
          // Create notification channels for different types of notifications
          await LocalNotifications.createChannel({
            id: 'reminders',
            name: 'Habit Reminders',
            description: 'Notifications to remind you about your daily habits',
            importance: 5, // High importance
            visibility: 1, // Public (shows on lock screen)
            lights: true,
            vibration: true
          });
          
          await LocalNotifications.createChannel({
            id: 'streaks',
            name: 'Streak Alerts',
            description: 'Notifications about your habit streaks',
            importance: 4, // Medium importance
            visibility: 1,
            lights: true,
            vibration: true
          });
          
          await LocalNotifications.createChannel({
            id: 'achievements',
            name: 'Achievements',
            description: 'Notifications for habit achievements and milestones',
            importance: 3, // Default importance
            visibility: 1,
            lights: true,
            vibration: true
          });
          
          console.log('Notification channels created');
        }
      } catch (e) {
        console.error('Error setting up notification channels:', e);
      }
    };
    
    setupNotificationChannels();
  }, []);

  return (
    <React.StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <div className="antialiased min-h-screen">
            {shouldShowSplash && !splashFinished && (
              <SplashScreen onFinish={handleSplashFinish} />
            )}
            
            <div className="max-w-2xl mx-auto">
              <main className={`flex flex-col min-h-screen ${shouldShowSplash && !splashFinished ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </main>
            </div>
          </div>
          <Sonner />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
