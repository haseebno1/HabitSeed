import { TrackingType, FrequencyType } from "@/hooks/useHabits";

export interface HabitTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  trackingType: TrackingType;
  targetValue?: number;
  unit?: string;
  frequency: FrequencyType;
  frequencyData?: {
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    interval?: number;
    startDate?: string;
  };
  category: HabitCategory;
}

export type HabitCategory = 
  | "health" 
  | "fitness" 
  | "mindfulness" 
  | "productivity" 
  | "learning" 
  | "finance" 
  | "social"
  | "creativity";

export const CATEGORY_EMOJIS: Record<HabitCategory, string> = {
  health: "🍎",
  fitness: "💪",
  mindfulness: "🧘",
  productivity: "✅",
  learning: "📚",
  finance: "💰",
  social: "👋",
  creativity: "🎨"
};

export const CATEGORY_NAMES: Record<HabitCategory, string> = {
  health: "Health & Wellness",
  fitness: "Fitness",
  mindfulness: "Mindfulness",
  productivity: "Productivity",
  learning: "Learning",
  finance: "Finance",
  social: "Social",
  creativity: "Creativity"
};

// Today's date in YYYY-MM-DD format for new templates
const TODAY = new Date().toISOString().split('T')[0];

// Helper function to get weekdays (Monday to Friday)
const getWeekdays = (): number[] => [1, 2, 3, 4, 5];

// Helper function to get weekend days
const getWeekends = (): number[] => [0, 6];

