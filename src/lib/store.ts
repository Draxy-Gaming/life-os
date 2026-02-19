"use client";

import { create } from "zustand";
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
  DailyScore,
} from "./types";
import { loadUserData, saveAllUserData } from "./sync";

interface AppState {
  // Auth / User
  userId: string | null;
  isLoading: boolean;
  isSynced: boolean;
  setUserId: (userId: string | null) => void;
  loadData: (userId: string) => Promise<void>;
  syncData: () => Promise<void>;

  // Onboarding
  isOnboarded: boolean;
  userSettings: UserSettings;
  setUserSettings: (settings: Partial<UserSettings>) => void;
  completeOnboarding: () => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string) => void;

  // Sleep
  sleepEntries: SleepEntry[];
  addSleepEntry: (entry: SleepEntry) => void;

  // Prayers
  dailyPrayers: Record<string, DailyPrayers>;
  updatePrayer: (date: string, updates: Partial<DailyPrayers>) => void;

  // Tasbih
  tasbihEntries: TasbihEntry[];
  setTasbihEntries: (entries: TasbihEntry[]) => void;
  incrementTasbih: (index: number) => void;
  resetTasbih: (index: number) => void;

  // Quran Log
  quranLogs: QuranLog[];
  addQuranLog: (log: QuranLog) => void;

  // Exams
  exams: Exam[];
  addExam: (exam: Exam) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Study Sessions
  studySessions: StudySession[];
  addStudySession: (session: StudySession) => void;

  // Exercises
  exercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;

  // Workout Logs
  workoutLogs: WorkoutLog[];
  addWorkoutLog: (log: WorkoutLog) => void;
  updateWorkoutLog: (id: string, updates: Partial<WorkoutLog>) => void;
  deleteWorkoutLog: (id: string) => void;

  // Workout Schedule
  workoutSchedule: WorkoutSchedule[];
  setWorkoutSchedule: (schedule: WorkoutSchedule[]) => void;

  // Daily Score
  getDailyScore: () => DailyScore;
}

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

