"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/components/AuthProvider";
import { Sidebar, BottomNav } from "./Sidebar";
import { Loader2 } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isOnboarded, isLoading } = useAppStore();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for both auth and data to load before making routing decisions
    if (authLoading || isLoading) return;

    // If not authenticated, go to login
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // If not onboarded, go to onboarding
    if (!isOnboarded && pathname !== "/onboarding") {
      router.push("/onboarding");
      return;
    }
  }, [isOnboarded, pathname, router, authLoading, isLoading, user]);

  // Show loading while waiting for auth or data to load
  if (authLoading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user exists but not onboarded, show children (onboarding page)
  if (!isOnboarded) {
    return <>{children}</>;
  }

  // User is authenticated and onboarded
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
