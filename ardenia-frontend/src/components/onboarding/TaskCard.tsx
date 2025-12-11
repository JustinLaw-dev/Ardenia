"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
}

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  className?: string;
}

export function TaskCard({ task, onComplete, className }: TaskCardProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = () => {
    if (task.completed) return;
    setIsChecking(true);
    setTimeout(() => {
      onComplete(task.id);
    }, 200);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 bg-card border border-border rounded-lg transition-all duration-300",
        task.completed && "opacity-60 bg-muted",
        isChecking && "scale-[0.98]",
        className
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleCheck}
        disabled={task.completed}
        className="h-5 w-5"
      />
      <span
        className={cn(
          "flex-1 text-foreground transition-all",
          task.completed && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </span>
      <div
        className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          task.completed
            ? "bg-muted text-muted-foreground"
            : "bg-terracotta-100 text-terracotta-700"
        )}
      >
        +{task.xp} XP
      </div>
    </div>
  );
}
