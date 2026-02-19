import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table types
export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          id: string;
          name: string;
          city: string;
          country: string;
          latitude: number;
          longitude: number;
          main_goal: string;
          sleep_target: number;
          theme: 'light' | 'dark' | 'system';
          calculation_method: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          country: string;
          latitude: number;
          longitude: number;
          main_goal?: string;
          sleep_target?: number;
          theme?: 'light' | 'dark' | 'system';
          calculation_method?: number;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string;
          country?: string;
          latitude?: number;
          longitude?: number;
          main_goal?: string;
          sleep_target?: number;
          theme?: 'light' | 'dark' | 'system';
          calculation_method?: number;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: 'todo' | 'in-progress' | 'done';
          priority: 'deen' | 'dunya' | 'school';
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in-progress' | 'done';
          priority: 'deen' | 'dunya' | 'school';
          due_date?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          status?: 'todo' | 'in-progress' | 'done';
          priority?: 'deen' | 'dunya' | 'school';
          due_date?: string | null;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          streak_count: number;
          last_completed_at: string | null;
          frozen_streak: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon: string;
          streak_count?: number;
          last_completed_at?: string | null;
          frozen_streak?: boolean;
        };
        Update: {
          name?: string;
          icon?: string;
          streak_count?: number;
          last_completed_at?: string | null;
          frozen_streak?: boolean;
        };
      };
      daily_prayers: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          fajr: boolean;
          fajr_masjid: boolean;
          dhuhr: boolean;
          dhuhr_masjid: boolean;
          asr: boolean;
          asr_masjid: boolean;
          maghrib: boolean;
          maghrib_masjid: boolean;
          isha: boolean;
          isha_masjid: boolean;
          qada_count: number;
        };
        Insert: {
          user_id: string;
          date: string;
          fajr?: boolean;
          fajr_masjid?: boolean;
          dhuhr?: boolean;
          dhuhr_masjid?: boolean;
          asr?: boolean;
          asr_masjid?: boolean;
          maghrib?: boolean;
          maghrib_masjid?: boolean;
          isha?: boolean;
          isha_masjid?: boolean;
          qada_count?: number;
        };
        Update: {
          fajr?: boolean;
          fajr_masjid?: boolean;
          dhuhr?: boolean;
          dhuhr_masjid?: boolean;
          asr?: boolean;
          asr_masjid?: boolean;
          maghrib?: boolean;
          maghrib_masjid?: boolean;
          isha?: boolean;
          isha_masjid?: boolean;
          qada_count?: number;
        };
      };
      prayer_completions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          prayer_name: string;
          completed_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          prayer_name: string;
        };
        Update: {
          date?: string;
          prayer_name?: string;
        };
      };
      quran_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          pages_read: number;
          surah: string | null;
          notes: string | null;
        };
        Insert: {
          user_id: string;
          date: string;
          pages_read: number;
          surah?: string | null;
          notes?: string | null;
        };
        Update: {
          pages_read?: number;
          surah?: string | null;
          notes?: string | null;
        };
      };
      exams: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          date: string;
          time: string;
          tags: string[];
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          date: string;
          time: string;
          tags?: string[];
          notes?: string | null;
        };
        Update: {
          subject?: string;
          date?: string;
          time?: string;
          tags?: string[];
          notes?: string | null;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          duration_minutes: number;
          pomodoro_count: number;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          duration_minutes: number;
          pomodoro_count?: number;
          timestamp: string;
        };
        Update: {
          subject?: string;
          duration_minutes?: number;
          pomodoro_count?: number;
        };
      };
      exercises: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'strength' | 'cardio' | 'flexibility' | 'sports';
          default_sets: number;
          default_reps: number;
          is_custom: boolean;
          muscle_group: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'strength' | 'cardio' | 'flexibility' | 'sports';
          default_sets?: number;
          default_reps?: number;
          is_custom?: boolean;
          muscle_group?: string | null;
        };
        Update: {
          name?: string;
          type?: 'strength' | 'cardio' | 'flexibility' | 'sports';
          default_sets?: number;
          default_reps?: number;
          is_custom?: boolean;
          muscle_group?: string | null;
        };
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          name: string;
          duration_minutes: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          name: string;
          duration_minutes: number;
          notes?: string | null;
        };
        Update: {
          date?: string;
          name?: string;
          duration_minutes?: number;
          notes?: string | null;
        };
      };
      workout_entries: {
        Row: {
          id: string;
          workout_log_id: string;
          exercise_id: string;
          exercise_name: string;
          sets: unknown;
        };
        Insert: {
          id?: string;
          workout_log_id: string;
          exercise_id: string;
          exercise_name: string;
          sets: unknown;
        };
        Update: {
          exercise_id?: string;
          exercise_name?: string;
          sets?: unknown;
        };
      };
      sleep_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          bedtime: string;
          wake_time: string;
          duration: number;
          quality: 1 | 2 | 3 | 4 | 5;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          bedtime: string;
          wake_time: string;
          duration: number;
          quality: 1 | 2 | 3 | 4 | 5;
        };
        Update: {
          bedtime?: string;
          wake_time?: string;
          duration?: number;
          quality?: 1 | 2 | 3 | 4 | 5;
        };
      };
      tasbih_entries: {
        Row: {
          id: string;
          user_id: string;
          dhikr: string;
          count: number;
          target: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          dhikr: string;
          count?: number;
          target: number;
        };
        Update: {
          dhikr?: string;
          count?: number;
          target?: number;
        };
      };
    };
  };
}
