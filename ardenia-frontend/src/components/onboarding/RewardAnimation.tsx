"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RewardAnimationProps {
  xp: number;
  show: boolean;
  onComplete?: () => void;
}

export function RewardAnimation({ xp, show, onComplete }: RewardAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div
        className={cn(
          "flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300",
          !show && "animate-out fade-out zoom-out"
        )}
      >
        <div className="text-6xl">🎉</div>
        <div className="bg-terracotta-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg">
          +{xp} XP
        </div>
        <p className="text-foreground font-medium mt-2">Great start!</p>
      </div>
    </div>
  );
}
