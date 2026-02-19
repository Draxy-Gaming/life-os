"use client";

import { useSyncExternalStore, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

// Safe way to check hydration without useEffect
const emptySubscribe = () => () => {};

const useHydrated = () => {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
};

export default function RootPage() {
  const router = useRouter();
  const { isOnboarded } = useAppStore();
  const { user, loading } = useAuth();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated || loading) return;
    
    if (user) {
      if (isOnboarded) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    } else {
      router.replace("/auth/login");
    }
  }, [hydrated, loading, user, isOnboarded, router]);

  if (!hydrated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse">
            <span className="text-white text-3xl">⚡</span>
          </div>
          <p className="text-white/60 text-sm">Loading LifeOS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
    </div>
  );
}
