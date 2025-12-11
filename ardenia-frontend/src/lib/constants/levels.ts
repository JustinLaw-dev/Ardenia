export interface LevelDefinition {
  level: number;
  name: string;
  xpRequired: number;
  icon: string;
  color: string;
  perks?: string[];
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, name: "Novice", xpRequired: 0, icon: "🌱", color: "stone" },
  { level: 2, name: "Apprentice", xpRequired: 200, icon: "🌿", color: "green" },
  { level: 3, name: "Journeyman", xpRequired: 500, icon: "🌳", color: "blue" },
  { level: 4, name: "Expert", xpRequired: 1000, icon: "⚡", color: "purple" },
  { level: 5, name: "Master", xpRequired: 2000, icon: "🔥", color: "orange" },
  { level: 6, name: "Grandmaster", xpRequired: 4000, icon: "💎", color: "cyan" },
  { level: 7, name: "Legend", xpRequired: 8000, icon: "👑", color: "gold" },
];

// Get level from total XP
export function getLevelFromXP(totalXP: number): LevelDefinition {
  // Find highest level where xpRequired <= totalXP
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

// Get XP progress within current level
export function getLevelProgress(totalXP: number): {
  current: LevelDefinition;
  next: LevelDefinition | null;
  currentLevelXP: number;
  xpToNextLevel: number;
  progress: number; // 0-100
} {
  const current = getLevelFromXP(totalXP);
  const nextIndex = LEVELS.findIndex((l) => l.level === current.level) + 1;
  const next = nextIndex < LEVELS.length ? LEVELS[nextIndex] : null;

  if (!next) {
    // Max level reached
    return {
      current,
      next: null,
      currentLevelXP: totalXP - current.xpRequired,
      xpToNextLevel: 0,
      progress: 100,
    };
  }

  const xpIntoCurrentLevel = totalXP - current.xpRequired;
  const xpNeededForNext = next.xpRequired - current.xpRequired;
  const progress = (xpIntoCurrentLevel / xpNeededForNext) * 100;

  return {
    current,
    next,
    currentLevelXP: xpIntoCurrentLevel,
    xpToNextLevel: xpNeededForNext,
    progress,
  };
}
