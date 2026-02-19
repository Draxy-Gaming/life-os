"use client";

import { useState, useEffect } from "react";
import { calculatePrayerTimes, getCurrentPrayer, getNextPrayer, type PrayerTimesResult } from "@/lib/prayer-times";
import type { PrayerName } from "@/lib/types";

interface PrayerTimesState {
  times: PrayerTimesResult | null;
  currentPrayer: PrayerName | null;
  nextPrayer: { name: PrayerName; time: Date } | null;
  loading: boolean;
  error: string | null;
}

export function usePrayerTimes(latitude: number, longitude: number) {
  const [state, setState] = useState<PrayerTimesState>({
    times: null,
    currentPrayer: null,
    nextPrayer: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      try {
        const times = calculatePrayerTimes(latitude, longitude);
        const currentPrayer = getCurrentPrayer(times);
        const nextPrayer = getNextPrayer(times);
        setState({
          times,
          currentPrayer,
          nextPrayer,
          loading: false,
          error: null,
        });
      } catch {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to calculate prayer times",
        }));
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [latitude, longitude]);

  // Update current/next prayer every minute
  useEffect(() => {
    if (!state.times) return;

    const interval = setInterval(() => {
      const currentPrayer = getCurrentPrayer(state.times!);
      const nextPrayer = getNextPrayer(state.times!);
      setState((prev) => ({ ...prev, currentPrayer, nextPrayer }));
    }, 60000);

    return () => clearInterval(interval);
  }, [state.times]);

  return state;
}
