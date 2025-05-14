import React, { useEffect } from "react";
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
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform();

  useEffect(() => {
    // Try to use Capacitor StatusBar plugin if available
    const initStatusBar = async () => {
      try {
        if (window.Capacitor?.isNativePlatform()) {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          StatusBar.setOverlaysWebView({ overlay: false });
          StatusBar.setBackgroundColor({ color: '#ffffff' });
          // Use dark text for light theme status bar
          StatusBar.setStyle({ style: Style.Dark });
        }
      } catch (e) {
        console.log('StatusBar plugin not available', e);
      }
    };
    
    initStatusBar();
  }, []);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto pt-safe pb-safe">
      {/* Android status bar spacer - only for native app */}
      {isNative && <div className="h-7 bg-background" id="status-bar-spacer"></div>}
      
      <header className="py-4 flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-5">
        <h1 className="text-2xl font-bold flex items-center">
          <span className="text-primary mr-1">Habit</span>Seed
          <span className="ml-1 text-xl">🌱</span>
        </h1>
        {location.pathname !== "/settings" && <ThemeToggle />}
      </header>
      
      <main className="flex-1 flex flex-col px-4 py-2">
        {children}
      </main>
      
      <footer className="py-2 border-t mt-auto bg-background fixed bottom-0 left-0 right-0 z-10">
        <nav className="flex justify-around max-w-md mx-auto">
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
      
      {/* Add extra space at the bottom to account for fixed footer */}
      <div className="h-20"></div>
    </div>
  );
};

export default Layout;
