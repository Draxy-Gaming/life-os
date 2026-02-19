import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getDaysUntil(targetDate: Date): number {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getTimeUntil(targetDate: Date): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const diff = Math.max(0, targetDate.getTime() - now.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

export function getGreeting(name: string, hour?: number): string {
  const currentHour = hour ?? new Date().getHours();
  if (currentHour < 5) return `Assalamu Alaikum, ${name}. Time for Tahajjud.`;
  if (currentHour < 7) return `Good Morning, ${name}. Time for Fajr.`;
  if (currentHour < 12) return `Good Morning, ${name}. Have a productive day!`;
  if (currentHour < 17) return `Good Afternoon, ${name}. Keep pushing!`;
  if (currentHour < 20) return `Good Evening, ${name}. Time to wind down.`;
  return `Good Night, ${name}. Rest well.`;
}

export function getTimeOfDay(): "dawn" | "morning" | "noon" | "afternoon" | "sunset" | "twilight" | "night" {
  const hour = new Date().getHours();
  if (hour < 5) return "night";
  if (hour < 7) return "dawn";
  if (hour < 10) return "morning";
  if (hour < 13) return "noon";
  if (hour < 16) return "afternoon";
  if (hour < 19) return "sunset";
  if (hour < 21) return "twilight";
  return "night";
}
