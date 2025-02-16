
import { Theme, ThemeDate } from "@/lib/themes";

export function calculateNextOccurrence(themeDate: ThemeDate, currentDate: Date = new Date()): Date {
  const now = new Date(currentDate);
  const year = now.getFullYear();
  
  // For non-annual events, return current date
  if (!themeDate.isAnnual) {
    return now;
  }

  let nextDate = new Date(year, themeDate.month - 1, themeDate.day || 1);
  
  // If the date has passed this year, calculate for next year
  if (nextDate < now) {
    nextDate = new Date(year + 1, themeDate.month - 1, themeDate.day || 1);
  }

  return nextDate;
}

export function getDaysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

export function getThemeCategory(theme: Theme, currentDate: Date = new Date()): string {
  const nextOccurrence = calculateNextOccurrence(theme.date, currentDate);
  const daysUntil = getDaysBetween(currentDate, nextOccurrence);

  if (!theme.date.isAnnual) return "Year Round";
  if (daysUntil <= 30) return "Coming Soon";
  if (daysUntil <= 90) return "Upcoming";
  return "Later This Year";
}

export function sortThemesByProximity(themes: Theme[], currentDate: Date = new Date()): Theme[] {
  return [...themes].sort((a, b) => {
    // Year-round themes go last
    if (!a.date.isAnnual && b.date.isAnnual) return 1;
    if (a.date.isAnnual && !b.date.isAnnual) return -1;
    if (!a.date.isAnnual && !b.date.isAnnual) return 0;

    const aNextDate = calculateNextOccurrence(a.date, currentDate);
    const bNextDate = calculateNextOccurrence(b.date, currentDate);
    
    return aNextDate.getTime() - bNextDate.getTime();
  });
}

export function groupThemesByCategory(themes: Theme[], currentDate: Date = new Date()) {
  const sorted = sortThemesByProximity(themes, currentDate);
  return sorted.reduce((acc, theme) => {
    const category = getThemeCategory(theme, currentDate);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(theme);
    return acc;
  }, {} as Record<string, Theme[]>);
}