export const habitTemplates: HabitTemplate[] = [
  // Health & Wellness
  {
    id: "drink-water",
    name: "Drink water",
    emoji: "💧",
    description: "Drink 8 glasses of water each day",
    trackingType: "quantity",
    targetValue: 8,
    unit: "glasses",
    frequency: "daily",
    category: "health"
  },
  {
    id: "sleep-early",
    name: "Sleep before midnight",
    emoji: "😴",
    description: "Go to bed before 12:00 AM",
    trackingType: "checkbox",
    frequency: "daily",
    category: "health"
  },
  {
    id: "vitamins",
    name: "Take vitamins",
    emoji: "💊",
    description: "Take daily vitamin supplements",
    trackingType: "checkbox",
    frequency: "daily",
    category: "health"
  },
  
  // Fitness
  {
    id: "workout",
    name: "Workout",
    emoji: "🏋️",
    description: "Complete a workout session",
    trackingType: "duration",
    targetValue: 30,
    unit: "minutes",
    frequency: "custom",
    frequencyData: {
      interval: 2,
      startDate: TODAY
    },
    category: "fitness"
  },
  {
    id: "walk-steps",
    name: "Walk 10,000 steps",
    emoji: "👣",
    description: "Walk at least 10,000 steps daily",
    trackingType: "quantity",
    targetValue: 10000,
    unit: "steps",
    frequency: "daily",
    category: "fitness"
  },
  {
    id: "stretch",
    name: "Stretch",
    emoji: "🧘‍♂️",
    description: "Do a stretching routine",
    trackingType: "duration",
    targetValue: 10,
    unit: "minutes",
    frequency: "daily",
    category: "fitness"
  },
  
  // Mindfulness
  {
    id: "meditate",
    name: "Meditate",
    emoji: "🧘",
    description: "Practice meditation",
    trackingType: "duration",
    targetValue: 10,
    unit: "minutes",
    frequency: "daily",
    category: "mindfulness"
  },
  {
    id: "gratitude",
    name: "Gratitude journal",
    emoji: "🙏",
    description: "Write down three things you're grateful for",
    trackingType: "checkbox",
    frequency: "daily",
    category: "mindfulness"
  },
  {
    id: "digital-detox",
    name: "Digital detox",
    emoji: "📵",
    description: "Spend time away from digital devices",
    trackingType: "duration",
    targetValue: 60,
    unit: "minutes",
    frequency: "daily",
    category: "mindfulness"
  },
  
  // Productivity
  {
    id: "most-important-task",
    name: "Complete MIT",
    emoji: "🎯",
    description: "Complete your Most Important Task for the day",
    trackingType: "checkbox",
    frequency: "weekly",
    frequencyData: {
      daysOfWeek: getWeekdays()
    },
    category: "productivity"
  },
  {
    id: "no-procrastination",
    name: "No procrastination",
    emoji: "⏰",
    description: "Avoid procrastinating on important tasks",
    trackingType: "checkbox",
    frequency: "daily",
    category: "productivity"
  },
  {
    id: "inbox-zero",
    name: "Inbox zero",
    emoji: "📧",
    description: "Clear your email inbox",
    trackingType: "checkbox",
    frequency: "weekly",
    frequencyData: {
      daysOfWeek: [1, 5] // Monday and Friday
    },
    category: "productivity"
  },
  
  // Learning
  {
    id: "read-book",
    name: "Read book",
    emoji: "📚",
    description: "Read from a book",
    trackingType: "duration",
    targetValue: 20,
    unit: "minutes",
    frequency: "daily",
    category: "learning"
  },
  {
    id: "learn-language",
    name: "Language practice",
    emoji: "🗣️",
    description: "Practice a new language",
    trackingType: "duration",
    targetValue: 15,
    unit: "minutes",
    frequency: "daily",
    category: "learning"
  },
  {
    id: "learn-coding",
    name: "Code practice",
    emoji: "💻",
    description: "Practice coding skills",
    trackingType: "duration",
    targetValue: 30,
    unit: "minutes",
    frequency: "weekly",
    frequencyData: {
      daysOfWeek: [1, 3, 5] // Monday, Wednesday, Friday
    },
    category: "learning"
  },
  
  // Finance
  {
    id: "no-impulse-buying",
    name: "No impulse purchases",
    emoji: "💸",
    description: "Avoid making unplanned purchases",
    trackingType: "checkbox",
    frequency: "daily",
    category: "finance"
  },
  {
    id: "track-expenses",
    name: "Track expenses",
    emoji: "📊",
    description: "Log all your daily expenses",
    trackingType: "checkbox",
    frequency: "daily",
    category: "finance"
  },
  {
    id: "save-money",
    name: "Save money",
    emoji: "🏦",
    description: "Put aside money for savings",
    trackingType: "checkbox",
    frequency: "monthly",
    frequencyData: {
      daysOfMonth: [1] // First day of the month
    },
    category: "finance"
  },
  
  // Social
  {
    id: "connect-friend",
    name: "Connect with a friend",
    emoji: "👋",
    description: "Call or meet a friend",
    trackingType: "checkbox",
    frequency: "weekly",
    frequencyData: {
      daysOfWeek: [6] // Saturday
    },
    category: "social"
  },
  {
    id: "family-time",
    name: "Family time",
    emoji: "👨‍👩‍👧‍👦",
    description: "Spend quality time with family",
    trackingType: "duration",
    targetValue: 30,
    unit: "minutes",
    frequency: "daily",
    category: "social"
  },
  {
    id: "random-kindness",
    name: "Random act of kindness",
    emoji: "❤️",
    description: "Do something kind for someone",
    trackingType: "checkbox",
    frequency: "daily",
    category: "social"
  },
  
  // Creativity
  {
    id: "creative-hobby",
    name: "Practice creative hobby",
    emoji: "🎨",
    description: "Spend time on a creative hobby",
    trackingType: "duration",
    targetValue: 30,
    unit: "minutes",
    frequency: "weekly",
    frequencyData: {
      daysOfWeek: getWeekends()
    },
    category: "creativity"
  },
  {
    id: "write-journal",
    name: "Journal writing",
    emoji: "📔",
    description: "Write in your journal",
    trackingType: "checkbox",
    frequency: "daily",
    category: "creativity"
  },
  {
    id: "music-practice",
    name: "Practice instrument",
    emoji: "🎵",
    description: "Practice a musical instrument",
    trackingType: "duration",
    targetValue: 20,
    unit: "minutes",
    frequency: "custom",
    frequencyData: {
      interval: 2,
      startDate: TODAY
    },
    category: "creativity"
  }
];

// Helper function to get templates by category
export const getTemplatesByCategory = (category: HabitCategory): HabitTemplate[] => {
  return habitTemplates.filter(template => template.category === category);
};

// Get all unique categories
export const getAllCategories = (): HabitCategory[] => {
  return Array.from(new Set(habitTemplates.map(template => template.category))) as HabitCategory[];
};

// Get a template by ID
export const getTemplateById = (id: string): HabitTemplate | undefined => {
  return habitTemplates.find(template => template.id === id);
}; 