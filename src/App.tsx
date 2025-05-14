
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SettingsProvider from "./hooks/useSettings";

// Define QueryClient outside component to prevent recreating on render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  // Setup notification channels for mobile apps
  React.useEffect(() => {
    const setupNotificationChannels = async () => {
      try {
        if (typeof window !== 'undefined' && 
            window.Capacitor && 
            window.Capacitor.isNativePlatform()) {
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          
          await LocalNotifications.createChannel({
            id: 'reminders',
            name: 'Habit Reminders',
            description: 'Notifications to remind you about your daily habits',
            importance: 5,
            visibility: 1,
            lights: true,
            vibration: true
          });
          
          await LocalNotifications.createChannel({
            id: 'streaks',
            name: 'Streak Alerts',
            description: 'Notifications about your habit streaks',
            importance: 4,
            visibility: 1,
            lights: true,
            vibration: true
          });
          
          await LocalNotifications.createChannel({
            id: 'achievements',
            name: 'Achievements',
            description: 'Notifications for habit achievements and milestones',
            importance: 3,
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
    <ThemeProvider storageKey="vite-ui-theme">
      <SettingsProvider>
        <QueryClientProvider client={queryClient}>
          <div className="antialiased min-h-screen">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
          <Sonner position="top-center" />
          <Toaster />
        </QueryClientProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
