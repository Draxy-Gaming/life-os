"use client";

import { supabase, Database } from "./supabase";
import type {
  UserSettings,
  Task,
  Habit,
  SleepEntry,
  Exam,
  StudySession,
  Exercise,
  WorkoutLog,
  WorkoutSchedule,
  DailyPrayers,
  TasbihEntry,
  QuranLog,
} from "./types";

// Type definitions for database rows
type UserSettingsRow = Database["public"]["Tables"]["user_settings"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type HabitRow = Database["public"]["Tables"]["habits"]["Row"];
type DailyPrayersRow = Database["public"]["Tables"]["daily_prayers"]["Row"];
type QuranLogRow = Database["public"]["Tables"]["quran_logs"]["Row"];
type ExamRow = Database["public"]["Tables"]["exams"]["Row"];
type StudySessionRow = Database["public"]["Tables"]["study_sessions"]["Row"];
type ExerciseRow = Database["public"]["Tables"]["exercises"]["Row"];
type WorkoutLogRow = Database["public"]["Tables"]["workout_logs"]["Row"];
type WorkoutEntryRow = Database["public"]["Tables"]["workout_entries"]["Row"];
type SleepEntryRow = Database["public"]["Tables"]["sleep_entries"]["Row"];
type TasbihEntryRow = Database["public"]["Tables"]["tasbih_entries"]["Row"];

export interface UserData {
  userSettings: UserSettings;
  tasks: Task[];
  habits: Habit[];
  sleepEntries: SleepEntry[];
  dailyPrayers: Record<string, DailyPrayers>;
  tasbihEntries: TasbihEntry[];
  quranLogs: QuranLog[];
  exams: Exam[];
  studySessions: StudySession[];
  exercises: Exercise[];
  workoutLogs: WorkoutLog[];
  workoutSchedule: WorkoutSchedule[];
}

// Default values
const DEFAULT_EXERCISES: Exercise[] = [
  { id: "1", name: "Push-ups", type: "strength", defaultSets: 3, defaultReps: 15, isCustom: false, muscleGroup: "Chest" },
  { id: "2", name: "Squats", type: "strength", defaultSets: 3, defaultReps: 20, isCustom: false, muscleGroup: "Legs" },
  { id: "3", name: "Pull-ups", type: "strength", defaultSets: 3, defaultReps: 8, isCustom: false, muscleGroup: "Back" },
  { id: "4", name: "Plank", type: "strength", defaultSets: 3, defaultReps: 60, isCustom: false, muscleGroup: "Core" },
  { id: "5", name: "Running", type: "cardio", defaultSets: 1, defaultReps: 30, isCustom: false },
  { id: "6", name: "Burpees", type: "strength", defaultSets: 3, defaultReps: 10, isCustom: false, muscleGroup: "Full Body" },
  { id: "7", name: "Lunges", type: "strength", defaultSets: 3, defaultReps: 12, isCustom: false, muscleGroup: "Legs" },
  { id: "8", name: "Dips", type: "strength", defaultSets: 3, defaultReps: 12, isCustom: false, muscleGroup: "Triceps" },
];

const DEFAULT_HABITS: Habit[] = [
  { id: "h1", name: "Morning Walk", icon: "🚶", streakCount: 0, lastCompletedAt: null, frozenStreak: false, completedToday: false },
  { id: "h2", name: "Read Quran", icon: "📖", streakCount: 0, lastCompletedAt: null, frozenStreak: false, completedToday: false },
  { id: "h3", name: "Drink 8 Glasses", icon: "💧", streakCount: 0, lastCompletedAt: null, frozenStreak: false, completedToday: false },
  { id: "h4", name: "No Social Media", icon: "📵", streakCount: 0, lastCompletedAt: null, frozenStreak: false, completedToday: false },
];

const DEFAULT_TASBIH: TasbihEntry[] = [
  { dhikr: "SubhanAllah", count: 0, target: 33 },
  { dhikr: "Alhamdulillah", count: 0, target: 33 },
  { dhikr: "Allahu Akbar", count: 0, target: 34 },
  { dhikr: "Astaghfirullah", count: 0, target: 100 },
];

const DEFAULT_USER_SETTINGS: UserSettings = {
  name: "",
  city: "London",
  country: "UK",
  latitude: 51.5074,
  longitude: -0.1278,
  mainGoal: "",
  sleepTarget: 8,
  theme: "system",
  calculationMethod: 0,
};

const DEFAULT_EXAM: Exam = {
  id: "ssc-main",
  subject: "SSC Exam",
  date: "2026-04-21",
  time: "09:00",
  tags: ["main", "high-priority"],
  notes: "Main SSC Examination",
};

// Load all user data from Supabase
export async function loadUserData(userId: string): Promise<UserData> {
  console.log("loadUserData: Starting for userId", userId);
  
  // First verify we can access the session
  const { data: sessionData } = await supabase.auth.getSession();
  console.log("loadUserData: Session check", sessionData?.session ? "authenticated" : "not authenticated");
  
  // User Settings - use maybeSingle to handle case when no settings exist yet
  console.log("loadUserData: Querying user_settings for userId", userId);
  const settingsResult = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<UserSettingsRow>();
  console.log("loadUserData: user_settings result", settingsResult.error ? "error: " + settingsResult.error.message : "success, data:", settingsResult.data);

  const [
    tasksResult,
    habitsResult,
    prayersResult,
    tasbihResult,
    quranResult,
    examsResult,
    studyResult,
    exercisesResult,
    workoutLogsResult,
    sleepResult,
  ] = await Promise.all([
    // Tasks
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),

    // Habits
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),

    // Daily Prayers
    supabase
      .from("daily_prayers")
      .select("*")
      .eq("user_id", userId),

    // Tasbih Entries
    supabase
      .from("tasbih_entries")
      .select("*")
      .eq("user_id", userId),

    // Quran Logs
    supabase
      .from("quran_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),

    // Exams
    supabase
      .from("exams")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true }),

    // Study Sessions
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false }),

    // Exercises
    supabase
      .from("exercises")
      .select("*")
      .eq("user_id", userId),

    // Workout Logs
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),

    // Sleep Entries
    supabase
      .from("sleep_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
  ]);

  // Transform data to app format
  const userSettings: UserSettings = settingsResult.data
    ? {
        name: settingsResult.data.name,
        city: settingsResult.data.city,
        country: settingsResult.data.country,
        latitude: settingsResult.data.latitude,
        longitude: settingsResult.data.longitude,
        mainGoal: settingsResult.data.main_goal,
        sleepTarget: settingsResult.data.sleep_target,
        theme: settingsResult.data.theme,
        calculationMethod: settingsResult.data.calculation_method,
      }
    : DEFAULT_USER_SETTINGS;

  const tasks: Task[] = (tasksResult.data || []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || "",
    status: t.status as "todo" | "in-progress" | "done",
    priority: t.priority as "deen" | "dunya" | "school",
    dueDate: t.due_date || undefined,
    createdAt: t.created_at,
  }));

  // Habits - if none exist, use defaults
  const habits: Habit[] = (habitsResult.data || []).length > 0
    ? habitsResult.data!.map((h) => ({
        id: h.id,
        name: h.name,
        icon: h.icon,
        streakCount: h.streak_count,
        lastCompletedAt: h.last_completed_at ? new Date(h.last_completed_at).toDateString() : null,
        frozenStreak: h.frozen_streak,
        completedToday: false, // Will be calculated fresh on load
      }))
    : DEFAULT_HABITS;

  // Daily Prayers - transform to record
  const dailyPrayers: Record<string, DailyPrayers> = {};
  (prayersResult.data || []).forEach((p) => {
    dailyPrayers[p.date] = {
      date: p.date,
      fajr: p.fajr,
      fajrMasjid: p.fajr_masjid,
      dhuhr: p.dhuhr,
      dhuhrMasjid: p.dhuhr_masjid,
      asr: p.asr,
      asrMasjid: p.asr_masjid,
      maghrib: p.maghrib,
      maghribMasjid: p.maghrib_masjid,
      isha: p.isha,
      ishaMasjid: p.isha_masjid,
      qadaCount: p.qada_count,
    };
  });

  // Tasbih - if none exist, use defaults
  const tasbihEntries: TasbihEntry[] = (tasbihResult.data || []).length > 0
    ? tasbihResult.data!.map((t) => ({
        dhikr: t.dhikr,
        count: t.count,
        target: t.target,
      }))
    : DEFAULT_TASBIH;

  const quranLogs: QuranLog[] = (quranResult.data || []).map((q) => ({
    id: q.id,
    date: q.date,
    pagesRead: q.pages_read,
    surah: q.surah || undefined,
    notes: q.notes || undefined,
  }));

  // Exams - if none exist, include default
  const exams: Exam[] = (examsResult.data || []).length > 0
    ? examsResult.data!.map((e) => ({
        id: e.id,
        subject: e.subject,
        date: e.date,
        time: e.time,
        tags: e.tags,
        notes: e.notes || undefined,
      }))
    : [DEFAULT_EXAM];

  const studySessions: StudySession[] = (studyResult.data || []).map((s) => ({
    id: s.id,
    subject: s.subject,
    durationMinutes: s.duration_minutes,
    pomodoroCount: s.pomodoro_count,
    timestamp: s.timestamp,
  }));

  // Exercises - if none exist, use defaults
  const exercises: Exercise[] = (exercisesResult.data || []).length > 0
    ? exercisesResult.data!.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type as "strength" | "cardio" | "flexibility" | "sports",
        defaultSets: e.default_sets,
        defaultReps: e.default_reps,
        isCustom: e.is_custom,
        muscleGroup: e.muscle_group || undefined,
      }))
    : DEFAULT_EXERCISES;

  const workoutLogs: WorkoutLog[] = (workoutLogsResult.data || []).map((w) => ({
    id: w.id,
    date: w.date,
    name: w.name,
    durationMinutes: w.duration_minutes,
    notes: w.notes || undefined,
    entries: [], // Entries are tracked separately
  }));

  const sleepEntries: SleepEntry[] = (sleepResult.data || []).map((s) => ({
    id: s.id,
    date: s.date,
    bedtime: s.bedtime,
    wakeTime: s.wake_time,
    duration: s.duration,
    quality: s.quality || undefined,
  }));

  return {
    userSettings,
    tasks,
    habits,
    sleepEntries,
    dailyPrayers,
    tasbihEntries,
    quranLogs,
    exams,
    studySessions,
    exercises,
    workoutLogs,
    workoutSchedule: [], // Workout schedule is not persisted to DB
  };
}

