"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, Snowflake, Trash2, Moon, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const EMOJI_OPTIONS = ["🏃", "📖", "💧", "🧘", "💪", "🌿", "📵", "🎯", "✍️", "🍎", "🛌", "🙏"];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  deen: "bg-emerald-500",
  dunya: "bg-blue-500",
  school: "bg-violet-500",
};

function TaskCard({ task, onUpdate, onDelete }: {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}) {
  const statusColors: Record<TaskStatus, string> = {
    todo: "border-border bg-card",
    "in-progress": "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20",
    done: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
  };

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    todo: "in-progress",
    "in-progress": "done",
    done: "todo",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${statusColors[task.status]}`}
    >
      <button
        onClick={() => onUpdate(task.id, { status: nextStatus[task.status] })}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          task.status === "done"
            ? "bg-emerald-500 border-emerald-500 text-white"
            : task.status === "in-progress"
            ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30"
            : "border-muted-foreground/30"
        }`}
      >
        {task.status === "done" && <span className="text-xs">✓</span>}
        {task.status === "in-progress" && <span className="w-2 h-2 rounded-full bg-blue-500" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">{task.dueDate}</p>
        )}
      </div>

      <Badge variant={task.priority as "deen" | "dunya" | "school"} className="text-xs shrink-0">
        {task.priority}
      </Badge>

      <button
        onClick={() => onDelete(task.id)}
        className="text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function HabitsPage() {
  const { habits, tasks, addTask, updateTask, deleteTask, completeHabit, addHabit, deleteHabit, sleepEntries, addSleepEntry } = useAppStore();

  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitEmoji, setNewHabitEmoji] = useState("🎯");
  const [showAddHabit, setShowAddHabit] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("school");
  const [newTaskDue, setNewTaskDue] = useState("");

  const [bedtime, setBedtime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("06:00");

  const completedHabits = habits.filter((h) => h.completedToday).length;
  const habitProgress = habits.length > 0 ? (completedHabits / habits.length) * 100 : 0;

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    addHabit({
      id: Date.now().toString(),
      name: newHabitName,
      icon: newHabitEmoji,
      streakCount: 0,
      lastCompletedAt: null,
      frozenStreak: false,
      completedToday: false,
    });
    setNewHabitName("");
    setShowAddHabit(false);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask({
      id: Date.now().toString(),
      title: newTaskTitle,
      status: "todo",
      priority: newTaskPriority,
      dueDate: newTaskDue || undefined,
      createdAt: new Date().toISOString(),
    });
    setNewTaskTitle("");
    setNewTaskDue("");
  };

  const handleLogSleep = () => {
    const [bedH, bedM] = bedtime.split(":").map(Number);
    const [wakeH, wakeM] = wakeTime.split(":").map(Number);
    let duration = (wakeH * 60 + wakeM) - (bedH * 60 + bedM);
    if (duration < 0) duration += 24 * 60;
    duration = duration / 60;

    addSleepEntry({
      date: new Date().toISOString().split("T")[0],
      bedtime,
      wakeTime,
      duration,
      quality: 3,
    });
  };

  // Sleep chart data
  const sleepChartData = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const entry = sleepEntries.find((e) => e.date === dateStr);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      hours: entry?.duration || 0,
      target: 8,
    };
  });

  const activeTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Daily Routine & Habits</h1>
        <p className="text-muted-foreground text-sm mt-1">Build consistency, one day at a time</p>
      </motion.div>

      {/* Habit Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold">Today&apos;s Habits</p>
              <p className="text-sm text-muted-foreground">{completedHabits}/{habits.length} completed</p>
            </div>
            <span className="text-3xl font-bold text-primary">{Math.round(habitProgress)}%</span>
          </div>
          <Progress value={habitProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Habits Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Habit Tracker
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowAddHabit(!showAddHabit)}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {showAddHabit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 space-y-3 mb-3">
                  <div className="flex gap-2">
                    <Input
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      placeholder="Habit name..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
                    />
                    <Button onClick={handleAddHabit} size="sm">Add</Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewHabitEmoji(emoji)}
                        className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
                          newHabitEmoji === emoji ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-2">
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  habit.completedToday
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                }`}
                onClick={() => completeHabit(habit.id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                  habit.completedToday ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-muted"
                }`}>
                  {habit.completedToday ? "✓" : habit.icon}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-sm">{habit.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-muted-foreground">{habit.streakCount} day streak</span>
                    {habit.frozenStreak && (
                      <span title="Streak frozen">
                        <Snowflake className="w-3 h-3 text-blue-400" />
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Task Manager */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Smart Task Manager</CardTitle>
          <div className="flex gap-1">
            {(["deen", "dunya", "school"] as TaskPriority[]).map((p) => (
              <button
                key={p}
                onClick={() => setNewTaskPriority(p)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  newTaskPriority === p
                    ? `${PRIORITY_COLORS[p]} text-white`
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add task */}
          <div className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a task..."
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              className="flex-1"
            />
            <Input
              type="date"
              value={newTaskDue}
              onChange={(e) => setNewTaskDue(e.target.value)}
              className="w-36"
            />
            <Button onClick={handleAddTask} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Active tasks */}
          <AnimatePresence>
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
            ))}
          </AnimatePresence>

          {activeTasks.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">No active tasks. Add one above!</p>
          )}

          {/* Done tasks */}
          {doneTasks.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Completed ({doneTasks.length})</p>
              <AnimatePresence>
                {doneTasks.slice(-3).map((task) => (
                  <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sleep Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-500" />
            Sleep Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Log sleep */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Bedtime</Label>
              <Input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Wake Time</Label>
              <Input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={handleLogSleep} variant="outline" className="w-full">
            Log Sleep
          </Button>

          {/* Chart */}
          <div>
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Last 7 Days
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={sleepChartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sleep (hrs)" />
                <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
