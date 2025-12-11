"use client";

import { cn } from "@/lib/utils";
import type { LevelDefinition } from "@/lib/constants/levels";

interface XPProgressProps {
  currentXP: number;
  level: LevelDefinition;
  nextLevel: LevelDefinition | null;
  xpToNextLevel: number;
  progress: number;
  className?: string;
}

export function XPProgress({
  currentXP,
  level,
  nextLevel,
  xpToNextLevel,
  progress,
  className,
}: XPProgressProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-terracotta-500 text-white font-bold text-lg">
        {level.icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{level.name}</span>
          <span>
            {nextLevel
              ? `${currentXP} / ${xpToNextLevel} XP`
              : "Max Level!"}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-terracotta-400 to-terracotta-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {nextLevel && (
          <div className="text-xs text-muted-foreground mt-1">
            Next: {nextLevel.icon} {nextLevel.name}
          </div>
        )}
      </div>
    </div>
  );
}
