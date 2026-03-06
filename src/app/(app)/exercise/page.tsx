"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart2, Calendar, Dumbbell, Flame, Plus, Trash2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExercisePicker } from "@/components/exercise/ExercisePicker";
import { WorkoutEntryCard } from "@/components/exercise/WorkoutEntryCard";
import { WorkoutHeader } from "@/components/exercise/WorkoutHeader";
import { WorkoutSummary } from "@/components/exercise/WorkoutSummary";
import { WorkoutTimer } from "@/components/exercise/WorkoutTimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import type { Exercise, ExerciseType, WorkoutLogEntry, WorkoutSet } from "@/lib/types";

const EXERCISE_TYPE_COLORS: Record<ExerciseType, string> = {
  strength: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cardio: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  flexibility: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sports: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ExercisePage() {
  const { exercises, addExercise, deleteExercise, workoutLogs, addWorkoutLog } = useAppStore();

  const [activeWorkout, setActiveWorkout] = useState<WorkoutLogEntry[]>([]);
  const [workoutName, setWorkoutName] = useState("Morning Workout");
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExType, setNewExType] = useState<ExerciseType>("strength");
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(10);

  const [restTimerEnabled, setRestTimerEnabled] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(0);

  const lastWorkout = workoutLogs.at(-1);

  useEffect(() => {
    if (!restSecondsRemaining) return;

    const interval = setInterval(() => {
      setRestSecondsRemaining((prev) => {
        if (prev <= 1) {
          triggerRestCue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restSecondsRemaining]);

  const triggerRestCue = () => {
    if (typeof window === "undefined") return;

    // Hook point: replace with preferred audio cue when available.
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(200);
    }
  };

  const cloneEntry = (entry: WorkoutLogEntry) => ({
    exerciseId: entry.exerciseId,
    exerciseName: entry.exerciseName,
    sets: entry.sets.map((set, index) => ({
      ...set,
      setNumber: index + 1,
      completed: false,
    })),
  });

  const seedFromLastWorkout = () => {
    if (!lastWorkout) return;
    setWorkoutName(lastWorkout.name);
    setActiveWorkout(lastWorkout.entries.map(cloneEntry));
  };

  const copyLastExerciseOrder = () => {
    if (!lastWorkout) return;
    setActiveWorkout(lastWorkout.entries.map(cloneEntry));
  };

  const handleStartWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutStartTime(new Date());
    setRestSecondsRemaining(0);

    if (!activeWorkout.length) {
      setActiveWorkout([]);
    }
  };

  const handleFinishWorkout = () => {
    if (!workoutStartTime) return;

    const duration = Math.round((Date.now() - workoutStartTime.getTime()) / 60000);
    addWorkoutLog({
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      name: workoutName,
      entries: activeWorkout,
      durationMinutes: duration,
    });

    setIsWorkoutActive(false);
    setActiveWorkout([]);
    setWorkoutStartTime(null);
    setExpandedExercise(null);
    setRestSecondsRemaining(0);
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    const sets: WorkoutSet[] = Array.from({ length: exercise.defaultSets }, (_, index) => ({
      setNumber: index + 1,
      reps: exercise.defaultReps,
      weight: 0,
      unit: "kg",
      completed: false,
    }));

    setActiveWorkout((prev) => [
      ...prev,
      { exerciseId: exercise.id, exerciseName: exercise.name, sets },
    ]);
  };

  const updateSet = (
    entryIndex: number,
    setIndex: number,
    updates: Partial<WorkoutSet>,
  ) => {
    setActiveWorkout((prev) =>
      prev.map((entry, currentEntryIndex) =>
        currentEntryIndex === entryIndex
          ? {
              ...entry,
              sets: entry.sets.map((set, currentSetIndex) =>
                currentSetIndex === setIndex ? { ...set, ...updates } : set,
              ),
            }
          : entry,
      ),
    );
  };

  const handleToggleSetComplete = (entryIndex: number, setIndex: number, completed: boolean) => {
    const currentSet = activeWorkout[entryIndex]?.sets[setIndex];
    const wasCompleted = currentSet?.completed;

    updateSet(entryIndex, setIndex, { completed });

    if (restTimerEnabled && completed && !wasCompleted) {
      setRestSecondsRemaining(restDuration);
    }
  };

  const handleAddExercise = () => {
    if (!newExName.trim()) return;

    addExercise({
      id: Date.now().toString(),
      name: newExName,
      type: newExType,
      defaultSets: newExSets,
      defaultReps: newExReps,
      isCustom: true,
    });

    setNewExName("");
    setShowAddExercise(false);
  };

  const weeklyData = DAYS.map((day, index) => {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const diff = index - dayOfWeek;
    const targetDate = new Date(date);
    targetDate.setDate(date.getDate() + diff);
    const dateStr = targetDate.toISOString().split("T")[0];
    const log = workoutLogs.find((item) => item.date === dateStr);

    return { day, minutes: log?.durationMinutes || 0 };
  });

  const todayLog = workoutLogs.find(
    (log) => log.date === new Date().toISOString().split("T")[0],
  );

  const totalWorkouts = workoutLogs.length;
  const totalMinutes = workoutLogs.reduce((acc, log) => acc + log.durationMinutes, 0);

  const sessionStats = useMemo(() => {
    const totalSets = activeWorkout.reduce((acc, entry) => acc + entry.sets.length, 0);
    const completedSets = activeWorkout.reduce(
      (acc, entry) => acc + entry.sets.filter((set) => set.completed).length,
      0,
    );

    return {
      totalSets,
      completedSets,
      percent: totalSets ? Math.round((completedSets / totalSets) * 100) : 0,
    };
  }, [activeWorkout]);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <WorkoutHeader totalWorkouts={totalWorkouts} totalMinutes={totalMinutes} hasWorkoutToday={Boolean(todayLog)} />

      <Card className={isWorkoutActive ? "border-emerald-300 dark:border-emerald-700" : ""}>
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame className={`w-5 h-5 ${isWorkoutActive ? "text-orange-500 animate-pulse" : "text-muted-foreground"}`} />
              {isWorkoutActive ? "Active Workout" : "Start Workout"}
            </CardTitle>

            {isWorkoutActive ? (
              <Button size="sm" variant="destructive" onClick={handleFinishWorkout}>
                Finish
              </Button>
            ) : (
              <Button size="sm" onClick={handleStartWorkout} className="bg-emerald-600 hover:bg-emerald-700">
                Start
              </Button>
            )}
          </div>

          {!isWorkoutActive && (
            <div className="space-y-2">
              <Input
                value={workoutName}
                onChange={(event) => setWorkoutName(event.target.value)}
                placeholder="Workout name..."
                className="h-8 text-sm"
              />
              {lastWorkout && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={seedFromLastWorkout}>
                    Duplicate last workout
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyLastExerciseOrder}>
                    Copy last exercise order
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        {isWorkoutActive && (
          <CardContent className="space-y-4">
            <WorkoutTimer workoutName={workoutName} workoutStartTime={workoutStartTime} />

            <WorkoutSummary
              completedSets={sessionStats.completedSets}
              totalSets={sessionStats.totalSets}
              percent={sessionStats.percent}
            />

            <div className="rounded-xl border border-dashed border-border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Rest timer</p>
                <Button
                  variant={restTimerEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRestTimerEnabled((prev) => !prev)}
                >
                  {restTimerEnabled ? "On" : "Off"}
                </Button>
              </div>
              {restTimerEnabled && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Duration (sec)</Label>
                  <Input
                    type="number"
                    min={10}
                    value={restDuration}
                    onChange={(event) => setRestDuration(parseInt(event.target.value, 10) || 60)}
                    className="h-8 w-28"
                  />
                  {restSecondsRemaining > 0 && (
                    <Badge className="bg-blue-600 text-white">Rest {restSecondsRemaining}s</Badge>
                  )}
                </div>
              )}
            </div>

            {activeWorkout.map((entry, entryIndex) => (
              <WorkoutEntryCard
                key={`${entry.exerciseId}-${entryIndex}`}
                entry={entry}
                entryIndex={entryIndex}
                isExpanded={expandedExercise === `${entryIndex}`}
                onToggleExpanded={() =>
                  setExpandedExercise((prev) => (prev === `${entryIndex}` ? null : `${entryIndex}`))
                }
                onUpdateSet={(setIndex, updates) => updateSet(entryIndex, setIndex, updates)}
                onToggleComplete={(setIndex, completed) =>
                  handleToggleSetComplete(entryIndex, setIndex, completed)
                }
                restSecondsRemaining={restTimerEnabled ? restSecondsRemaining : 0}
              />
            ))}

            <ExercisePicker exercises={exercises} onAddExercise={addExerciseToWorkout} />
          </CardContent>
        )}
      </Card>

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
                      <Input value={newExName} onChange={(event) => setNewExName(event.target.value)} placeholder="Exercise name" className="mt-1 h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Type</Label>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(["strength", "cardio", "flexibility", "sports"] as ExerciseType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setNewExType(type)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              newExType === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Default Sets</Label>
                      <Input type="number" value={newExSets} onChange={(event) => setNewExSets(parseInt(event.target.value, 10) || 3)} className="mt-1 h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Default Reps</Label>
                      <Input type="number" value={newExReps} onChange={(event) => setNewExReps(parseInt(event.target.value, 10) || 10)} className="mt-1 h-8" />
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
              {workoutLogs.slice(-5).reverse().map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-border">
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
