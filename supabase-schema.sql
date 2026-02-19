-- Supabase Database Schema for LifeOS
-- Run this in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User Settings Table
create table user_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  name text not null,
  city text not null,
  country text not null,
  latitude float not null,
  longitude float not null,
  main_goal text default '',
  sleep_target float default 8,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  calculation_method int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks Table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in-progress', 'done')),
  priority text not null check (priority in ('deen', 'dunya', 'school')),
  due_date date,
  created_at timestamptz default now()
);

-- Habits Table
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null,
  streak_count int default 0,
  last_completed_at timestamptz,
  frozen_streak boolean default false,
  created_at timestamptz default now()
);

-- Daily Prayers Table
create table daily_prayers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  fajr boolean default false,
  fajr_masjid boolean default false,
  fajr_completed_at timestamptz,
  dhuhr boolean default false,
  dhuhr_masjid boolean default false,
  dhuhr_completed_at timestamptz,
  asr boolean default false,
  asr_masjid boolean default false,
  asr_completed_at timestamptz,
  maghrib boolean default false,
  maghrib_masjid boolean default false,
  maghrib_completed_at timestamptz,
  isha boolean default false,
  isha_masjid boolean default false,
  isha_completed_at timestamptz,
  qada_count int default 0,
  unique(user_id, date)
);

-- Prayer Completions (for tracking individual prayers)
create table prayer_completions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  prayer_name text not null,
  completed_at timestamptz default now()
);

-- Quran Logs Table
create table quran_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  pages_read int not null,
  surah text,
  notes text,
  created_at timestamptz default now()
);

-- Exams Table
create table exams (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  date date not null,
  time text not null,
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

-- Study Sessions Table
create table study_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  duration_minutes int not null,
  pomodoro_count int default 0,
  timestamp timestamptz default now()
);

-- Exercises Table
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('strength', 'cardio', 'flexibility', 'sports')),
  default_sets int default 3,
  default_reps int default 10,
  is_custom boolean default false,
  muscle_group text
);

-- Workout Logs Table
create table workout_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  name text not null,
  duration_minutes int not null,
  notes text,
  created_at timestamptz default now()
);

-- Workout Entries Table (individual exercises in a workout)
create table workout_entries (
  id uuid default uuid_generate_v4() primary key,
  workout_log_id uuid references workout_logs(id) on delete cascade not null,
  exercise_id text not null,
  exercise_name text not null,
  sets jsonb not null
);

-- Sleep Entries Table
create table sleep_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  bedtime text not null,
  wake_time text not null,
  duration float not null,
  quality int check (quality in (1, 2, 3, 4, 5)),
  unique(user_id, date)
);

-- Tasbih Entries Table
create table tasbih_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  dhikr text not null,
  count int default 0,
  target int not null,
  unique(user_id, dhikr)
);

-- Row Level Security (RLS) Policies
alter table user_settings enable row level security;
alter table tasks enable row level security;
alter table habits enable row level security;
alter table daily_prayers enable row level security;
alter table prayer_completions enable row level security;
alter table quran_logs enable row level security;
alter table exams enable row level security;
alter table study_sessions enable row level security;
alter table exercises enable row level security;
alter table workout_logs enable row level security;
alter table workout_entries enable row level security;
alter table sleep_entries enable row level security;
alter table tasbih_entries enable row level security;

-- Create policies to allow authenticated users to access their own data
create policy "Users can manage their own user_settings" on user_settings
  for all using (auth.uid() = user_id);

create policy "Users can manage their own tasks" on tasks
  for all using (auth.uid() = user_id);

create policy "Users can manage their own habits" on habits
  for all using (auth.uid() = user_id);

create policy "Users can manage their own daily_prayers" on daily_prayers
  for all using (auth.uid() = user_id);

create policy "Users can manage their own prayer_completions" on prayer_completions
  for all using (auth.uid() = user_id);

create policy "Users can manage their own quran_logs" on quran_logs
  for all using (auth.uid() = user_id);

create policy "Users can manage their own exams" on exams
  for all using (auth.uid() = user_id);

create policy "Users can manage their own study_sessions" on study_sessions
  for all using (auth.uid() = user_id);

create policy "Users can manage their own exercises" on exercises
  for all using (auth.uid() = user_id);

create policy "Users can manage their own workout_logs" on workout_logs
  for all using (auth.uid() = user_id);

create policy "Users can manage their own workout_entries" on workout_entries
  for all using (auth.uid() = user_id);

create policy "Users can manage their own sleep_entries" on sleep_entries
  for all using (auth.uid() = user_id);

create policy "Users can manage their own tasbih_entries" on tasbih_entries
  for all using (auth.uid() = user_id);
