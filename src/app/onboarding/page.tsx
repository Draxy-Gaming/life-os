"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Target, Moon, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

const steps = [
  { id: 1, title: "Welcome to LifeOS", subtitle: "Your Personal Operating System" },
  { id: 2, title: "What's your name?", subtitle: "Let's personalize your experience" },
  { id: 3, title: "Where are you located?", subtitle: "For accurate prayer times" },
  { id: 4, title: "What's your main goal?", subtitle: "This semester's north star" },
  { id: 5, title: "Sleep target", subtitle: "How many hours do you aim for?" },
];

// Pre-compute stars outside component to avoid impure render
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  delay: `${(i * 0.17) % 3}s`,
}));

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserSettings, completeOnboarding } = useAppStore();
  const { requestLocation, latitude, longitude, city, loading: geoLoading } = useGeolocation();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [userCity, setUserCity] = useState("London");
  const [userCountry, setUserCountry] = useState("UK");
  const [mainGoal, setMainGoal] = useState("");
  const [sleepTarget, setSleepTarget] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Wait for settings to be saved to database before proceeding
      await setUserSettings({
        name,
        city: userCity,
        country: userCountry,
        latitude,
        longitude,
        mainGoal,
        sleepTarget,
      });
      completeOnboarding();
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save your settings. Please try again.";
      console.error("Error completing onboarding:", err);
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleLocationDetect = () => {
    requestLocation();
    if (city !== "Your Location") {
      setUserCity(city);
    }
  };

  const canProceed = () => {
    if (step === 2) return name.trim().length > 0;
    if (step === 3) return userCity.trim().length > 0;
    if (step === 4) return mainGoal.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STARS.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8 justify-center">
          {steps.map((s) => (
            <motion.div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s.id <= step ? "bg-violet-400" : "bg-white/20"
              }`}
              style={{ width: s.id === step ? "32px" : "12px" }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-100 text-sm"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl"
          >
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/30"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome to LifeOS</h1>
                  <p className="text-white/60">Your complete personal operating system for students and achievers</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  {[
                    { icon: "🕌", label: "Prayer Tracker" },
                    { icon: "📚", label: "Academics" },
                    { icon: "💪", label: "Exercise" },
                    { icon: "✅", label: "Habits" },
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                      <span className="text-xl">{feature.icon}</span>
                      <span className="text-white/80 text-sm font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Name */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">What is your name?</h2>
                  <p className="text-white/60 mt-1">We will use this to personalize your experience</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Your Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-violet-400"
                    onKeyDown={(e) => e.key === "Enter" && canProceed() && handleNext()}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Where are you?</h2>
                  <p className="text-white/60 mt-1">For accurate prayer times calculation</p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={handleLocationDetect}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    disabled={geoLoading}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {geoLoading ? "Detecting..." : "Auto-detect Location"}
                  </Button>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-white/80 text-xs">City</Label>
                      <Input
                        value={userCity}
                        onChange={(e) => setUserCity(e.target.value)}
                        placeholder="City"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-white/80 text-xs">Country</Label>
                      <Input
                        value={userCountry}
                        onChange={(e) => setUserCountry(e.target.value)}
                        placeholder="Country"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Goal */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Your Main Goal</h2>
                  <p className="text-white/60 mt-1">What do you want to achieve this semester?</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Semester Goal</Label>
                  <textarea
                    value={mainGoal}
                    onChange={(e) => setMainGoal(e.target.value)}
                    placeholder="e.g., Pass SSC with A+ and maintain 5 daily prayers..."
                    className="w-full h-24 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none text-sm"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 5: Sleep */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
                    <Moon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Sleep Target</h2>
                  <p className="text-white/60 mt-1">How many hours of sleep do you aim for?</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => setSleepTarget(Math.max(4, sleepTarget - 0.5))}
                      className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white text-xl hover:bg-white/20 transition-colors"
                    >
                      −
                    </button>
                    <div className="text-center">
                      <span className="text-5xl font-bold text-white">{sleepTarget}</span>
                      <p className="text-white/60 text-sm mt-1">hours</p>
                    </div>
                    <button
                      onClick={() => setSleepTarget(Math.min(12, sleepTarget + 0.5))}
                      className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white text-xl hover:bg-white/20 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[6, 7, 8, 9].map((h) => (
                      <button
                        key={h}
                        onClick={() => setSleepTarget(h)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          sleepTarget === h
                            ? "bg-violet-500 text-white"
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 disabled:opacity-50"
              >
                {step === steps.length ? (
                  <>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Get Started
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-white/30 text-xs mt-6">
          Step {step} of {steps.length}
        </p>
      </div>
    </div>
  );
}
