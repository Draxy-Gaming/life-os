"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { loadData, setUserId } = useAppStore();

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthProvider: getSession result", session ? "session found" : "no session", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Load user data if signed in
      if (session?.user) {
        console.log("AuthProvider: Loading data for user", session.user.id);
        setUserId(session.user.id);
        loadData(session.user.id);
      } else {
        console.log("AuthProvider: No session found, user not logged in");
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AuthProvider: onAuthStateChange event", _event, session ? "session found" : "no session");
      setSession(session);
      setUser(session?.user ?? null);
      
      // Load or clear user data based on auth state
      if (session?.user) {
        console.log("AuthProvider: Loading data for user after state change", session.user.id);
        setUserId(session.user.id);
        loadData(session.user.id);
      } else {
        setUserId(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadData, setUserId]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { error };
    }

    // If email confirmation is required, user will be null until confirmed
    if (data.user) {
      setUser(data.user);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      setUserId(data.user.id);
      // Load user data after sign in
      loadData(data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    // Clear localStorage cache before sign out
    const currentUser = user;
    if (currentUser?.id && typeof window !== 'undefined') {
      localStorage.removeItem(`lifeos_onboarded_${currentUser.id}`);
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
