"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Moon, BookOpen, Dumbbell, CheckSquare,
  Clock, Calendar, TrendingUp, Zap, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { getGreeting, getDaysUntil, getTimeUntil, formatDate } from "@/lib/utils";
import { formatPrayerTime, getPrayerDisplayName } from "@/lib/prayer-times";
import Link from "next/link";

function CountdownTimer({ targetDate, label, urgent }: { targetDate: Date; label: string; urgent?: boolean }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntil(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const days = getDaysUntil(targetDate);

  return (
    <div className={`rounded-xl p-4 border ${urgent ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20" : "border-border bg-muted/30"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {urgent && <AlertTriangle className="w-4 h-4 text-red-500" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${urgent ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
          {days}
        </span>
        <span className="text-sm text-muted-foreground">days</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-2xl font-bold">{value}%</span>
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <Progress value={value} className="mt-2 h-1.5" />
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const { userSettings, exams, getDailyScore, dailyPrayers, habits } = useAppStore();
  const { times, nextPrayer } = usePrayerTimes(userSettings.latitude, userSettings.longitude);
  const [currentTime, setCurrentTime] = useState(() => {
    if (typeof window === "undefined") return new Date("2024-01-01T12:00:00");
    return new Date();
  });
  const [mounted, setMounted] = useState(false);
  const score = getDailyScore();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const sscExam = exams.find((e) => e.id === "ssc-main");
  const otherExams = exams.filter((e) => e.id !== "ssc-main").slice(0, 3);

  const today = new Date().toDateString();
  const todayPrayers = dailyPrayers[today];
  const completedPrayers = todayPrayers
    ? [todayPrayers.fajr, todayPrayers.dhuhr, todayPrayers.asr, todayPrayers.maghrib, todayPrayers.isha].filter(Boolean).length
    : 0;

  const completedHabits = habits.filter((h) => h.completedToday).length;

  // Smart prompts
  const smartPrompts: string[] = [];
  if (sscExam) {
    const daysLeft = getDaysUntil(new Date(sscExam.date));
    if (daysLeft <= 30) {
      smartPrompts.push("📚 Exam is near! Consider praying Duha for success and focus.");
    }
  }
  if (completedPrayers < 3) {
    smartPrompts.push("🕌 You have pending prayers today. Don't miss them!");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <p className="text-sm text-muted-foreground">{formatDate(currentTime)}</p>
        <h1 className="text-2xl font-bold">{getGreeting(userSettings.name || "Friend", currentTime.getHours())}</h1>
        <p className="text-sm text-muted-foreground">
          {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
      </motion.div>

      {/* Daily Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">Daily Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-bold">{score.total}</span>
              <span className="text-white/70">/ 100</span>
            </div>
            <p className="text-white/60 text-xs mt-1">
              {score.total >= 80 ? "🔥 Excellent day!" : score.total >= 60 ? "💪 Good progress!" : score.total >= 40 ? "📈 Keep going!" : "🌱 Just getting started"}
            </p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score.total / 100) * 201} 201`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today&apos;s Progress</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Moon} label="Prayer" value={score.prayer} color="bg-indigo-500" href="/prayer" />
          <StatCard icon={BookOpen} label="Academics" value={score.academics} color="bg-violet-500" href="/academics" />
          <StatCard icon={Dumbbell} label="Exercise" value={score.exercise} color="bg-emerald-500" href="/exercise" />
          <StatCard icon={CheckSquare} label="Habits" value={score.habits} color="bg-amber-500" href="/habits" />
        </div>
      </div>

      {/* Next Event & Prayer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Prayer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Next Prayer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextPrayer && times ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{getPrayerDisplayName(nextPrayer.name)}</p>
                    <p className="text-muted-foreground text-sm">{formatPrayerTime(nextPrayer.time)}</p>
                  </div>
                  <div className="text-right">
                    <NextPrayerCountdown targetTime={nextPrayer.time} />
                  </div>
                </div>
                <div className="flex gap-1">
                  {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((p, i) => {
                    const keys = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
                    const completed = todayPrayers?.[keys[i]] ?? false;
                    return (
                      <div
                        key={p}
                        className={`flex-1 h-1.5 rounded-full ${completed ? "bg-indigo-500" : "bg-muted"}`}
                        title={p}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{completedPrayers}/5 prayers completed today</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">All prayers completed for today! 🎉</p>
            )}
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Today&apos;s Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Prayers</span>
              <span className="font-medium">{completedPrayers}/5</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Habits</span>
              <span className="font-medium">{completedHabits}/{habits.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">{userSettings.city}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam Countdowns */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Exam Countdowns
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sscExam && (
            <CountdownTimer
              targetDate={new Date(sscExam.date)}
              label="🎯 SSC Exam D-Day"
              urgent
            />
          )}
          {otherExams.map((exam) => (
            <CountdownTimer
              key={exam.id}
              targetDate={new Date(exam.date)}
              label={exam.subject}
            />
          ))}
          {exams.length <= 1 && (
            <Link href="/academics">
              <div className="rounded-xl p-4 border border-dashed border-border bg-muted/20 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer h-full min-h-[80px]">
                <span className="text-sm">+ Add Exam</span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Smart Prompts */}
      {smartPrompts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Smart Suggestions</h2>
          {smartPrompts.map((prompt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3 text-sm text-amber-800 dark:text-amber-300"
            >
              {prompt}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function NextPrayerCountdown({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(targetTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntil(targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="text-right">
      <p className="text-lg font-bold text-primary">
        {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ""}{timeLeft.minutes}m
      </p>
      <p className="text-xs text-muted-foreground">remaining</p>
    </div>
  );
}