// Save user settings to Supabase
export async function saveUserSettings(userId: string, settings: UserSettings) {
  console.log("saveUserSettings: Saving", settings);
  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: userId,
        name: settings.name,
        city: settings.city,
        country: settings.country,
        latitude: settings.latitude,
        longitude: settings.longitude,
        main_goal: settings.mainGoal,
        sleep_target: settings.sleepTarget,
        theme: settings.theme,
        calculation_method: settings.calculationMethod,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Error saving user settings:", error);
  } else {
    console.log("saveUserSettings: Success!");
  }
}

// Save tasks to Supabase (full sync - replaces all tasks)
export async function saveTasks(userId: string, tasks: Task[]) {
  // Delete all existing tasks first
  await supabase.from("tasks").delete().eq("user_id", userId);

  if (tasks.length === 0) return;

  // Insert new tasks
  const { error } = await supabase.from("tasks").insert(
    tasks.map((t) => ({
      user_id: userId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      due_date: t.dueDate || null,
    }))
  );

  if (error) console.error("Error saving tasks:", error);
}

// Save habits to Supabase
export async function saveHabits(userId: string, habits: Habit[]) {
  // Delete existing habits
  await supabase.from("habits").delete().eq("user_id", userId);

  if (habits.length === 0) return;

  const { error } = await supabase.from("habits").insert(
    habits.map((h) => ({
      user_id: userId,
      name: h.name,
      icon: h.icon,
      streak_count: h.streakCount,
      last_completed_at: h.lastCompletedAt || null,
      frozen_streak: h.frozenStreak,
    }))
  );

  if (error) console.error("Error saving habits:", error);
}

