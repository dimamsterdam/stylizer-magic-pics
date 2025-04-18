
import { Heart, Sun, Leaf, Snowflake, ShoppingBag, Gift, Star, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ThemeDate {
  month: number;
  day?: number;
  duration?: number;
  isAnnual: boolean;
}

export interface Theme {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
  date: ThemeDate;
  styleGuide: string;
}

export const THEMES: Theme[] = [
  {
    id: "easter",
    label: "Easter Collection",
    icon: Sun,
    color: "#FCD34D",
    description: "Spring-inspired Easter collection",
    date: { month: 3, day: 31, isAnnual: true },
    styleGuide: "Bright, springtime settings with pastel colors and natural light."
  },
  {
    id: "spring-collection",
    label: "Spring Collection",
    icon: Leaf,
    color: "#9b87f5",
    description: "Fresh and vibrant spring styles",
    date: { month: 3, day: 1, duration: 90, isAnnual: true },
    styleGuide: "Light and airy compositions with natural lighting and fresh spring colors."
  },
  {
    id: "summer-festival",
    label: "Summer Festival",
    icon: Sun,
    color: "#F59E0B",
    description: "Festival season fashion",
    date: { month: 6, day: 21, isAnnual: true },
    styleGuide: "Vibrant outdoor settings with festival atmosphere."
  },
  {
    id: "summer-collection",
    label: "Summer Collection",
    icon: Sun,
    color: "#F97316",
    description: "Vibrant summer fashion",
    date: { month: 6, day: 1, duration: 90, isAnnual: true },
    styleGuide: "Bright and energetic scenes with warm lighting and summer vibes."
  },
  {
    id: "summer-sales",
    label: "Summer Sales",
    icon: ShoppingBag,
    color: "#EC4899",
    description: "Summer clearance event",
    date: { month: 7, day: 1, isAnnual: true },
    styleGuide: "Bright, summer-themed promotional imagery."
  },
  {
    id: "black-friday",
    label: "Black Friday",
    icon: ShoppingBag,
    color: "#000000",
    description: "Black Friday deals and promotions",
    date: { month: 11, day: 24, isAnnual: true },
    styleGuide: "High-energy, promotional imagery with bold typography."
  },
  {
    id: "cyber-monday",
    label: "Cyber Monday",
    icon: ShoppingBag,
    color: "#3B82F6",
    description: "Cyber Monday online exclusives",
    date: { month: 11, day: 27, isAnnual: true },
    styleGuide: "Tech-inspired imagery with digital elements and modern aesthetics."
  },
  {
    id: "holiday-season",
    label: "Holiday Collection",
    icon: Gift,
    color: "#7E69AB",
    description: "Festive holiday styles",
    date: { month: 12, day: 1, duration: 31, isAnnual: true },
    styleGuide: "Cozy and festive settings with warm lighting and holiday decorations."
  },
  {
    id: "winter-collection",
    label: "Winter Collection",
    icon: Snowflake,
    color: "#0EA5E9",
    description: "Cozy winter fashion",
    date: { month: 12, day: 1, duration: 90, isAnnual: true },
    styleGuide: "Cozy indoor settings or snowy outdoor scenes with soft, warm lighting."
  },
  {
    id: "valentines",
    label: "Valentine's Day",
    icon: Heart,
    color: "#ea384c",
    description: "Romantic Valentine's collection",
    date: { month: 2, day: 14, isAnnual: true },
    styleGuide: "Romantic and intimate settings with soft lighting and touches of red and pink."
  },
  {
    id: "new-arrivals",
    label: "New Arrivals",
    icon: Star,
    color: "#9b87f5",
    description: "Latest fashion arrivals",
    date: { month: 1, isAnnual: false },
    styleGuide: "Clean and modern settings that highlight the product details."
  },
  {
    id: "sale",
    label: "Season Sale",
    icon: ShoppingBag,
    color: "#D946EF",
    description: "Seasonal sales and promotions",
    date: { month: 1, isAnnual: false },
    styleGuide: "Dynamic and attention-grabbing compositions that create urgency."
  },
  {
    id: "special-collection",
    label: "Special Collection",
    icon: Sparkles,
    color: "#8B5CF6",
    description: "Limited edition pieces",
    date: { month: 1, isAnnual: false },
    styleGuide: "Luxurious and exclusive settings that emphasize uniqueness."
  }
];
