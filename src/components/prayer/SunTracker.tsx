"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSunPosition, formatPrayerTime, getPrayerDisplayName } from "@/lib/prayer-times";
import type { PrayerTimesResult } from "@/lib/prayer-times";
import type { PrayerName } from "@/lib/types";
import { getTimeOfDay } from "@/lib/utils";

interface SunTrackerProps {
  times: PrayerTimesResult;
  currentPrayer: PrayerName | null;
  nextPrayer: { name: PrayerName; time: Date } | null;
}

// Pre-computed star positions to avoid Math.random() in render
const STARS = Array.from({ length: 30 }, (_, i) => ({
  left: ((i * 37 + 13) % 100),
  top: ((i * 53 + 7) % 60),
  opacity: ((i * 17 + 3) % 8) / 10 + 0.2,
}));

const SKY_GRADIENTS = {
  dawn: ["#1a1a2e", "#16213e", "#0f3460", "#533483"],
  morning: ["#ff9a9e", "#fecfef", "#ffecd2", "#fcb69f"],
  noon: ["#a1c4fd", "#c2e9fb", "#74b9ff", "#0984e3"],
  afternoon: ["#667eea", "#764ba2", "#f093fb", "#f5576c"],
  sunset: ["#f7971e", "#ffd200", "#f093fb", "#f5576c"],
  twilight: ["#4776e6", "#8e54e9", "#2c3e50", "#3498db"],
  night: ["#0c0c1d", "#111132", "#1a1a3e", "#0d0d2b"],
};

const PRAYER_POSITIONS = {
  fajr: 0.05,
  sunrise: 0.1,
  dhuhr: 0.5,
  asr: 0.7,
  maghrib: 0.92,
  isha: 0.98,
};

export function SunTracker({ times, currentPrayer, nextPrayer }: SunTrackerProps) {
  const [sunPos, setSunPos] = useState(getSunPosition(times));
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());

  useEffect(() => {
    const interval = setInterval(() => {
      setSunPos(getSunPosition(times));
      setTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, [times]);

  const gradients = SKY_GRADIENTS[timeOfDay];
  const isNight = timeOfDay === "night" || timeOfDay === "dawn" || timeOfDay === "twilight";

  // SVG arc path
  const width = 400;
  const height = 160;
  const cx = width / 2;
  const cy = height + 20;
  const rx = width / 2 - 20;
  const ry = height - 10;

  // Sun position on arc
  const angle = Math.PI - sunPos * Math.PI;
  const sunX = cx + rx * Math.cos(angle);
  const sunY = cy - ry * Math.sin(angle);

  const arcPath = `M 20 ${height} A ${rx} ${ry} 0 0 1 ${width - 20} ${height}`;

  const prayerMarkers = [
    { name: "fajr" as PrayerName, time: times.fajr },
    { name: "dhuhr" as PrayerName, time: times.dhuhr },
    { name: "asr" as PrayerName, time: times.asr },
    { name: "maghrib" as PrayerName, time: times.maghrib },
    { name: "isha" as PrayerName, time: times.isha },
  ];

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-6"
      style={{
        background: `linear-gradient(160deg, ${gradients[0]} 0%, ${gradients[1]} 40%, ${gradients[2]} 70%, ${gradients[3]} 100%)`,
      }}
    >
      {/* Stars (night only) */}
      {isNight && (
        <div className="absolute inset-0 pointer-events-none">
          {STARS.map((star, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider">Celestial Tracker</p>
            <p className="text-white font-semibold text-lg">
              {currentPrayer ? `${getPrayerDisplayName(currentPrayer)} Time` : "Between Prayers"}
            </p>
          </div>
          {nextPrayer && (
            <div className="text-right">
              <p className="text-white/60 text-xs">Next: {getPrayerDisplayName(nextPrayer.name)}</p>
              <p className="text-white font-medium text-sm">{formatPrayerTime(nextPrayer.time)}</p>
            </div>
          )}
        </div>
      </div>

      {/* SVG Sun Arc */}
      <div className="relative z-10">
        <svg
          viewBox={`0 0 ${width} ${height + 10}`}
          className="w-full"
          style={{ maxHeight: "180px" }}
        >
          {/* Gradient defs */}
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isNight ? "#c0c0ff" : "#fff7aa"} stopOpacity="1" />
              <stop offset="100%" stopColor={isNight ? "#8080ff" : "#ffd700"} stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Horizon line */}
          <line x1="10" y1={height} x2={width - 10} y2={height} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

          {/* Arc path */}
          <path
            d={arcPath}
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Completed arc - only draw when sun is actually moving */}
          {sunPos > 0.01 && sunPos < 0.99 && (
            <path
              d={`M 20 ${height} A ${rx} ${ry} 0 0 1 ${sunX} ${sunY}`}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
          )}

          {/* Prayer markers */}
          {prayerMarkers.map((prayer) => {
            const pos = PRAYER_POSITIONS[prayer.name];
            const markerAngle = Math.PI - pos * Math.PI;
            const mx = cx + rx * Math.cos(markerAngle);
            const my = cy - ry * Math.sin(markerAngle);
            const isActive = currentPrayer === prayer.name;

            return (
              <g key={prayer.name}>
                <circle
                  cx={mx}
                  cy={my}
                  r={isActive ? 5 : 3}
                  fill={isActive ? "#fff" : "rgba(255,255,255,0.5)"}
                  filter={isActive ? "url(#glow)" : undefined}
                />
                <text
                  x={mx}
                  y={my - 10}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="8"
                  fontWeight={isActive ? "bold" : "normal"}
                >
                  {getPrayerDisplayName(prayer.name)}
                </text>
              </g>
            );
          })}

          {/* Sun - hide at exact boundaries to prevent visual glitches */}
          {sunPos > 0.01 && sunPos < 0.99 && (
            <>
              {/* Glow */}
              <motion.circle
                animate={{ cx: sunX, cy: sunY }}
                r={isNight ? 12 : 18}
                fill="url(#sunGlow)"
                opacity="0.6"
                transition={{ duration: 1, ease: "linear" }}
              />
              {/* Sun body */}
              <motion.circle
                animate={{ cx: sunX, cy: sunY }}
                r={isNight ? 6 : 10}
                fill={isNight ? "#e8e8ff" : "#FFD700"}
                filter="url(#glow)"
                transition={{ duration: 1, ease: "linear" }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Prayer Times Row */}
      <div className="relative z-10 grid grid-cols-5 gap-1 mt-2">
        {prayerMarkers.map((prayer) => {
          const isActive = currentPrayer === prayer.name;
          const isPast = times[prayer.name] < new Date();
          return (
            <div
              key={prayer.name}
              className={`text-center p-2 rounded-lg transition-all ${
                isActive
                  ? "bg-white/20 backdrop-blur-sm"
                  : isPast
                  ? "opacity-50"
                  : "opacity-80"
              }`}
            >
              <p className="text-white/70 text-[10px] uppercase">{getPrayerDisplayName(prayer.name)}</p>
              <p className="text-white text-xs font-semibold mt-0.5">{formatPrayerTime(prayer.time)}</p>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-white mx-auto mt-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