// Save daily prayers for a specific date
export async function saveDailyPrayers(userId: string, date: string, prayers: DailyPrayers) {
  const { error } = await supabase
    .from("daily_prayers")
    .upsert(
      {
        user_id: userId,
        date,
        fajr: prayers.fajr,
        fajr_masjid: prayers.fajrMasjid,
        dhuhr: prayers.dhuhr,
        dhuhr_masjid: prayers.dhuhrMasjid,
        asr: prayers.asr,
        asr_masjid: prayers.asrMasjid,
        maghrib: prayers.maghrib,
        maghrib_masjid: prayers.maghribMasjid,
        isha: prayers.isha,
        isha_masjid: prayers.ishaMasjid,
        qada_count: prayers.qadaCount,
      },
      { onConflict: "user_id,date" }
    );

  if (error) console.error("Error saving daily prayers:", error);
}

// Save tasbih entries
export async function saveTasbihEntries(userId: string, entries: TasbihEntry[]) {
  // Delete existing
  await supabase.from("tasbih_entries").delete().eq("user_id", userId);

  if (entries.length === 0) return;

  const { error } = await supabase.from("tasbih_entries").insert(
    entries.map((e) => ({
      user_id: userId,
      dhikr: e.dhikr,
      count: e.count,
      target: e.target,
    }))
  );

  if (error) console.error("Error saving tasbih entries:", error);
}

