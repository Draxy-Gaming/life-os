-- Migration: Add prayer completion timestamps to daily_prayers table
-- This migration adds timestamp columns to track when each prayer was marked as complete
-- These columns allow for better tracking and analytics of prayer completion times

BEGIN;

-- Add completion timestamp columns for each prayer
ALTER TABLE daily_prayers
ADD COLUMN fajr_completed_at timestamptz,
ADD COLUMN dhuhr_completed_at timestamptz,
ADD COLUMN asr_completed_at timestamptz,
ADD COLUMN maghrib_completed_at timestamptz,
ADD COLUMN isha_completed_at timestamptz;

-- Comment on the new columns for clarity
COMMENT ON COLUMN daily_prayers.fajr_completed_at IS 'Timestamp when Fajr prayer was marked as complete';
COMMENT ON COLUMN daily_prayers.dhuhr_completed_at IS 'Timestamp when Dhuhr prayer was marked as complete';
COMMENT ON COLUMN daily_prayers.asr_completed_at IS 'Timestamp when Asr prayer was marked as complete';
COMMENT ON COLUMN daily_prayers.maghrib_completed_at IS 'Timestamp when Maghrib prayer was marked as complete';
COMMENT ON COLUMN daily_prayers.isha_completed_at IS 'Timestamp when Isha prayer was marked as complete';

COMMIT;
