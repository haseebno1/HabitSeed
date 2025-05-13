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
 * Determines the growth stage emoji based on streak count
 */
export function getGrowthStageEmoji(streak: number, baseEmoji: string): string {
  // If the base emoji is already one of our growth emojis, return it
  if (["🌱", "🌿", "🪴", "🌳"].includes(baseEmoji)) {
    return baseEmoji;
  }
  
  // Otherwise, calculate stage based on streak
  if (streak >= 30) return "🌳"; // Tree (30+ days)
  if (streak >= 14) return "🪴"; // Potted plant (14-29 days)
  if (streak >= 7) return "🌿";  // Sprout (7-13 days)
  return "🌱";                   // Seedling (0-6 days)
}

/**
 * Checks if the streak is a milestone that deserves celebration
 */
export function isMilestoneStreak(streak: number): boolean {
  const milestones = [7, 30, 100];
  return milestones.includes(streak);
}

/**
 * Returns a positive message based on the streak milestone
 */
export function getMilestoneMessage(streak: number): string {
  switch(streak) {
    case 7:
      return "One week streak! 🎉";
    case 30:
      return "One month streak! Amazing! 🎊";
    case 100:
      return "100 day streak! Incredible! 🏆";
    default:
      return "Streak milestone reached! 🎉";
  }
}
