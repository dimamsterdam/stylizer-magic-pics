
import { Theme, ThemeDate } from "@/lib/themes";

export function calculateNextOccurrence(themeDate: ThemeDate, currentDate: Date = new Date()): Date {
  const now = new Date(currentDate);
  const year = now.getFullYear();
  
  // For non-annual events, return current date
  if (!themeDate.isAnnual) {
    return now;
  }

  // Calculate this year's date
  let thisYearDate = new Date(year, themeDate.month - 1, themeDate.day || 1);
  
  // If the date hasn't passed this year, use it
  if (thisYearDate > now) {
    return thisYearDate;
  }
  
  // If it has passed, use next year's date
  return new Date(year + 1, themeDate.month - 1, themeDate.day || 1);
}

export function calculatePreviousOccurrence(themeDate: ThemeDate, currentDate: Date = new Date()): Date {
  const now = new Date(currentDate);
  const year = now.getFullYear();
  
  // For non-annual events, return current date
  if (!themeDate.isAnnual) {
    return now;
  }

  // Calculate this year's date
  let thisYearDate = new Date(year, themeDate.month - 1, themeDate.day || 1);
  
  // If the date hasn't occurred this year yet, use last year's date
  if (thisYearDate > now) {
    return new Date(year - 1, themeDate.month - 1, themeDate.day || 1);
  }
  
  // If it has passed this year, use this year's date
  return thisYearDate;
}

export function getDaysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

export function getThemeCategory(theme: Theme, currentDate: Date = new Date()): string {
  const nextOccurrence = calculateNextOccurrence(theme.date, currentDate);
  const daysUntil = getDaysBetween(currentDate, nextOccurrence);

  if (!theme.date.isAnnual) return "Later";
  if (daysUntil <= 30) return "Coming Soon";
  if (daysUntil <= 90) return "Upcoming";
  return "Later";
}

export function sortThemesByProximity(themes: Theme[], currentDate: Date = new Date()): Theme[] {
  return [...themes].sort((a, b) => {
    if (!a.date.isAnnual && b.date.isAnnual) return 1;
    if (a.date.isAnnual && !b.date.isAnnual) return -1;
    if (!a.date.isAnnual && !b.date.isAnnual) return 0;

    const aNext = calculateNextOccurrence(a.date, currentDate);
    const bNext = calculateNextOccurrence(b.date, currentDate);
    const aPrev = calculatePreviousOccurrence(a.date, currentDate);
    const bPrev = calculatePreviousOccurrence(b.date, currentDate);

    // Calculate closest occurrence (past or future) for each theme
    const aClosest = getDaysBetween(currentDate, aPrev) < getDaysBetween(currentDate, aNext) ? aPrev : aNext;
    const bClosest = getDaysBetween(currentDate, bPrev) < getDaysBetween(currentDate, bNext) ? bPrev : bNext;
    
    return aClosest.getTime() - bClosest.getTime();
  });
}

export function groupThemesByCategory(themes: Theme[], currentDate: Date = new Date()) {
  const sorted = sortThemesByProximity(themes, currentDate);
  const grouped = sorted.reduce((acc, theme) => {
    const category = getThemeCategory(theme, currentDate);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(theme);
    return acc;
  }, {} as Record<string, Theme[]>);

  // Create a new object with categories in the desired order
  const orderedCategories = ['Coming Soon', 'Upcoming', 'Later'];
  const orderedGroups: Record<string, Theme[]> = {};
  
  orderedCategories.forEach(category => {
    if (grouped[category]) {
      orderedGroups[category] = grouped[category];
    }
  });

  return orderedGroups;
}
