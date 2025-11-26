"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import confetti from "canvas-confetti";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority?: "low" | "medium" | "high" | null;
  due_date?: string | null;
};

export default function EditableTaskTable() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Buy groceries",
      description: "Milk, eggs, bread",
      completed: false,
      priority: "medium",
      due_date: "2025-11-20",
    },
    {
      id: "2",
      title: "Finish project",
      description: "Complete NestJS backend",
      completed: true,
      priority: "high",
      due_date: "2025-11-18",
    },
  ]);

  // 🎉 Trigger confetti animation
  const fireConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 3000,
    });
  };

  const toggleCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const newCompleted = !task.completed;

          // Only fire confetti when task becomes completed
          if (newCompleted) fireConfetti();

          return { ...task, completed: newCompleted };
        }
        return task;
      })
    );
  };

  const updateTask = (id: string, field: keyof Task, value: any) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, [field]: value } : task))
    );
  };

  const priorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="overflow-x-auto p-6 max-w-5xl mx-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="p-3">{""}</th>
            <th className="p-3">Task Name</th>
            <th className="p-3">Description</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Due Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              {/* Completed */}
              <td className="p-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleCompleted(task.id)}
                />
              </td>

              {/* Title */}
              <td
                className={`p-3 font-medium ${
                  task.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {task.title}
              </td>

              {/* Editable Description */}
              <td className="p-3">
                <Input
                  value={task.description || ""}
                  onChange={(e) =>
                    updateTask(task.id, "description", e.target.value)
                  }
                  placeholder="Add description"
                  className="text-sm"
                />
              </td>

              {/* Priority Dropdown */}
              <td className="p-3">
                <Select
                  value={task.priority || ""}
                  onValueChange={(value) =>
                    updateTask(task.id, "priority", value || null)
                  }
                >
                  <SelectTrigger className="w-24 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </td>

              {/* Due Date Picker */}
              <td className="p-3">
                <Input
                  type="date"
                  value={task.due_date || ""}
                  onChange={(e) =>
                    updateTask(task.id, "due_date", e.target.value)
                  }
                  className="text-sm"
                />
              </td>

              {/* Actions */}
              <td className="p-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => alert(`Edit ${task.title}`)}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button className="mt-4 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white">
        + Add Task
      </Button>
    </div>
  );
}
