<<<<<<< HEAD
import React, { useEffect, useState } from "react";
=======

import React, { useEffect } from "react";
>>>>>>> eae7839bab8c318ed91a374c5239baeeb73a49e4
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarCheck, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeProvider";

// Define Capacitor interface if not available
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
    }
  }
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isNative, setIsNative] = useState(false);
  
  useEffect(() => {
    // Check if running in Capacitor
    setIsNative(typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform());
    
    // Try to use Capacitor StatusBar plugin if available
    const initStatusBar = async () => {
      try {
        if (window.Capacitor?.isNativePlatform()) {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          // Set status bar style based on theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          StatusBar.setOverlaysWebView({ overlay: false });
          StatusBar.setBackgroundColor({ color: prefersDark ? '#121212' : '#ffffff' });
          StatusBar.setStyle({ style: prefersDark ? Style.Light : Style.Dark });
          
          // Listen for theme changes
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            StatusBar.setBackgroundColor({ color: e.matches ? '#121212' : '#ffffff' });
            StatusBar.setStyle({ style: e.matches ? Style.Light : Style.Dark });
          });
        }
      } catch (e) {
        console.log('StatusBar plugin not available', e);
      }
    };
    
    initStatusBar();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Android status bar spacer - only for native app */}
      {isNative && (
        <div className="h-[env(safe-area-inset-top)] bg-background min-h-[28px]" id="status-bar-spacer"></div>
      )}
      
      {/* Consistent header width */}
      <header className="py-4 flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="w-full max-w-md mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="text-primary mr-1">Habit</span>Seed
            <span className="ml-1 text-xl">🌱</span>
          </h1>
          {location.pathname !== "/settings" && <ThemeToggle />}
        </div>
      </header>
      
      {/* Consistent content width */}
      <main className="flex-1 flex flex-col mb-20 w-full">
        <div className="w-full max-w-md mx-auto px-4 py-4">
          {children}
        </div>
      </main>
      
      {/* Consistent footer width */}
      <footer className="py-2 border-t bg-background fixed bottom-0 left-0 right-0 z-10 h-[calc(64px+env(safe-area-inset-bottom))]">
        <nav className="flex justify-around max-w-md mx-auto px-2">
          <Link 
            to="/" 
            className={`p-4 flex flex-col items-center ${
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
            aria-label="Today"
          >
            <Home className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Today</span>
          </Link>
          <Link 
            to="/journal" 
            className={`p-4 flex flex-col items-center ${
              location.pathname === "/journal" ? "text-primary" : "text-muted-foreground"
            }`}
            aria-label="Journal"
          >
            <CalendarCheck className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Journal</span>
          </Link>
          <Link 
            to="/settings" 
            className={`p-4 flex flex-col items-center ${
              location.pathname === "/settings" ? "text-primary" : "text-muted-foreground"
            }`}
            aria-label="Settings"
          >
            <Settings className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Layout;
