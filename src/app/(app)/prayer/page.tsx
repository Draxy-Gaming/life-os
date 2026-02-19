"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Minus, RotateCcw, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SunTracker } from "@/components/prayer/SunTracker";
import { useAppStore } from "@/lib/store";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { getTimeOfDay } from "@/lib/utils";
import { formatPrayerTime } from "@/lib/prayer-times";

const PRAYER_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
type PrayerKey = typeof PRAYER_NAMES[number];

const PRAYER_DISPLAY = {
  fajr: { name: "Fajr", emoji: "🌙", arabic: "الفجر" },
  dhuhr: { name: "Dhuhr", emoji: "☀️", arabic: "الظهر" },
  asr: { name: "Asr", emoji: "🌤️", arabic: "العصر" },
  maghrib: { name: "Maghrib", emoji: "🌅", arabic: "المغرب" },
  isha: { name: "Isha", emoji: "🌃", arabic: "العشاء" },
};

const HEADER_GRADIENTS = {
  dawn: "from-indigo-950 via-violet-900 to-purple-800",
  morning: "from-orange-400 via-pink-400 to-rose-500",
  noon: "from-sky-400 via-blue-500 to-indigo-600",
  afternoon: "from-amber-400 via-orange-400 to-yellow-500",
  sunset: "from-orange-500 via-red-500 to-pink-600",
  twilight: "from-purple-600 via-indigo-700 to-blue-900",
  night: "from-slate-900 via-indigo-950 to-slate-950",
};

