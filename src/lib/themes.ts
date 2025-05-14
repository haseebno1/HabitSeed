import { Theme } from "@/components/ThemeProvider";

export interface ThemeDefinition {
  name: string;
  id: Theme;
  emoji: string;
  description: string;
  colors: {
    light: Record<string, string>;
    dark?: Record<string, string>;
  };
}

// Define available themes
export const themes: ThemeDefinition[] = [
  {
    name: "Default",
    id: "default",
    emoji: "🌱",
    description: "The standard green theme",
    colors: {
      light: {
        "--background": "60 25% 98%",
        "--foreground": "120 4% 10%",
        "--card": "0 0% 100%",
        "--card-foreground": "120 4% 10%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "120 4% 10%",
        "--primary": "142 72% 29%",
        "--primary-foreground": "60 30% 98%",
        "--secondary": "95 75% 88%",
        "--secondary-foreground": "120 4% 10%",
        "--muted": "60 15% 93%",
        "--muted-foreground": "120 3% 46%",
        "--accent": "120 67% 90%",
        "--accent-foreground": "120 4% 10%",
        "--destructive": "0 72% 51%",
        "--destructive-foreground": "60 30% 98%",
        "--border": "120 5% 88%",
        "--input": "120 5% 88%",
        "--ring": "142 72% 39%"
      },
      dark: {
        "--background": "120 15% 8%",
        "--foreground": "60 30% 96%",
        "--card": "120 15% 11%",
        "--card-foreground": "60 30% 96%",
        "--popover": "120 15% 10%",
        "--popover-foreground": "60 30% 96%",
        "--primary": "142 50% 45%",
        "--primary-foreground": "120 5% 10%",
        "--secondary": "95 20% 20%",
        "--secondary-foreground": "60 30% 96%",
        "--muted": "120 15% 15%",
        "--muted-foreground": "60 10% 65%",
        "--accent": "120 20% 20%",
        "--accent-foreground": "60 30% 96%",
        "--destructive": "0 72% 51%",
        "--destructive-foreground": "60 30% 96%",
        "--border": "120 15% 20%",
        "--input": "120 15% 20%",
        "--ring": "142 50% 45%"
      }
    }
  },
  {
    name: "Ocean",
    id: "ocean",
    emoji: "🌊",
    description: "Calming blue tones",
    colors: {
      light: {
        "--background": "210 25% 98%",
        "--foreground": "220 4% 10%",
        "--card": "0 0% 100%",
        "--card-foreground": "220 4% 10%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "220 4% 10%",
        "--primary": "210 92% 45%",
        "--primary-foreground": "210 30% 98%",
        "--secondary": "200 75% 88%",
        "--secondary-foreground": "220 4% 10%",
        "--muted": "210 15% 93%",
        "--muted-foreground": "220 3% 46%",
        "--accent": "200 67% 90%",
        "--accent-foreground": "220 4% 10%",
        "--destructive": "0 72% 51%",
        "--destructive-foreground": "210 30% 98%",
        "--border": "220 5% 88%",
        "--input": "220 5% 88%",
        "--ring": "210 92% 45%"
      },
      dark: {
        "--background": "220 25% 10%",
        "--foreground": "210 30% 96%",
        "--card": "220 25% 13%",
        "--card-foreground": "210 30% 96%",
        "--popover": "220 25% 12%",
        "--popover-foreground": "210 30% 96%",
        "--primary": "210 92% 55%",
        "--primary-foreground": "220 5% 10%",
        "--secondary": "200 20% 20%",
        "--secondary-foreground": "210 30% 96%",
        "--muted": "220 15% 15%",
        "--muted-foreground": "210 10% 65%",
        "--accent": "200 20% 20%",
        "--accent-foreground": "210 30% 96%",
        "--destructive": "0 72% 51%",
        "--destructive-foreground": "210 30% 96%",
        "--border": "220 15% 20%",
        "--input": "220 15% 20%",
        "--ring": "210 92% 55%"
      }
    }
  },
  {
    name: "Sunset",
    id: "sunset",
    emoji: "🌅",
    description: "Warm orange and purple tones",
    colors: {
      light: {
        "--background": "35 25% 98%",
        "--foreground": "20 4% 10%",
        "--card": "0 0% 100%",
        "--card-foreground": "20 4% 10%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "20 4% 10%",
        "--primary": "25 95% 50%",
        "--primary-foreground": "35 30% 98%",
        "--secondary": "15 75% 90%",
        "--secondary-foreground": "20 4% 10%",
        "--muted": "35 15% 93%",
        "--muted-foreground": "20 3% 46%",
        "--accent": "15 67% 90%",
        "--accent-foreground": "20 4% 10%",
        "--destructive": "0 72% 51%",
        "--destructive-foreground": "35 30% 98%",
        "--border": "20 5% 88%",
        "--input": "20 5% 88%",
        "--ring": "25 95% 50%"
      },
      dark: {
        "--background": "280 25% 12%",
        "--foreground": "35 30% 96%",
        "--card": "280 25% 15%",
        "--card-foreground": "35 30% 96%",
        "--popover": "280 25% 14%",
        "--popover-foreground": "35 30% 96%",
        "--primary": "25 95% 50%",
        "--primary-foreground": "280 5% 10%",
        "--secondary": "300 20% 25%",
        "--secondary-foreground": "35 30% 96%",
        "--muted": "280 15% 18%",
        "--muted-foreground": "35 10% 65%",
        "--accent": "300 20% 25%",
        "--accent-foreground": "35 30% 96%",
        "--destructive": "0 72% 51%",
        "--destructive-foreground": "35 30% 96%",
        "--border": "280 15% 25%",
        "--input": "280 15% 25%",
        "--ring": "25 95% 50%"
      }
    }
  },
  {
    name: "Nature",
    id: "nature",
    emoji: "🌿",
    description: "Rich earthy tones",
    colors: {
      light: {
        "--background": "60 25% 97%",
        "--foreground": "40 4% 10%",
        "--card": "0 0% 100%",
        "--card-foreground": "40 4% 10%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "40 4% 10%",
        "--primary": "95 75% 40%",
        "--primary-foreground": "60 30% 98%",
        "--secondary": "50 55% 90%",
        "--secondary-foreground": "40 4% 10%",
        "--muted": "60 15% 93%",
        "--muted-foreground": "40 3% 46%",
        "--accent": "50 50% 90%",
        "--accent-foreground": "40 4% 10%",
        "--destructive": "0 72% 51%",
        "--destructive-foreground": "60 30% 98%",
        "--border": "40 5% 88%",
        "--input": "40 5% 88%",
        "--ring": "95 75% 40%"
      },
      dark: {
        "--background": "40 25% 10%",
        "--foreground": "60 30% 96%",
        "--card": "40 25% 13%",
        "--card-foreground": "60 30% 96%",
        "--popover": "40 25% 12%",
        "--popover-foreground": "60 30% 96%",
        "--primary": "95 55% 45%",
        "--primary-foreground": "40 5% 10%",
        "--secondary": "50 30% 20%",
        "--secondary-foreground": "60 30% 96%",
        "--muted": "40 15% 15%",
        "--muted-foreground": "60 10% 65%",
        "--accent": "50 30% 20%",
        "--accent-foreground": "60 30% 96%",
        "--destructive": "0 72% 51%",
        "--destructive-foreground": "60 30% 96%",
        "--border": "40 15% 20%",
        "--input": "40 15% 20%",
        "--ring": "95 55% 45%"
      }
    }
  }
];

// Helper function to get a theme by ID
export function getThemeById(id: Theme): ThemeDefinition {
  return themes.find(theme => theme.id === id) || themes[0];
}

// Helper function to apply theme colors to the document
export function applyThemeColors(themeId: Theme, isDark: boolean = false): void {
  const theme = getThemeById(themeId);
  const colorSet = isDark && theme.colors.dark ? theme.colors.dark : theme.colors.light;
  
  const root = window.document.documentElement;
  
  // Apply each CSS variable
  Object.entries(colorSet).forEach(([variable, value]) => {
    root.style.setProperty(variable, value);
  });
} 