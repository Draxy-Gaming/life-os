"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Plus, Trash2, Play, Square, ChevronDown, ChevronUp,
  BarChart2, Calendar, Clock, Flame
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { getNowEpochMs } from "@/lib/utils";
import type { Exercise, WorkoutSet, ExerciseType } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const EXERCISE_TYPE_COLORS: Record<ExerciseType, string> = {
  strength: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cardio: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  flexibility: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sports: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ExercisePage() {
  const {
    exercises,
    addExercise,
    deleteExercise,
    workoutLogs,
    addWorkoutLog,
    workoutSchedule,
    setWorkoutSchedule,
    activeWorkoutSession,
    startWorkoutSession,
    updateWorkoutSessionEntry,
    finishWorkoutSession,
    discardWorkoutSession,
    hydrateWorkoutSessionFromStorage,
  } = useAppStore();

  const { isActive: isWorkoutActive, entries: activeWorkout, workoutName, startedAtEpochMs } = activeWorkoutSession;
  const workoutStartTime = startedAtEpochMs ? new Date(startedAtEpochMs) : null;

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExType, setNewExType] = useState<ExerciseType>("strength");
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(10);

  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  useEffect(() => {
    hydrateWorkoutSessionFromStorage();
  }, [hydrateWorkoutSessionFromStorage]);

  const handleStartWorkout = () => {
    startWorkoutSession(workoutName);
  };

  const handleFinishWorkout = () => {
    if (!workoutStartTime) return;
    const finishedAtEpochMs = getNowEpochMs();
    const duration = Math.round((finishedAtEpochMs - workoutStartTime.getTime()) / 60000);
    addWorkoutLog({
      id: finishedAtEpochMs.toString(),
      date: new Date().toISOString().split("T")[0],
      name: workoutName,
      entries: activeWorkout,
      durationMinutes: duration,
    });
    finishWorkoutSession();
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    const sets: WorkoutSet[] = Array.from({ length: exercise.defaultSets }, (_, i) => ({
      setNumber: i + 1,
      reps: exercise.defaultReps,
      weight: 0,
      unit: "kg" as const,
      completed: false,
    }));
    updateWorkoutSessionEntry((prev) => [
      ...prev,
      { exerciseId: exercise.id, exerciseName: exercise.name, sets },
    ]);
  };

  const updateSet = (entryIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
    updateWorkoutSessionEntry((prev) =>
      prev.map((entry, ei) =>
        ei === entryIndex
          ? {
              ...entry,
              sets: entry.sets.map((s, si) =>
                si === setIndex ? { ...s, ...updates } : s
              ),
            }
          : entry
      )
    );
  };

  const handleAddExercise = () => {
    if (!newExName.trim()) return;
    addExercise({
      id: getNowEpochMs().toString(),
      name: newExName,
      type: newExType,
      defaultSets: newExSets,
      defaultReps: newExReps,
      isCustom: true,
    });
    setNewExName("");
    setShowAddExercise(false);
  };

  // Weekly chart data
  const weeklyData = DAYS.map((day, i) => {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const diff = i - dayOfWeek;
    const targetDate = new Date(date);
    targetDate.setDate(date.getDate() + diff);
    const dateStr = targetDate.toISOString().split("T")[0];
    const log = workoutLogs.find((l) => l.date === dateStr);
    return {
      day,
      minutes: log?.durationMinutes || 0,
    };
  });

  const todayLog = workoutLogs.find(
    (l) => l.date === new Date().toISOString().split("T")[0]
  );

  const totalWorkouts = workoutLogs.length;
  const totalMinutes = workoutLogs.reduce((acc, l) => acc + l.durationMinutes, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-emerald-500" />
          Exercise Tracker
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Build strength, stay consistent</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{totalWorkouts}</p>
          <p className="text-xs text-muted-foreground">Workouts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{Math.round(totalMinutes / 60)}h</p>
          <p className="text-xs text-muted-foreground">Total Time</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{todayLog ? "✓" : "—"}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
      </div>

      {/* Active Workout */}
      <Card className={isWorkoutActive ? "border-emerald-300 dark:border-emerald-700" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${isWorkoutActive ? "text-orange-500 animate-pulse" : "text-muted-foreground"}`} />
            {isWorkoutActive ? "Resume workout" : "Start Workout"}
          </CardTitle>
          {!isWorkoutActive ? (
            <div className="flex gap-2">
              <Input
                value={workoutName}
                onChange={(e) => useAppStore.setState((state) => ({
                  activeWorkoutSession: {
                    ...state.activeWorkoutSession,
                    workoutName: e.target.value,
                    lastUpdatedAt: getNowEpochMs(),
                  },
                }))}
                placeholder="Workout name..."
                className="w-40 h-8 text-sm"
              />
              <Button size="sm" onClick={handleStartWorkout} className="bg-emerald-600 hover:bg-emerald-700">
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={discardWorkoutSession}>
              Discard
            </Button>
            <Button size="sm" variant="destructive" onClick={handleFinishWorkout}>
              <Square className="w-4 h-4 mr-1" />
              Finish
            </Button>
          </div>
          )}
        </CardHeader>

        {isWorkoutActive && (
          <CardContent className="space-y-4">
            {/* Active workout name */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{workoutName}</span>
              {workoutStartTime && (
                <span>• Started {workoutStartTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
              )}
            </div>

            {/* Exercise entries */}
            {activeWorkout.map((entry, entryIndex) => (
              <div key={entryIndex} className="rounded-xl border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{entry.exerciseName}</p>
                  <button
                    onClick={() => setExpandedExercise(
                      expandedExercise === `${entryIndex}` ? null : `${entryIndex}`
                    )}
                    className="text-muted-foreground"
                  >
                    {expandedExercise === `${entryIndex}` ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {(expandedExercise === `${entryIndex}` || true) && (
                    <div className="space-y-2">
                      {/* Set headers */}
                      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground px-1">
                        <span>Set</span>
                        <span>Reps</span>
                        <span>Weight (kg)</span>
                        <span>Done</span>
                      </div>
                      {entry.sets.map((set, setIndex) => (
                        <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                          <span className="text-sm font-medium text-center">{set.setNumber}</span>
                          <Input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSet(entryIndex, setIndex, { reps: parseInt(e.target.value) || 0 })}
                            className="h-8 text-sm text-center"
                          />
                          <Input
                            type="number"
                            value={set.weight}
                            onChange={(e) => updateSet(entryIndex, setIndex, { weight: parseFloat(e.target.value) || 0 })}
                            className="h-8 text-sm text-center"
                          />
                          <button
                            onClick={() => updateSet(entryIndex, setIndex, { completed: !set.completed })}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${
                              set.completed
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-muted-foreground/30"
                            }`}
                          >
                            {set.completed && <span className="text-xs">✓</span>}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Add exercise to workout */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Add exercise:</p>
              <div className="flex flex-wrap gap-2">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addExerciseToWorkout(ex)}
                    className="px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80 transition-colors"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Exercise Library */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Exercise Library
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowAddExercise(!showAddExercise)}>
            <Plus className="w-4 h-4 mr-1" />
            Custom
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {showAddExercise && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 space-y-3 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input value={newExName} onChange={(e) => setNewExName(e.target.value)} placeholder="Exercise name" className="mt-1 h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Type</Label>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(["strength", "cardio", "flexibility", "sports"] as ExerciseType[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => setNewExType(t)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              newExType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Default Sets</Label>
                      <Input type="number" value={newExSets} onChange={(e) => setNewExSets(parseInt(e.target.value) || 3)} className="mt-1 h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Default Reps</Label>
                      <Input type="number" value={newExReps} onChange={(e) => setNewExReps(parseInt(e.target.value) || 10)} className="mt-1 h-8" />
                    </div>
                  </div>
                  <Button onClick={handleAddExercise} size="sm" className="w-full" disabled={!newExName}>
                    Add Exercise
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-2">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.defaultSets} sets × {exercise.defaultReps} reps
                    {exercise.muscleGroup && ` • ${exercise.muscleGroup}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EXERCISE_TYPE_COLORS[exercise.type]}`}>
                  {exercise.type}
                </span>
                {exercise.isCustom && (
                  <button
                    onClick={() => deleteExercise(exercise.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="minutes" fill="#10b981" radius={[4, 4, 0, 0]} name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Workout History */}
      {workoutLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Workout History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workoutLogs.slice(-5).reverse().map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <div>
                    <p className="font-medium text-sm">{log.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.entries.length} exercises • {log.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{log.durationMinutes}m</p>
                    <p className="text-xs text-muted-foreground">duration</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
