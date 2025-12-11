"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickTaskInputProps {
  onTaskCreate: (task: string) => void;
  className?: string;
}

export function QuickTaskInput({ onTaskCreate, className }: QuickTaskInputProps) {
  const [task, setTask] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setIsSubmitting(true);
    onTaskCreate(task.trim());

    setTimeout(() => {
      setTask("");
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="What do you want to get done today?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="flex-1 h-12 text-base"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          disabled={!task.trim() || isSubmitting}
          className="h-12 px-6 bg-terracotta-500 hover:bg-terracotta-600 text-white"
        >
          {isSubmitting ? "Adding..." : "Add Task"}
        </Button>
      </div>
    </form>
  );
}
