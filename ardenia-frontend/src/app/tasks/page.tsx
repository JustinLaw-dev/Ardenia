"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
} from "@/lib/tasks";
import type { Task, Achievement } from "@/lib/types/database";
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

type SortField = "title" | "priority" | "due_date" | "created_at";
type SortOrder = "asc" | "desc";
type TabView = "active" | "archived";
type PriorityFilter = "all" | "high" | "medium" | "low" | "none";

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const { addXP, checkAchievements } = useGame();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockedAchievement, setUnlockedAchievement] =
    useState<Achievement | null>(null);

  // Tabs and Filters
  const [activeTab, setActiveTab] = useState<TabView>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // New task form
  const [showAddForm, setShowAddForm] = useState(false);

  // Inline editing
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // New task row
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Quick tasks presets
  const quickTaskPresets = [
    "Drink a glass of water",
    "Take a 5-minute walk",
    "Tidy up my desk",
    "Read for 10 minutes",
    "Do 10 push-ups",
    "Stretch for 5 minutes",
    "Review my calendar",
    "Clear my inbox",
  ];

  // Load tasks
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getTasks(user.id);
    setTasks(data);
    setLoading(false);
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 3000,
    });
  };

  // Inline editing handlers
  const startEditing = (taskId: string, field: string, currentValue: string) => {
    setEditingTaskId(taskId);
    setEditingField(field);
    setEditValue(currentValue || "");
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = async (taskId: string, field: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updates: Partial<Task> = {};
    if (field === "title") {
      if (!editValue.trim()) {
        cancelEditing();
        return;
      }
      updates.title = editValue.trim();
    } else if (field === "description") {
      updates.description = editValue.trim() || null;
    } else if (field === "priority") {
      updates.priority = editValue === "none" ? null : (editValue as Task["priority"]) || null;
    } else if (field === "due_date") {
      updates.due_date = editValue || null;
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
    cancelEditing();

    // Save to database
    const result = await updateTask(taskId, updates);
    if (!result.success) {
      loadTasks(); // Revert on failure
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newCompleted = !task.completed;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: newCompleted,
              completed_at: newCompleted ? new Date().toISOString() : null,
            }
          : t
      )
    );

    // Save to database first
    const result = await toggleTaskCompletion(task.id, newCompleted);

    if (!result.success) {
      // Revert optimistic update on failure
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: !newCompleted } : t
        )
      );
      return;
    }

    // Only award XP and check achievements after successful save
    if (newCompleted) {
      fireConfetti();
      await addXP(task.xp);

      // Check for new achievements (now the task is saved in DB)
      const newAchievements = await checkAchievements();
      if (newAchievements.length > 0) {
        // Show the first unlocked achievement
        setUnlockedAchievement(newAchievements[0]);
        // Auto-hide after 4 seconds
        setTimeout(() => setUnlockedAchievement(null), 4000);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const result = await deleteTask(taskId);
    if (!result.success) {
      loadTasks();
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setSortField("created_at");
    setSortOrder("desc");
  };

  const hasActiveFilters = searchQuery || priorityFilter !== "all";

  // Quick task handler - creates task from preset
  const handleQuickTaskSelect = async (title: string) => {
    if (!user || !title.trim()) return;
    const result = await createTask(user.id, {
      title: title.trim(),
      description: null,
      priority: null,
      due_date: null,
      xp: 10,
      completed: false,
    });
    if (result.success && result.task) {
      setTasks((prev) => [result.task!, ...prev]);
      await addXP(1);
    }
  };

  // Create task from inline row
  const handleCreateFromRow = async () => {
    if (!user || !newTaskTitle.trim() || isCreating) return;

    setIsCreating(true);
    const result = await createTask(user.id, {
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || null,
      priority: newTaskPriority ? (newTaskPriority as Task["priority"]) : null,
      due_date: newTaskDueDate || null,
      xp: 10,
      completed: false,
    });

    if (result.success && result.task) {
      setTasks((prev) => [result.task!, ...prev]);
      await addXP(1);
      // Clear the row
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("");
      setNewTaskDueDate("");
    }
    setIsCreating(false);
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Tab filter (active = incomplete, archived = completed)
    if (activeTab === "active") {
      result = result.filter((t) => !t.completed);
    } else {
      result = result.filter((t) => t.completed);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      if (priorityFilter === "none") {
        result = result.filter((t) => !t.priority);
      } else {
        result = result.filter((t) => t.priority === priorityFilter);
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1, null: 0 };
          comparison =
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case "due_date":
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else comparison = a.due_date.localeCompare(b.due_date);
          break;
        case "created_at":
          comparison = a.created_at.localeCompare(b.created_at);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tasks, activeTab, searchQuery, priorityFilter, sortField, sortOrder]);

  const priorityBadge = (priority: string | null | undefined) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "";
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Please log in to view tasks.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* Achievement Unlocked Notification */}
      {unlockedAchievement && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-card border-2 border-terracotta-400 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[280px]">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-terracotta-100 text-2xl">
              {unlockedAchievement.icon || "🏆"}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-terracotta-600 uppercase tracking-wide">
                Achievement Unlocked!
              </p>
              <p className="font-semibold text-foreground">
                {unlockedAchievement.name}
              </p>
              <p className="text-xs text-muted-foreground">
                +{unlockedAchievement.xp_reward} XP
              </p>
            </div>
            <button
              onClick={() => setUnlockedAchievement(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-terracotta-500 hover:bg-terracotta-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Active
          <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">
            {tasks.filter((t) => !t.completed).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "archived"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Archived
          <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">
            {tasks.filter((t) => t.completed).length}
          </span>
        </button>
      </div>

      {/* Quick Add Panel */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-terracotta-500" />
              <h2 className="text-sm font-semibold text-foreground">Quick Add</h2>
              <span className="text-xs text-muted-foreground">
                Click to add, then edit details in the table
              </span>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selectable preset chips */}
          <div className="flex flex-wrap gap-2">
            {quickTaskPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => handleQuickTaskSelect(preset)}
                className="px-3 py-1.5 text-sm bg-muted cursor-pointer hover:bg-terracotta-100 text-muted-foreground hover:text-terracotta-700 rounded-full border border-border hover:border-terracotta-300 transition-colors"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={priorityFilter}
            onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="none">No Priority</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-12 p-3 text-left"></th>
                  <th className="p-3 text-left">
                    <button
                      onClick={() => handleSort("title")}
                      className="flex items-center gap-1 font-semibold text-sm text-foreground hover:text-foreground/80"
                    >
                      Task
                      <SortIcon field="title" />
                    </button>
                  </th>
                  <th className="p-3 text-left hidden md:table-cell">
                    <span className="font-semibold text-sm text-foreground">
                      Description
                    </span>
                  </th>
                  <th className="p-3 text-left">
                    <button
                      onClick={() => handleSort("priority")}
                      className="flex items-center gap-1 font-semibold text-sm text-foreground hover:text-foreground/80"
                    >
                      Priority
                      <SortIcon field="priority" />
                    </button>
                  </th>
                  <th className="p-3 text-left hidden sm:table-cell">
                    <button
                      onClick={() => handleSort("due_date")}
                      className="flex items-center gap-1 font-semibold text-sm text-foreground hover:text-foreground/80"
                    >
                      Due Date
                      <SortIcon field="due_date" />
                    </button>
                  </th>
                  <th className="p-3 text-left">
                    <span className="font-semibold text-sm text-foreground">
                      XP
                    </span>
                  </th>
                  <th className="p-3 text-left hidden lg:table-cell">
                    <span className="font-semibold text-sm text-foreground">
                      Completed
                    </span>
                  </th>
                  <th className="w-12 p-3"></th>
                </tr>
              </thead>
              <tbody>
                {/* New Task Row - only show on active tab */}
                {activeTab === "active" && (
                  <tr className="border-b border-border bg-muted/20">
                    <td className="p-3">
                      <div className="w-5 h-5 rounded border-2 border-dashed border-muted-foreground/30" />
                    </td>
                    <td className="p-3">
                      <Input
                        placeholder="Add a new task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateFromRow();
                        }}
                        className="h-8 bg-transparent border-none shadow-none focus-visible:ring-0 px-1 -mx-1 placeholder:text-muted-foreground/50"
                        disabled={isCreating}
                      />
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <Input
                        placeholder="Description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateFromRow();
                        }}
                        className="h-8 bg-transparent border-none shadow-none focus-visible:ring-0 px-1 -mx-1 text-sm placeholder:text-muted-foreground/50"
                        disabled={isCreating}
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        value={newTaskPriority}
                        onValueChange={setNewTaskPriority}
                        disabled={isCreating}
                      >
                        <SelectTrigger className="h-8 w-28 bg-transparent border-none shadow-none">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <Input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="h-8 w-36 bg-transparent border-none shadow-none focus-visible:ring-0"
                        disabled={isCreating}
                      />
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground/50">+10</span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground/50">—</span>
                    </td>
                    <td className="p-3">
                      {newTaskTitle.trim() && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCreateFromRow}
                          disabled={isCreating}
                          className="text-terracotta-500 hover:text-terracotta-600 hover:bg-terracotta-100"
                        >
                          {isCreating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                )}

                {filteredTasks.length === 0 && activeTab === "archived" ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-muted-foreground"
                    >
                      {tasks.filter((t) => t.completed).length === 0
                        ? "No archived tasks yet. Complete some tasks to see them here!"
                        : "No tasks match your filters."}
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 && activeTab === "active" ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-6 text-center text-muted-foreground"
                    >
                      {tasks.filter((t) => !t.completed).length === 0
                        ? "Type above to add your first task!"
                        : "No tasks match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className={`border-b border-border hover:bg-muted/30 transition-colors ${
                        task.completed ? "opacity-100" : ""
                      }`}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task)}
                          className="h-5 w-5"
                        />
                      </td>
                      {/* Editable Title */}
                      <td className="p-3">
                        {editingTaskId === task.id && editingField === "title" ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(task.id, "title");
                              if (e.key === "Escape") cancelEditing();
                            }}
                            onBlur={() => saveEdit(task.id, "title")}
                            className="h-8 w-full"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(task.id, "title", task.title)}
                            className={`font-medium cursor-pointer hover:bg-muted/50 px-1 -mx-1 rounded ${
                              task.completed
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {task.title}
                          </span>
                        )}
                      </td>
                      {/* Editable Description */}
                      <td className="p-3 hidden md:table-cell">
                        {editingTaskId === task.id && editingField === "description" ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(task.id, "description");
                              if (e.key === "Escape") cancelEditing();
                            }}
                            onBlur={() => saveEdit(task.id, "description")}
                            className="h-8 w-full"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(task.id, "description", task.description || "")}
                            className="text-sm text-muted-foreground truncate block max-w-[200px] cursor-pointer hover:bg-muted/50 px-1 -mx-1 rounded"
                          >
                            {task.description || "—"}
                          </span>
                        )}
                      </td>
                      {/* Editable Priority */}
                      <td className="p-3">
                        {editingTaskId === task.id && editingField === "priority" ? (
                          <Select
                            value={editValue}
                            onValueChange={(v) => {
                              setEditValue(v);
                              saveEdit(task.id, "priority");
                            }}
                            open={true}
                            onOpenChange={(open) => {
                              if (!open) cancelEditing();
                            }}
                          >
                            <SelectTrigger className="h-8 w-28">
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            onClick={() => startEditing(task.id, "priority", task.priority || "")}
                            className="cursor-pointer"
                          >
                            {task.priority ? (
                              <span
                                className={`text-xs px-2 py-1 rounded-full hover:opacity-80 ${priorityBadge(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm hover:bg-muted/50 px-1 rounded">
                                —
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      {/* Editable Due Date */}
                      <td className="p-3 hidden sm:table-cell">
                        {editingTaskId === task.id && editingField === "due_date" ? (
                          <Input
                            type="date"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(task.id, "due_date");
                              if (e.key === "Escape") cancelEditing();
                            }}
                            onBlur={() => saveEdit(task.id, "due_date")}
                            className="h-8 w-36"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(task.id, "due_date", task.due_date || "")}
                            className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 px-1 -mx-1 rounded"
                          >
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString()
                              : "—"}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-terracotta-500 font-medium">
                          +{task.xp}
                        </span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {task.completed_at
                            ? new Date(task.completed_at).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with count */}
          <div className="p-3 border-t border-border bg-muted/30 text-sm text-muted-foreground flex justify-between items-center">
            <span>
              Showing {filteredTasks.length} of{" "}
              {activeTab === "active"
                ? tasks.filter((t) => !t.completed).length
                : tasks.filter((t) => t.completed).length}{" "}
              {activeTab === "active" ? "active" : "archived"} tasks
            </span>
            {activeTab === "archived" && (
              <span className="text-terracotta-500 font-medium">
                Total XP earned:{" "}
                {tasks
                  .filter((t) => t.completed)
                  .reduce((sum, t) => sum + t.xp, 0)}{" "}
                XP
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
