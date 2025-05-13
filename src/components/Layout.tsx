
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarCheck } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4">
      <header className="py-6">
        <h1 className="text-2xl font-bold flex items-center">
          <span className="text-primary mr-2">Habit</span>Seed
          <span className="ml-2 text-xl">🌱</span>
        </h1>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="py-4 border-t">
        <nav className="flex justify-around">
          <Link 
            to="/" 
            className={`p-3 flex flex-col items-center ${
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs">Today</span>
          </Link>
          <Link 
            to="/journal" 
            className={`p-3 flex flex-col items-center ${
              location.pathname === "/journal" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <CalendarCheck className="h-5 w-5 mb-1" />
            <span className="text-xs">Journal</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Layout;
