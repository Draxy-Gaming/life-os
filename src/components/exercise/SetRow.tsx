import { Input } from "@/components/ui/input";
import type { WorkoutSet } from "@/lib/types";

type SetRowProps = {
  set: WorkoutSet;
  onUpdate: (updates: Partial<WorkoutSet>) => void;
  onToggleComplete: (completed: boolean) => void;
  restSecondsRemaining?: number;
};

export function SetRow({ set, onUpdate, onToggleComplete, restSecondsRemaining = 0 }: SetRowProps) {
  return (
    <div className="grid grid-cols-4 gap-2 items-center">
      <span className="text-sm font-medium text-center">{set.setNumber}</span>
      <Input
        type="number"
        value={set.reps}
        onChange={(event) => onUpdate({ reps: parseInt(event.target.value, 10) || 0 })}
        className="h-8 text-sm text-center"
      />
      <Input
        type="number"
        value={set.weight}
        onChange={(event) => onUpdate({ weight: parseFloat(event.target.value) || 0 })}
        className="h-8 text-sm text-center"
      />
      <div className="mx-auto">
        <button
          onClick={() => onToggleComplete(!set.completed)}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
            set.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30"
          }`}
        >
          {set.completed && <span className="text-xs">✓</span>}
        </button>
        {set.completed && restSecondsRemaining > 0 && (
          <p className="text-[10px] text-blue-600 mt-1 text-center">{restSecondsRemaining}s</p>
        )}
      </div>
    </div>
  );
}
