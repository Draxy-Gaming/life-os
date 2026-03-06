import { AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SetRow } from "@/components/exercise/SetRow";
import type { WorkoutLogEntry, WorkoutSet } from "@/lib/types";

type WorkoutEntryCardProps = {
  entry: WorkoutLogEntry;
  entryIndex: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateSet: (setIndex: number, updates: Partial<WorkoutSet>) => void;
  onToggleComplete: (setIndex: number, completed: boolean) => void;
  restSecondsRemaining?: number;
};

export function WorkoutEntryCard({
  entry,
  entryIndex,
  isExpanded,
  onToggleExpanded,
  onUpdateSet,
  onToggleComplete,
  restSecondsRemaining = 0,
}: WorkoutEntryCardProps) {
  const completedSets = entry.sets.filter((set) => set.completed).length;
  const exerciseProgress = entry.sets.length ? Math.round((completedSets / entry.sets.length) * 100) : 0;

  return (
    <div className="rounded-xl border border-border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{entry.exerciseName}</p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={exerciseProgress} className="h-1.5" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{exerciseProgress}%</span>
          </div>
        </div>
        <button onClick={onToggleExpanded} className="text-muted-foreground" aria-label={`Toggle ${entry.exerciseName}`}>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground px-1">
              <span>Set</span>
              <span>Reps</span>
              <span>Weight (kg)</span>
              <span>Done</span>
            </div>
            {entry.sets.map((set, setIndex) => (
              <SetRow
                key={`${entryIndex}-${setIndex}`}
                set={set}
                onUpdate={(updates) => onUpdateSet(setIndex, updates)}
                onToggleComplete={(completed) => onToggleComplete(setIndex, completed)}
                restSecondsRemaining={restSecondsRemaining}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
