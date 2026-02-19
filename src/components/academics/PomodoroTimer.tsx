"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, X, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

interface PomodoroTimerProps {
  onClose?: () => void;
  floating?: boolean;
}

type TimerMode = "work" | "short-break" | "long-break";

const TIMER_DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  "short-break": 5 * 60,
  "long-break": 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  work: "Focus",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

export function PomodoroTimer({ onClose }: PomodoroTimerProps) {
  const { addStudySession } = useAppStore();
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS["work"]);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [subject, setSubject] = useState("General Study");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const modeRef = useRef<TimerMode>("work");
  const pomodoroCountRef = useRef(0);
  const subjectRef = useRef("General Study");

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { pomodoroCountRef.current = pomodoroCount; }, [pomodoroCount]);
  useEffect(() => { subjectRef.current = subject; }, [subject]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_DURATIONS[newMode]);
    setIsRunning(false);
  }, []);

  const handleTimerComplete = useCallback(() => {
    const currentMode = modeRef.current;
    if (currentMode === "work") {
      const newCount = pomodoroCountRef.current + 1;
      setPomodoroCount(newCount);
      addStudySession({
        id: Date.now().toString(),
        subject: subjectRef.current,
        durationMinutes: 25,
        timestamp: new Date().toISOString(),
        pomodoroCount: 1,
      });
      if (newCount % 4 === 0) {
        switchMode("long-break");
      } else {
        switchMode("short-break");
      }
    } else {
      switchMode("work");
    }
  }, [addStudySession, switchMode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Use setTimeout to avoid setState in render
            setTimeout(handleTimerComplete, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleTimerComplete]);

  const handleModeChange = (newMode: TimerMode) => {
    switchMode(newMode);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((TIMER_DURATIONS[mode] - timeLeft) / TIMER_DURATIONS[mode]) * 100;

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  return (
    <div className="w-full">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Mode selector */}
      <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
        {(["work", "short-break", "long-break"] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === m ? "bg-background shadow text-foreground" : "text-muted-foreground"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Subject input */}
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject..."
        className="w-full text-xs px-2 py-1.5 rounded-lg border border-input bg-transparent mb-4 focus:outline-none focus:ring-1 focus:ring-ring"
      />

      {/* Timer circle */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="64" cy="64" r="56"
              fill="none"
              stroke={mode === "work" ? "hsl(var(--primary))" : mode === "short-break" ? "#10b981" : "#f59e0b"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * 352} 352`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground">{MODE_LABELS[mode]}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRunning(!isRunning)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
              mode === "work"
                ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/30"
                : mode === "short-break"
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
                : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30"
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </motion.button>
          <div className="flex items-center gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < (pomodoroCount % 4) ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          <Coffee className="w-3 h-3 inline mr-1" />
          {pomodoroCount} pomodoros completed
        </p>
      </div>
    </div>
  );
}
