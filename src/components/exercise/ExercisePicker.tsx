import { useMemo, useState } from "react";
import type { Exercise, ExerciseType } from "@/lib/types";
import { Input } from "@/components/ui/input";

type ExercisePickerProps = {
  exercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
};

const FILTERS: Array<ExerciseType | "all"> = ["all", "strength", "cardio", "flexibility", "sports"];

export function ExercisePicker({ exercises, onAddExercise }: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ExerciseType | "all">("all");

  const filteredExercises = useMemo(
    () =>
      exercises.filter((exercise) => {
        const matchQuery = exercise.name.toLowerCase().includes(query.toLowerCase());
        const matchType = selectedType === "all" || exercise.type === selectedType;
        return matchQuery && matchType;
      }),
    [exercises, query, selectedType],
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Add exercise:</p>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search exercise"
          className="h-8"
        />
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((filterType) => (
            <button
              key={filterType}
              onClick={() => setSelectedType(filterType)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedType === filterType
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filteredExercises.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => onAddExercise(exercise)}
            className="px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80 transition-colors"
          >
            {exercise.name}
          </button>
        ))}
      </div>
    </div>
  );
}