export const useAppStore = create<AppState>()((set, get) => ({
  // Auth / User
  userId: null,
  isLoading: false,
  isSynced: false,
  setUserId: (userId) => set({ userId }),
  
  loadData: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await loadUserData(userId);
      console.log("store.loadData: Received data", data.userSettings);
      // Determine if user is onboarded based on whether they have completed initial setup
      const isOnboarded = !!(data.userSettings.name && data.userSettings.mainGoal);
      console.log("store.loadData: isOnboarded =", isOnboarded, "name:", data.userSettings.name, "mainGoal:", data.userSettings.mainGoal);
      set({
        userId,
        userSettings: data.userSettings,
        tasks: data.tasks,
        habits: data.habits,
        sleepEntries: data.sleepEntries,
        dailyPrayers: data.dailyPrayers,
        tasbihEntries: data.tasbihEntries,
        quranLogs: data.quranLogs,
        exams: data.exams,
        studySessions: data.studySessions,
        exercises: data.exercises,
        workoutLogs: data.workoutLogs,
        workoutSchedule: data.workoutSchedule,
        isLoading: false,
        isSynced: true,
        isOnboarded,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      set({ isLoading: false });
    }
  },

  syncData: async () => {
    const { userId, userSettings, tasks, habits, sleepEntries, dailyPrayers, tasbihEntries, quranLogs, exams, studySessions, exercises, workoutLogs, workoutSchedule } = get();
    if (!userId) {
      console.warn("syncData: userId is null, skipping sync");
      return;
    }
    
    try {
      console.log("syncData: Saving data for user", userId);
      await saveAllUserData(userId, {
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
        workoutSchedule,
      });
      console.log("syncData: Data saved successfully");
    } catch (error) {
      console.error("Error syncing data:", error);
    }
  },

  // Onboarding
  isOnboarded: false,
  userSettings: DEFAULT_USER_SETTINGS,
  setUserSettings: (settings) => {
    const state = get();
    const newSettings = { ...state.userSettings, ...settings };
    // If name and mainGoal are set, consider user onboarded
    const shouldBeOnboarded = !!(newSettings.name && newSettings.mainGoal);
    set({ 
      userSettings: newSettings,
      isOnboarded: shouldBeOnboarded || state.isOnboarded 
    });
    // Sync to database - only if we have a userId
    const currentUserId = get().userId;
    if (currentUserId) {
      console.log("Syncing user settings to database...", newSettings);
      get().syncData();
    } else {
      console.warn("Cannot sync: userId is not set yet!");
    }
  },
  completeOnboarding: () => set({ isOnboarded: true }),

  // Tasks
  tasks: [],
  addTask: (task) => {
    set((state) => ({ tasks: [...state.tasks, task] }));
    get().syncData();
  },
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    get().syncData();
  },
  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    get().syncData();
  },

  // Habits
  habits: DEFAULT_HABITS,
  addHabit: (habit) => {
    set((state) => ({ habits: [...state.habits, habit] }));
    get().syncData();
  },
  updateHabit: (id, updates) => {
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
    get().syncData();
  },
  deleteHabit: (id) => {
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
    get().syncData();
  },
  completeHabit: (id) => {
    const today = new Date().toDateString();
    set((state) => ({
      habits: state.habits.map((h) => {
        if (h.id !== id) return h;
        const wasCompletedToday = h.lastCompletedAt === today;
        if (wasCompletedToday) {
          return { ...h, completedToday: false, streakCount: Math.max(0, h.streakCount - 1), lastCompletedAt: null };
        }
        return {
          ...h,
          completedToday: true,
          streakCount: h.streakCount + 1,
          lastCompletedAt: today,
        };
      }),
    }));
    get().syncData();
  },

  // Sleep
  sleepEntries: [],
  addSleepEntry: (entry) => {
    set((state) => ({ sleepEntries: [...state.sleepEntries, entry] }));
    get().syncData();
  },

  // Prayers
  dailyPrayers: {},
  updatePrayer: (date, updates) => {
    set((state) => ({
      dailyPrayers: {
        ...state.dailyPrayers,
        [date]: { ...state.dailyPrayers[date], ...updates, date },
      },
    }));
    get().syncData();
  },

  // Tasbih
  tasbihEntries: DEFAULT_TASBIH,
  setTasbihEntries: (entries) => set({ tasbihEntries: entries }),
  incrementTasbih: (index) => {
    set((state) => ({
      tasbihEntries: state.tasbihEntries.map((t, i) =>
        i === index ? { ...t, count: t.count + 1 } : t
      ),
    }));
    get().syncData();
  },
  resetTasbih: (index) => {
    set((state) => ({
      tasbihEntries: state.tasbihEntries.map((t, i) =>
        i === index ? { ...t, count: 0 } : t
      ),
    }));
    get().syncData();
  },

  // Quran Log
  quranLogs: [],
  addQuranLog: (log) => {
    set((state) => ({ quranLogs: [...state.quranLogs, log] }));
    get().syncData();
  },

  // Exams
  exams: [
    {
      id: "ssc-main",
      subject: "SSC Exam",
      date: "2026-04-21",
      time: "09:00",
      tags: ["main", "high-priority"],
      notes: "Main SSC Examination",
    },
  ],
  addExam: (exam) => {
    set((state) => ({ exams: [...state.exams, exam] }));
    get().syncData();
  },
  updateExam: (id, updates) => {
    set((state) => ({
      exams: state.exams.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    get().syncData();
  },
  deleteExam: (id) => {
    set((state) => ({ exams: state.exams.filter((e) => e.id !== id) }));
    get().syncData();
  },

  // Study Sessions
  studySessions: [],
  addStudySession: (session) => {
    set((state) => ({ studySessions: [...state.studySessions, session] }));
    get().syncData();
  },

  // Exercises
  exercises: DEFAULT_EXERCISES,
  addExercise: (exercise) => {
    set((state) => ({ exercises: [...state.exercises, exercise] }));
    get().syncData();
  },
  updateExercise: (id, updates) => {
    set((state) => ({
      exercises: state.exercises.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    get().syncData();
  },
  deleteExercise: (id) => {
    set((state) => ({ exercises: state.exercises.filter((e) => e.id !== id) }));
    get().syncData();
  },

  // Workout Logs
  workoutLogs: [],
  addWorkoutLog: (log) => {
    set((state) => ({ workoutLogs: [...state.workoutLogs, log] }));
    get().syncData();
  },
  updateWorkoutLog: (id, updates) => {
    set((state) => ({
      workoutLogs: state.workoutLogs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
    get().syncData();
  },
  deleteWorkoutLog: (id) => {
    set((state) => ({ workoutLogs: state.workoutLogs.filter((l) => l.id !== id) }));
    get().syncData();
  },

  // Workout Schedule
  workoutSchedule: [],
  setWorkoutSchedule: (schedule) => set({ workoutSchedule: schedule }),

  // Daily Score
  getDailyScore: () => {
    const state = get();
    const today = new Date().toDateString();
    const todayDate = new Date().toISOString().split("T")[0];

    // Prayer score (5 prayers = 100%)
    const todayPrayers = state.dailyPrayers[today];
    let prayerScore = 0;
    if (todayPrayers) {
      const completed = [
        todayPrayers.fajr,
        todayPrayers.dhuhr,
        todayPrayers.asr,
        todayPrayers.maghrib,
        todayPrayers.isha,
      ].filter(Boolean).length;
      prayerScore = (completed / 5) * 100;
    }

    // Habits score
    const completedHabits = state.habits.filter((h) => h.completedToday).length;
    const habitsScore = state.habits.length > 0 ? (completedHabits / state.habits.length) * 100 : 0;

    // Academics score (based on study sessions today)
    const todaySessions = state.studySessions.filter(
      (s) => s.timestamp.startsWith(todayDate)
    );
    const academicsScore = Math.min(100, todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 1.2);

    // Exercise score (based on workout today)
    const todayWorkout = state.workoutLogs.find((l) => l.date === todayDate);
    const exerciseScore = todayWorkout ? Math.min(100, (todayWorkout.durationMinutes / 45) * 100) : 0;

    const total = Math.round((prayerScore + habitsScore + academicsScore + exerciseScore) / 4);

    return {
      prayer: Math.round(prayerScore),
      academics: Math.round(academicsScore),
      exercise: Math.round(exerciseScore),
      habits: Math.round(habitsScore),
      total,
    };
  },
}));
