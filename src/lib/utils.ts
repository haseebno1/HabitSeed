
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getToday(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Check if the current environment is a mobile device
 */
export function isMobile(): boolean {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform() === true;
}

/**
 * Determines the growth stage emoji based on streak count
 */
export function getGrowthStageEmoji(streak: number, baseEmoji: string): string {
  // If the base emoji is already one of our growth emojis, return it
  if (["🌱", "🌿", "🪴", "🌳"].includes(baseEmoji)) {
    return baseEmoji;
  }
  
  // More granular stages based on streak
  if (streak >= 30) return "🌳"; // Tree (30+ days)
  if (streak >= 21) return "🌳"; // Young tree (21-29 days)
  if (streak >= 14) return "🪴"; // Potted plant (14-20 days)
  if (streak >= 7) return "🌿";  // Sprout (7-13 days)
  if (streak >= 3) return "🌱";  // Seedling with small leaves (3-6 days)
  return "🌱";                   // Seedling (0-2 days)
}

/**
 * Checks if the streak is a milestone that deserves celebration
 */
export function isMilestoneStreak(streak: number): boolean {
  const milestones = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
  return milestones.includes(streak);
}

/**
 * Returns a positive message based on the streak milestone
 */
export function getMilestoneMessage(streak: number): string {
  switch(streak) {
    case 7:
      return "One week streak! Your habit is taking root! 🌿";
    case 14:
      return "Two weeks strong! Your habit is growing nicely! 🪴";
    case 21:
      return "Three week streak! You're developing solid roots! 🌱";
    case 30:
      return "One month streak! Your habit is flourishing! 🌳";
    case 50:
      return "50 day streak! You're a habit master! 🏆";
    case 75:
      return "75 day streak! Incredible persistence! 💪";
    case 100:
      return "100 day streak! You're unstoppable! 🌟";
    case 150:
      return "150 day streak! Legendary dedication! 🔥";
    case 200:
      return "200 day streak! You're an inspiration! ✨";
    case 365:
      return "ONE YEAR STREAK! You've mastered this habit! 🎊";
    default:
      return "Streak milestone reached! 🎉";
  }
}

/**
 * Format a date string (YYYY-MM-DD) to a more readable format
 */
export function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Gets the first day of the current week
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for starting week on Monday
  return new Date(date.setDate(diff));
}

/**
 * Checks if two dates are the same day
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
