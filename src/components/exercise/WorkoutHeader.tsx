import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

type WorkoutHeaderProps = {
  totalWorkouts: number;
  totalMinutes: number;
  hasWorkoutToday: boolean;
};

export function WorkoutHeader({ totalWorkouts, totalMinutes, hasWorkoutToday }: WorkoutHeaderProps) {
  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-emerald-500" />
          Exercise Tracker
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Build strength, stay consistent</p>
      </motion.div>

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
          <p className="text-2xl font-bold text-orange-600">{hasWorkoutToday ? "✓" : "—"}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
      </div>
    </>
  );
}
