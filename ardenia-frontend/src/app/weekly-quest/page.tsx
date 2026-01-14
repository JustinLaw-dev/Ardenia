"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Plus,
  ChevronRight,
  ChevronLeft,
  X,
  Trash2,
  Sparkles,
  Calendar,
  Target,
  Trophy,
} from "lucide-react";
import { getUserSettings } from "@/lib/settings";
import { getTasks } from "@/lib/tasks";
import {
  getCurrentWeeklyQuest,
  createWeeklyQuest,
  completeQuestTask,
  uncompleteQuestTask,
  checkExpiredQuests,
  abandonQuest,
  getDaysRemaining,
  addTaskToQuest,
  deleteQuestTask,
} from "@/lib/weekly-quest";
import {
  OVERWHELM_LEVELS,
  WEEKLY_QUEST_XP_MULTIPLIER,
} from "@/lib/constants/weekly-quest";
import type {
  WeeklyQuestWithTasks,
  WeeklyQuestTask,
  OverwhelmLevel,
  Task,
} from "@/lib/types/database";
import confetti from "canvas-confetti";

type WizardStep = "level" | "tasks" | "review";
type TaskTab = "existing" | "new";

export default function WeeklyQuestPage() {
  const { user, loading: authLoading } = useAuth();
  const { addXP, checkAchievements } = useGame();

  // Quest state
  const [quest, setQuest] = useState<WeeklyQuestWithTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetDay, setResetDay] = useState(1);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>("level");
  const [selectedLevel, setSelectedLevel] = useState<OverwhelmLevel | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<
    Array<{
      id?: string;
      task_id?: string;
      title: string;
      description?: string;
      xp: number;
      source: "existing" | "new";
    }>
  >([]);
  const [taskTab, setTaskTab] = useState<TaskTab>("existing");
  const [existingTasks, setExistingTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [bonusXPEarned, setBonusXPEarned] = useState(0);

  // Load quest and settings
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Check for expired quests first
    await checkExpiredQuests(user.id);

    // Load settings and current quest
    const [settings, currentQuest, tasks] = await Promise.all([
      getUserSettings(user.id),
      getCurrentWeeklyQuest(user.id),
      getTasks(user.id),
    ]);

    setResetDay(settings.weekly_reset_day);
    setQuest(currentQuest);
    setExistingTasks(tasks.filter((t) => !t.completed));
    setLoading(false);
  };

  const handleLevelSelect = (level: OverwhelmLevel) => {
    setSelectedLevel(level);
    setWizardStep("tasks");
  };

  const handleAddExistingTask = (task: Task) => {
    if (selectedTasks.some((t) => t.task_id === task.id)) return;
    setSelectedTasks((prev) => [
      ...prev,
      {
        task_id: task.id,
        title: task.title,
        description: task.description || undefined,
        xp: task.xp,
        source: "existing" as const,
      },
    ]);
  };

  const handleAddNewTask = () => {
    if (!newTaskTitle.trim()) return;
    setSelectedTasks((prev) => [
      ...prev,
      {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        xp: 10,
        source: "new" as const,
      },
    ]);
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const handleRemoveTask = (index: number) => {
    setSelectedTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartQuest = async () => {
    if (!user || !selectedLevel || selectedTasks.length === 0) return;

    setCreating(true);
    const result = await createWeeklyQuest(user.id, resetDay, {
      overwhelm_level: selectedLevel,
      tasks: selectedTasks.map((t) => ({
        task_id: t.task_id,
        title: t.title,
        description: t.description,
        xp: t.xp,
        source: t.source,
      })),
    });

    if (result.success && result.quest) {
      setQuest(result.quest);
      setSelectedTasks([]);
      setSelectedLevel(null);
      setWizardStep("level");
    }
    setCreating(false);
  };

  const handleCompleteTask = async (task: WeeklyQuestTask) => {
    if (!quest) return;

    // Optimistic update
    setQuest((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === task.id
            ? { ...t, completed: true, completed_at: new Date().toISOString() }
            : t
        ),
        completed_task_count: prev.completed_task_count + 1,
      };
    });

    const result = await completeQuestTask(task.id);

    if (result.success) {
      // Award XP for the task
      await addXP(task.xp);

      // Check if quest was completed
      if (result.questCompleted && result.bonusXP) {
        // Award bonus XP
        await addXP(result.bonusXP);
        setBonusXPEarned(result.bonusXP);
        setShowCelebration(true);

        // Fire confetti
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          zIndex: 3000,
        });

        // Update quest status
        setQuest((prev) => {
          if (!prev) return prev;
          return { ...prev, status: "completed" };
        });

        // Check achievements
        await checkAchievements();
      }
    } else {
      // Revert on error
      setQuest((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === task.id ? { ...t, completed: false, completed_at: null } : t
          ),
          completed_task_count: prev.completed_task_count - 1,
        };
      });
    }
  };

  const handleUncompleteTask = async (task: WeeklyQuestTask) => {
    if (!quest) return;

    // Optimistic update
    setQuest((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === task.id ? { ...t, completed: false, completed_at: null } : t
        ),
        completed_task_count: Math.max(0, prev.completed_task_count - 1),
      };
    });

    const result = await uncompleteQuestTask(task.id);

    if (!result.success) {
      // Revert on error
      setQuest((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === task.id
              ? { ...t, completed: true, completed_at: new Date().toISOString() }
              : t
          ),
          completed_task_count: prev.completed_task_count + 1,
        };
      });
    }
  };

  const handleAbandonQuest = async () => {
    if (!quest) return;
    if (!confirm("Are you sure you want to abandon this quest? You won't earn the bonus XP."))
      return;

    await abandonQuest(quest.id);
    setQuest(null);
  };

  const handleAddTaskToActiveQuest = async () => {
    if (!quest || !newTaskTitle.trim()) return;

    const result = await addTaskToQuest(quest.id, {
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      xp: 10,
      source: "new",
    });

    if (result.success && result.task) {
      setQuest((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: [...prev.tasks, result.task!],
        };
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
    }
  };

  const handleDeleteQuestTask = async (taskId: string) => {
    if (!quest) return;
    if (!confirm("Remove this task from the quest?")) return;

    const result = await deleteQuestTask(taskId);
    if (result.success) {
      setQuest((prev) => {
        if (!prev) return prev;
        const task = prev.tasks.find((t) => t.id === taskId);
        return {
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== taskId),
          completed_task_count: task?.completed
            ? prev.completed_task_count - 1
            : prev.completed_task_count,
        };
      });
    }
  };

  // Computed values
  const targetTaskCount = selectedLevel
    ? OVERWHELM_LEVELS[selectedLevel].taskCount
    : 0;

  const questProgress = quest
    ? Math.min(100, (quest.completed_task_count / quest.target_task_count) * 100)
    : 0;

  const daysRemaining = quest ? getDaysRemaining(quest.week_end) : 0;

  const potentialBonusXP = quest
    ? Math.floor(
        quest.tasks
          .filter((t) => t.completed)
          .reduce((sum, t) => sum + t.xp, 0) *
          (WEEKLY_QUEST_XP_MULTIPLIER - 1)
      )
    : 0;

  const tasksNeededForBonus = quest
    ? Math.max(0, quest.target_task_count - quest.completed_task_count)
    : 0;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Please log in to view your weekly quest.</p>
      </div>
    );
  }

  // Celebration Modal
  if (showCelebration) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md mx-4 text-center animate-in zoom-in duration-300">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Quest Complete!
          </h2>
          <p className="text-muted-foreground mb-4">
            You crushed your weekly goal!
          </p>
          <div className="bg-terracotta-100 dark:bg-terracotta-900/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">Bonus XP Earned</p>
            <p className="text-3xl font-bold text-terracotta-600">
              +{bonusXPEarned} XP
            </p>
          </div>
          <Button
            onClick={() => {
              setShowCelebration(false);
              loadData();
            }}
            className="bg-terracotta-500 hover:bg-terracotta-600 w-full"
          >
            Start New Quest
          </Button>
        </div>
      </div>
    );
  }

  // Active Quest View
  if (quest && quest.status === "active") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Weekly Quest</h1>
            <p className="text-muted-foreground">
              {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                quest.overwhelm_level === "light"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : quest.overwhelm_level === "medium"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/30 dark:text-terracotta-400"
              }`}
            >
              {OVERWHELM_LEVELS[quest.overwhelm_level].icon}{" "}
              {OVERWHELM_LEVELS[quest.overwhelm_level].name}
            </span>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold text-foreground">
                {quest.completed_task_count} / {quest.target_task_count} tasks
              </p>
            </div>
            <div className="text-right">
              {tasksNeededForBonus > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Complete {tasksNeededForBonus} more for
                  </p>
                  <p className="text-lg font-semibold text-terracotta-500">
                    +{potentialBonusXP} bonus XP
                  </p>
                </>
              ) : (
                <p className="text-lg font-semibold text-green-600">
                  Goal reached! 🎉
                </p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-terracotta-500 transition-all duration-500"
              style={{ width: `${questProgress}%` }}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Quest Tasks</h2>
          </div>
          <div className="divide-y divide-border">
            {quest.tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 flex items-center gap-3 ${
                  task.completed ? "bg-muted/30" : ""
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) =>
                    checked
                      ? handleCompleteTask(task)
                      : handleUncompleteTask(task)
                  }
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>
                <span className="text-sm text-terracotta-500 font-medium">
                  +{task.xp} XP
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteQuestTask(task.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Task */}
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex gap-2">
              <Input
                placeholder="Add another task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTaskToActiveQuest()}
              />
              <Button
                onClick={handleAddTaskToActiveQuest}
                disabled={!newTaskTitle.trim()}
                className="bg-terracotta-500 hover:bg-terracotta-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleAbandonQuest}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            Abandon Quest
          </Button>
        </div>
      </div>
    );
  }

  // Planning Wizard
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Plan Your Weekly Quest
        </h1>
        <p className="text-muted-foreground">
          Set your intention for the week and earn bonus XP
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(["level", "tasks", "review"] as WizardStep[]).map((step, idx) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                wizardStep === step
                  ? "bg-terracotta-500 text-white"
                  : idx <
                    ["level", "tasks", "review"].indexOf(wizardStep)
                  ? "bg-terracotta-200 text-terracotta-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {idx + 1}
            </div>
            {idx < 2 && (
              <div
                className={`w-12 h-0.5 mx-1 ${
                  idx < ["level", "tasks", "review"].indexOf(wizardStep)
                    ? "bg-terracotta-200"
                    : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Level */}
      {wizardStep === "level" && (
        <div>
          <h2 className="text-lg font-semibold text-foreground text-center mb-6">
            How much can you take on this week?
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {(Object.keys(OVERWHELM_LEVELS) as OverwhelmLevel[]).map((level) => {
              const config = OVERWHELM_LEVELS[level];
              return (
                <button
                  key={level}
                  onClick={() => handleLevelSelect(level)}
                  className={`p-6 rounded-lg border-2 text-left transition-all hover:border-terracotta-300 ${
                    selectedLevel === level
                      ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/20"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="text-4xl mb-3">{config.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {config.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {config.description}
                  </p>
                  <p className="text-sm font-medium text-terracotta-600">
                    {config.taskCount} tasks
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Select Tasks */}
      {wizardStep === "tasks" && selectedLevel && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setWizardStep("level")}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <p className="text-sm text-muted-foreground">
              {selectedTasks.length} / {targetTaskCount} tasks selected
            </p>
          </div>

          {/* Task Tabs */}
          <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
            <button
              onClick={() => setTaskTab("existing")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                taskTab === "existing"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              From Tasks
            </button>
            <button
              onClick={() => setTaskTab("new")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                taskTab === "new"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create New
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Task Source */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">
                  {taskTab === "existing" ? "Your Tasks" : "New Task"}
                </h3>
              </div>

              {taskTab === "existing" ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {existingTasks.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No incomplete tasks. Create new ones!
                    </div>
                  ) : (
                    existingTasks.map((task) => {
                      const isSelected = selectedTasks.some(
                        (t) => t.task_id === task.id
                      );
                      return (
                        <button
                          key={task.id}
                          onClick={() => handleAddExistingTask(task)}
                          disabled={isSelected}
                          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                            isSelected ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <p className="font-medium text-foreground">
                            {task.title}
                          </p>
                          <p className="text-sm text-terracotta-500">
                            +{task.xp} XP
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <Input
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                  />
                  <Button
                    onClick={handleAddNewTask}
                    disabled={!newTaskTitle.trim()}
                    className="w-full bg-terracotta-500 hover:bg-terracotta-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Selected Tasks */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">
                  Quest Tasks ({selectedTasks.length})
                </h3>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {selectedTasks.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Select or create tasks for your quest
                  </div>
                ) : (
                  selectedTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.source === "existing" ? "From tasks" : "New"} •{" "}
                          +{task.xp} XP
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveTask(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setWizardStep("review")}
              disabled={selectedTasks.length === 0}
              className="bg-terracotta-500 hover:bg-terracotta-600"
            >
              Review Quest
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {wizardStep === "review" && selectedLevel && (
        <div>
          <Button
            variant="ghost"
            onClick={() => setWizardStep("tasks")}
            className="mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">
                {OVERWHELM_LEVELS[selectedLevel].icon}
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {OVERWHELM_LEVELS[selectedLevel].name} Week
              </h2>
              <p className="text-muted-foreground">
                {selectedTasks.length} tasks committed
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Target className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">
                  {targetTaskCount}
                </p>
                <p className="text-xs text-muted-foreground">Target Tasks</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Sparkles className="w-5 h-5 mx-auto mb-2 text-terracotta-500" />
                <p className="text-2xl font-bold text-terracotta-600">1.5x</p>
                <p className="text-xs text-muted-foreground">XP Multiplier</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">7</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3">
                Quest Tasks
              </h3>
              <ul className="space-y-2">
                {selectedTasks.map((task, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground">{task.title}</span>
                    <span className="text-terracotta-500">+{task.xp} XP</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleStartQuest}
              disabled={creating}
              className="bg-terracotta-500 hover:bg-terracotta-600 px-8"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trophy className="w-4 h-4 mr-2" />
              )}
              Start Quest
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