export default function PrayerPage() {
  const { userSettings, dailyPrayers, updatePrayer, tasbihEntries, incrementTasbih, resetTasbih, quranLogs, addQuranLog, ensureTodayPrayers } = useAppStore();
  const { times, currentPrayer, nextPrayer, loading } = usePrayerTimes(userSettings.latitude, userSettings.longitude);
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [quranPages, setQuranPages] = useState("");
  const [quranSurah, setQuranSurah] = useState("");
  const [activeTasbih, setActiveTasbih] = useState(0);

  const today = new Date().toDateString();
  const todayPrayers = dailyPrayers[today] || {};

  useEffect(() => {
    // Ensure today's prayers exist in the store
    ensureTodayPrayers();
  }, [ensureTodayPrayers]);

  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60000);
    return () => clearInterval(interval);
  }, []);

  const togglePrayer = (prayer: PrayerKey) => {
    const isCurrentlyComplete = !!todayPrayers[prayer];
    const now = new Date().toISOString();
    const completedAtKey = `${prayer}CompletedAt` as keyof typeof todayPrayers;
    
    updatePrayer(today, {
      [prayer]: !isCurrentlyComplete,
      [completedAtKey]: isCurrentlyComplete ? undefined : now,
    });
  };

  const toggleMasjid = (prayer: PrayerKey) => {
    const key = `${prayer}Masjid` as keyof typeof todayPrayers;
    updatePrayer(today, { [key]: !todayPrayers[key] });
  };

  const handleAddQuranLog = () => {
    if (!quranPages) return;
    addQuranLog({
      date: new Date().toISOString().split("T")[0],
      pagesRead: parseInt(quranPages),
      surah: quranSurah,
    });
    setQuranPages("");
    setQuranSurah("");
  };

  const totalPagesThisWeek = quranLogs
    .filter((l) => {
      const logDate = new Date(l.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    })
    .reduce((acc, l) => acc + l.pagesRead, 0);

  const gradientClass = HEADER_GRADIENTS[timeOfDay];

  return (
    <div className="min-h-screen">
      {/* Dynamic Header */}
      <div className={`bg-gradient-to-br ${gradientClass} p-6 pb-8`}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-white/80" />
            <p className="text-white/60 text-sm uppercase tracking-wider">Prayer Module</p>
          </div>
          <h1 className="text-3xl font-bold text-white">Daily Prayers</h1>
          <p className="text-white/60 text-sm mt-1">{userSettings.city}, {userSettings.country}</p>
        </motion.div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6 -mt-4">
        {/* Sun Tracker */}
        {times && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SunTracker times={times} currentPrayer={currentPrayer} nextPrayer={nextPrayer} />
          </motion.div>
        )}

        {/* Prayer Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🕌</span> Prayer Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PRAYER_NAMES.map((prayer, index) => {
              const display = PRAYER_DISPLAY[prayer];
              const isCompleted = !!todayPrayers[prayer];
              const isMasjid = !!todayPrayers[`${prayer}Masjid` as keyof typeof todayPrayers];
              const prayerTime = times?.[prayer];
              const isCurrent = currentPrayer === prayer;

              return (
                <motion.div
                  key={prayer}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "border-primary/50 bg-primary/5"
                      : isCompleted
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                      : "border-border bg-muted/20"
                  }`}
                >
                  {/* Prayer icon & name */}
                  <button
                    onClick={() => togglePrayer(prayer)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                      isCompleted
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {isCompleted ? "✓" : display.emoji}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{display.name}</span>
                      <span className="text-muted-foreground text-xs">{display.arabic}</span>
                      {isCurrent && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Now</span>
                      )}
                    </div>
                    {prayerTime && (
                      <p className="text-xs text-muted-foreground">{formatPrayerTime(prayerTime)}</p>
                    )}
                  </div>

                  {/* Masjid toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:block">Masjid</span>
                    <Switch
                      checked={isMasjid}
                      onCheckedChange={() => toggleMasjid(prayer)}
                      disabled={!isCompleted}
                    />
                  </div>
                </motion.div>
              );
            })}

            {/* Qada Counter */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div>
                <p className="text-sm font-medium">Qada (Missed Prayers)</p>
                <p className="text-xs text-muted-foreground">Prayers to make up</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updatePrayer(today, { qadaCount: Math.max(0, (todayPrayers.qadaCount || 0) - 1) })}
                  className="w-7 h-7 rounded-full bg-amber-200 dark:bg-amber-900/50 flex items-center justify-center text-amber-800 dark:text-amber-300 hover:bg-amber-300 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-lg font-bold w-6 text-center">{todayPrayers.qadaCount || 0}</span>
                <button
                  onClick={() => updatePrayer(today, { qadaCount: (todayPrayers.qadaCount || 0) + 1 })}
                  className="w-7 h-7 rounded-full bg-amber-200 dark:bg-amber-900/50 flex items-center justify-center text-amber-800 dark:text-amber-300 hover:bg-amber-300 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital Tasbih */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📿</span> Digital Tasbih
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Dhikr selector */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {tasbihEntries.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTasbih(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTasbih === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {entry.dhikr}
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(tasbihEntries[activeTasbih]?.count / tasbihEntries[activeTasbih]?.target) * 314} 314`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{tasbihEntries[activeTasbih]?.count}</span>
                  <span className="text-xs text-muted-foreground">/{tasbihEntries[activeTasbih]?.target}</span>
                </div>
              </div>

              <p className="text-lg font-semibold text-center">{tasbihEntries[activeTasbih]?.dhikr}</p>

              <div className="flex gap-3">
                <Button
                  onClick={() => resetTasbih(activeTasbih)}
                  variant="outline"
                  size="icon"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => incrementTasbih(activeTasbih)}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-2xl shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity pulse-glow"
                >
                  +
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quran Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Quran Reading Log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">This Week</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{totalPagesThisWeek} pages</p>
              </div>
              <span className="text-4xl">📖</span>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Pages Read</Label>
                <Input
                  type="number"
                  value={quranPages}
                  onChange={(e) => setQuranPages(e.target.value)}
                  placeholder="e.g., 5"
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Surah (optional)</Label>
                <Input
                  value={quranSurah}
                  onChange={(e) => setQuranSurah(e.target.value)}
                  placeholder="e.g., Al-Baqarah"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleAddQuranLog} className="w-full" disabled={!quranPages}>
              Log Reading Session
            </Button>

            {/* Recent logs */}
            {quranLogs.slice(-3).reverse().map((log, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div>
                  <span className="font-medium">{log.pagesRead} pages</span>
                  {log.surah && <span className="text-muted-foreground ml-2">• {log.surah}</span>}
                </div>
                <span className="text-muted-foreground text-xs">{log.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
