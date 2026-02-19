"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, MapPin, Moon, Sun, Monitor, User, Target, Bell, Trash2, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { userSettings, setUserSettings } = useAppStore();
  const { requestLocation, latitude, longitude, loading: geoLoading } = useGeolocation();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(userSettings.name);
  const [city, setCity] = useState(userSettings.city);
  const [country, setCountry] = useState(userSettings.country);
  const [mainGoal, setMainGoal] = useState(userSettings.mainGoal);
  const [sleepTarget, setSleepTarget] = useState(userSettings.sleepTarget);
  const [theme, setTheme] = useState(userSettings.theme);
  const [saved, setSaved] = useState(false);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [theme]);

  const handleSave = () => {
    setUserSettings({ name, city, country, mainGoal, sleepTarget, theme });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDetectLocation = () => {
    requestLocation();
    setTimeout(() => {
      if (latitude && longitude) {
        setUserSettings({ latitude, longitude });
      }
    }, 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Customize your LifeOS experience</p>
      </motion.div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Your Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Semester Goal</Label>
            <textarea
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              placeholder="What do you want to achieve this semester?"
              className="w-full h-20 mt-1 px-3 py-2 rounded-lg border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location (Prayer Times)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={handleDetectLocation}
            disabled={geoLoading}
            className="w-full"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {geoLoading ? "Detecting..." : "Auto-detect Location"}
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Coordinates: {userSettings.latitude.toFixed(4)}, {userSettings.longitude.toFixed(4)}
          </p>
        </CardContent>
      </Card>

      {/* Sleep */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Sleep Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSleepTarget(Math.max(4, sleepTarget - 0.5))}
              className="w-10 h-10 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold">{sleepTarget}</span>
              <span className="text-muted-foreground ml-1">hours</span>
            </div>
            <button
              onClick={() => setSleepTarget(Math.min(12, sleepTarget + 0.5))}
              className="w-10 h-10 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
            >
              +
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value as "light" | "dark" | "system")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        onClick={handleSave}
        className="w-full"
        variant={saved ? "outline" : "default"}
      >
        {saved ? "✓ Saved!" : "Save Settings"}
      </Button>

      {/* Sign Out */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.email && (
            <p className="text-sm text-muted-foreground">
              Signed in as: <span className="font-medium text-foreground">{user.email}</span>
            </p>
          )}
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto">
              <span className="text-white text-xl">⚡</span>
            </div>
            <h3 className="font-bold">LifeOS</h3>
            <p className="text-sm text-muted-foreground">Personal Operating System v1.0</p>
            <p className="text-xs text-muted-foreground">Built for students & productivity enthusiasts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
