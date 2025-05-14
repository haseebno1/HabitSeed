
import React, { createContext, useContext, useState, useEffect } from "react";
import storage from "@/lib/storage";

interface SettingsContextType {
  // Habit Preferences
  maxHabits: number;
  setMaxHabits: (value: number) => void;
  
  // App Preferences
  showStreakBadges: boolean; 
  setShowStreakBadges: (value: boolean) => void;
  
  // Data Management
  clearAllData: () => void;
  
  // State
  isInitialized: boolean;
}

const defaultSettings: Omit<SettingsContextType, 'setMaxHabits' | 'setShowStreakBadges' | 'clearAllData' | 'isInitialized'> = {
  maxHabits: 3,
  showStreakBadges: true,
};

const SettingsContext = createContext<SettingsContextType>({
  ...defaultSettings,
  setMaxHabits: () => {},
  setShowStreakBadges: () => {},
  clearAllData: () => {},
  isInitialized: false
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // Initialize settings from storage or use defaults
  const [settings, setSettings] = useState(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await storage.getSettings();
        
        if (storedSettings) {
          setSettings({
            ...defaultSettings,
            ...storedSettings
          });
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading settings from IndexedDB:", error);
        
        // Fallback to localStorage
        try {
          const savedSettings = localStorage.getItem('habit-seed-settings');
          if (savedSettings) {
            setSettings({
              ...defaultSettings,
              ...JSON.parse(savedSettings)
            });
          }
        } catch (e) {
          console.error('Failed to parse settings from localStorage:', e);
        }
        
        setIsInitialized(true);
      }
    };
    
    // Call loadSettings immediately and handle any promise rejections
    loadSettings().catch(err => {
      console.error("Failed to load settings:", err);
      setIsInitialized(true); // Ensure we still set initialized even if there's an error
    });
  }, []);
  
  // Update storage when settings change
  useEffect(() => {
    if (!isInitialized) return;
    
    const saveSettings = async () => {
      try {
        await storage.saveSettings(settings);
      } catch (error) {
        console.error("Error saving settings to IndexedDB:", error);
        
        // Fallback to localStorage
        localStorage.setItem('habit-seed-settings', JSON.stringify(settings));
      }
    };
    
    saveSettings();
  }, [settings, isInitialized]);
  
  // Individual setters for each setting
  const setMaxHabits = (value: number) => {
    setSettings(prev => ({ ...prev, maxHabits: value }));
  };
  
  const setShowStreakBadges = (value: boolean) => {
    setSettings(prev => ({ ...prev, showStreakBadges: value }));
  };
  
  // Function to clear all data (settings and habits)
  const clearAllData = async () => {
    try {
      // Clear habits
      await storage.saveHabits([]);
      
      // Clear completions
      await storage.clearCompletions();
      
      // Reset settings to defaults but keep them in DB
      await storage.saveSettings(defaultSettings);
      setSettings(defaultSettings);
      
      // Reload page to apply changes
      window.location.reload();
    } catch (error) {
      console.error("Error clearing data from IndexedDB:", error);
      
      // Fallback to localStorage
      localStorage.clear();
      
      // Reset settings
      setSettings(defaultSettings);
      
      // Reload page to apply changes
      window.location.reload();
    }
  };
  
  return (
    <SettingsContext.Provider 
      value={{ 
        ...settings, 
        setMaxHabits,
        setShowStreakBadges,
        clearAllData,
        isInitialized
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider; 
