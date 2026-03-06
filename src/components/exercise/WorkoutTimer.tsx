import { Clock } from "lucide-react";

type WorkoutTimerProps = {
  workoutName: string;
  workoutStartTime: Date | null;
};

export function WorkoutTimer({ workoutName, workoutStartTime }: WorkoutTimerProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="w-4 h-4" />
      <span>{workoutName}</span>
      {workoutStartTime && (
        <span>
          • Started {workoutStartTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}
