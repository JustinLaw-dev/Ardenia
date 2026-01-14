import type { OverwhelmLevel } from "@/lib/types/database";

export const OVERWHELM_LEVELS: Record<
  OverwhelmLevel,
  {
    name: string;
    taskCount: number;
    description: string;
    icon: string;
    color: string;
  }
> = {
  light: {
    name: "Light",
    taskCount: 5,
    description: "A gentle start - perfect for busy weeks",
    icon: "🌱",
    color: "green",
  },
  medium: {
    name: "Medium",
    taskCount: 10,
    description: "Balanced commitment - steady progress",
    icon: "🌿",
    color: "blue",
  },
  full: {
    name: "Full",
    taskCount: 15,
    description: "Maximum focus - crush your goals",
    icon: "🔥",
    color: "terracotta",
  },
};

export const WEEKLY_QUEST_XP_MULTIPLIER = 1.5;

export const RESET_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
] as const;
