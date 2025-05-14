
import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SplashScreen from "./components/SplashScreen";
import OnboardingModal from "./components/OnboardingModal";
import DevTools from "./pages/DevTools";
import { SettingsProvider } from "@/hooks/useSettings";

// Define QueryClient outside component to prevent recreating on render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dev" element={<DevTools />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

// Make App a function component to ensure proper React context
const App: React.FC = () => {
  const [splashFinished, setSplashFinished] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  
  // Flag for whether we should show our custom splash screen
  // Only show on first load for web, native uses the OS splash
  const shouldShowSplash = !window.Capacitor?.isNativePlatform() && 
    !sessionStorage.getItem('splashShown');
  
  // Set the flag in session storage when splash finishes
  const handleSplashFinish = () => {
    setSplashFinished(true);
    sessionStorage.setItem('splashShown', 'true');
    
    // Check if user has completed onboarding
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    setOnboardingComplete(!!hasSeenOnboarding);
  };
  
  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
  };
  
  useEffect(() => {
    // Initialize Android notification channels when app starts
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
    <ThemeProvider>
      <SettingsProvider>
        <QueryClientProvider client={queryClient}>
          <div className="antialiased min-h-screen">
            {shouldShowSplash && !splashFinished && (
              <SplashScreen onFinish={handleSplashFinish} />
            )}
            
            <div className="h-full">
              <main className={`flex flex-col min-h-screen ${shouldShowSplash && !splashFinished ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}>
                <BrowserRouter>
                  <AnimatedRoutes />
                </BrowserRouter>
              </main>
            </div>
          </div>
          <OnboardingModal onComplete={handleOnboardingComplete} />
          <Sonner />
          <Toaster />
        </QueryClientProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
