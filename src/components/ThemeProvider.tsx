import React, { createContext, useContext, useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { applyThemeColors, getThemeById } from "@/lib/themes";

export type Theme = 'default' | 'ocean' | 'sunset' | 'nature';
export type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colorMode: ColorMode;
  setTheme: (theme: Theme) => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  colorMode: 'light',
  setTheme: () => {},
  toggleColorMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get initial theme and color mode from localStorage or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('themeId') as Theme;
    return savedTheme || 'default';
  });
  
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    const savedMode = localStorage.getItem('colorMode') as ColorMode;
    if (savedMode) return savedMode;
    
    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // Set theme function
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('themeId', newTheme);
    applyThemeColors(newTheme, colorMode === 'dark');
  };

  // Toggle color mode function
  const toggleColorMode = () => {
    setColorMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('colorMode', newMode);
      return newMode;
    });
  };

  // Apply theme class and colors to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (colorMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply the theme colors
    applyThemeColors(theme, colorMode === 'dark');
  }, [theme, colorMode]);

  return (
    <ThemeContext.Provider value={{ theme, colorMode, setTheme, toggleColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeToggle: React.FC = () => {
  const { colorMode, toggleColorMode } = useTheme();
  
  return (
    <button 
      onClick={toggleColorMode}
      className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
      aria-label="Toggle theme"
    >
      {colorMode === 'light' ? (
        <Moon className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Sun className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );
};