// Save Quran logs
export async function saveQuranLogs(userId: string, logs: QuranLog[]) {
  await supabase.from("quran_logs").delete().eq("user_id", userId);

  if (logs.length === 0) return;

  const { error } = await supabase.from("quran_logs").insert(
    logs.map((l) => ({
      user_id: userId,
      date: l.date,
      pages_read: l.pagesRead,
      surah: l.surah || null,
      notes: l.notes || null,
    }))
  );

  if (error) console.error("Error saving quran logs:", error);
}

// Save exams
export async function saveExams(userId: string, exams: Exam[]) {
  await supabase.from("exams").delete().eq("user_id", userId);

  if (exams.length === 0) return;

  const { error } = await supabase.from("exams").insert(
    exams.map((e) => ({
      user_id: userId,
      subject: e.subject,
      date: e.date,
      time: e.time,
      tags: e.tags,
      notes: e.notes || null,
    }))
  );

  if (error) console.error("Error saving exams:", error);
}

// Save study sessions
export async function saveStudySessions(userId: string, sessions: StudySession[]) {
  await supabase.from("study_sessions").delete().eq("user_id", userId);

  if (sessions.length === 0) return;

  const { error } = await supabase.from("study_sessions").insert(
    sessions.map((s) => ({
      user_id: userId,
      subject: s.subject,
      duration_minutes: s.durationMinutes,
      pomodoro_count: s.pomodoroCount,
      timestamp: s.timestamp,
    }))
  );

  if (error) console.error("Error saving study sessions:", error);
}

// Save exercises
export async function saveExercises(userId: string, exercises: Exercise[]) {
  // Only save custom exercises, keep defaults in code
  const customExercises = exercises.filter((e) => e.isCustom);
  
  // Delete existing custom exercises
  await supabase.from("exercises").delete().eq("user_id", userId);

  if (customExercises.length === 0) return;

  const { error } = await supabase.from("exercises").insert(
    customExercises.map((e) => ({
      user_id: userId,
      name: e.name,
      type: e.type,
      default_sets: e.defaultSets,
      default_reps: e.defaultReps,
      is_custom: e.isCustom,
      muscle_group: e.muscleGroup || null,
    }))
  );

  if (error) console.error("Error saving exercises:", error);
}

// Save workout logs
export async function saveWorkoutLogs(userId: string, logs: WorkoutLog[]) {
  await supabase.from("workout_logs").delete().eq("user_id", userId);

  if (logs.length === 0) return;

  const { error } = await supabase.from("workout_logs").insert(
    logs.map((l) => ({
      user_id: userId,
      date: l.date,
      name: l.name,
      duration_minutes: l.durationMinutes,
      notes: l.notes || null,
    }))
  );

  if (error) console.error("Error saving workout logs:", error);
}

// Save sleep entries
export async function saveSleepEntries(userId: string, entries: SleepEntry[]) {
  await supabase.from("sleep_entries").delete().eq("user_id", userId);

  if (entries.length === 0) return;

  const { error } = await supabase.from("sleep_entries").insert(
    entries.map((s) => ({
      user_id: userId,
      date: s.date,
      bedtime: s.bedtime,
      wake_time: s.wakeTime,
      duration: s.duration,
      quality: s.quality || null,
    }))
  );

  if (error) console.error("Error saving sleep entries:", error);
}

// Save all user data to Supabase
export async function saveAllUserData(userId: string, data: UserData) {
  // Ensure userSettings is not null
  const settings = data.userSettings || DEFAULT_USER_SETTINGS;
  
  await Promise.all([
    saveUserSettings(userId, settings),
    saveTasks(userId, data.tasks),
    saveHabits(userId, data.habits),
    saveTasbihEntries(userId, data.tasbihEntries),
    saveQuranLogs(userId, data.quranLogs),
    saveExams(userId, data.exams),
    saveStudySessions(userId, data.studySessions),
    saveExercises(userId, data.exercises),
    saveWorkoutLogs(userId, data.workoutLogs),
    saveSleepEntries(userId, data.sleepEntries),
  ]);

  // Save daily prayers one by one (they're a record)
  for (const [date, prayers] of Object.entries(data.dailyPrayers)) {
    await saveDailyPrayers(userId, date, prayers);
  }
}
