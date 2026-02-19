import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes, Qibla } from "adhan";
import type { PrayerTime, PrayerName } from "./types";

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  midnight: Date;
}

export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): PrayerTimesResult {
  const coordinates = new Coordinates(latitude, longitude);
  const params = CalculationMethod.MoonsightingCommittee();
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);

  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    midnight: sunnahTimes.middleOfTheNight,
  };
}

export function getCurrentPrayer(times: PrayerTimesResult): PrayerName | null {
  const now = new Date();
  
  if (now >= times.isha) return "isha";
  if (now >= times.maghrib) return "maghrib";
  if (now >= times.asr) return "asr";
  if (now >= times.dhuhr) return "dhuhr";
  if (now >= times.sunrise) return null; // Between sunrise and dhuhr
  if (now >= times.fajr) return "fajr";
  
  return null;
}

export function getNextPrayer(times: PrayerTimesResult): { name: PrayerName; time: Date } | null {
  const now = new Date();
  const prayers: { name: PrayerName; time: Date }[] = [
    { name: "fajr", time: times.fajr },
    { name: "dhuhr", time: times.dhuhr },
    { name: "asr", time: times.asr },
    { name: "maghrib", time: times.maghrib },
    { name: "isha", time: times.isha },
  ];

  for (const prayer of prayers) {
    if (now < prayer.time) {
      return prayer;
    }
  }

  return null;
}

export function getSunPosition(times: PrayerTimesResult): number {
  const now = new Date();
  const sunrise = times.sunrise.getTime();
  const sunset = times.maghrib.getTime();
  const total = sunset - sunrise;
  const elapsed = now.getTime() - sunrise;
  
  if (elapsed < 0) return 0;
  if (elapsed > total) return 1;
  
  return elapsed / total;
}

export function getPrayerDisplayName(name: PrayerName): string {
  const names: Record<PrayerName, string> = {
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  };
  return names[name];
}

export function formatPrayerTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Default coordinates (London) as fallback
export const DEFAULT_COORDINATES = {
  latitude: 51.5074,
  longitude: -0.1278,
  city: "London",
  country: "UK",
};

export function getQiblaDirection(latitude: number, longitude: number): number {
  const coords = new Coordinates(latitude, longitude);
  const qibla = (Qibla as unknown as (c: Coordinates) => { direction: number })(coords);
  return qibla.direction;
}
