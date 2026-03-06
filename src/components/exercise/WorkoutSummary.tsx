import { Progress } from "@/components/ui/progress";

type WorkoutSummaryProps = {
  completedSets: number;
  totalSets: number;
  percent: number;
};

export function WorkoutSummary({ completedSets, totalSets, percent }: WorkoutSummaryProps) {
  return (
    <div className="rounded-xl border border-border p-3 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium">Session progress</p>
        <p className="text-muted-foreground">
          {completedSets}/{totalSets} sets
        </p>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
