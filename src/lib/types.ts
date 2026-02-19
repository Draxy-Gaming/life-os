// User & Settings
export interface UserSettings {
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  mainGoal: string;
  sleepTarget: number; // hours
  theme: "light" | "dark" | "system";
  calculationMethod: number;
}

// Prayer Types
export type PrayerName = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface PrayerTime {
  name: PrayerName;
  displayName: string;
  time: Date;
  status: "pending" | "completed" | "missed" | "current";
  masjid: boolean;
}

export interface DailyPrayers {
  date: string;
  fajr: boolean;
  fajrMasjid: boolean;
  dhuhr: boolean;
  dhuhrMasjid: boolean;
  asr: boolean;
  asrMasjid: boolean;
  maghrib: boolean;
  maghribMasjid: boolean;
  isha: boolean;
  ishaMasjid: boolean;
  qadaCount: number;
}

// Task Types
export type TaskPriority = "deen" | "dunya" | "school";
export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
}

// Habit Types
export interface Habit {
  id: string;
  name: string;
  icon: string;
  streakCount: number;
  lastCompletedAt: string | null;
  frozenStreak: boolean;
  completedToday: boolean;
}

// Sleep Types
export interface SleepEntry {
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number; // hours
  quality: 1 | 2 | 3 | 4 | 5;
}

// Exam Types
export interface Exam {
  id: string;
  subject: string;
  date: string;
  time: string;
  tags: string[];
  notes?: string;
}

// Study Session Types
export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  timestamp: string;
  pomodoroCount: number;
}

// Exercise Types
export type ExerciseType = "strength" | "cardio" | "flexibility" | "sports";

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  defaultSets: number;
  defaultReps: number;
  isCustom: boolean;
  muscleGroup?: string;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weight: number;
  unit: "kg" | "lbs";
  completed: boolean;
}

export interface WorkoutLogEntry {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  name: string;
  entries: WorkoutLogEntry[];
  durationMinutes: number;
  notes?: string;
}

export interface WorkoutSchedule {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  exercises: string[];
}

// Dashboard Stats
export interface DailyScore {
  prayer: number;
  academics: number;
  exercise: number;
  habits: number;
  total: number;
}

// Tasbih
export interface TasbihEntry {
  dhikr: string;
  count: number;
  target: number;
}

// Quran Log
export interface QuranLog {
  date: string;
  pagesRead: number;
  surah?: string;
  notes?: string;
}
