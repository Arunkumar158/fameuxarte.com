"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { identifyUser, resetAnalytics, trackUserSignedUp } from "@/lib/analytics";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Track the previous session so we can distinguish a genuine new sign-in
  // from a silent token refresh. Supabase fires SIGNED_IN for both cases,
  // which caused an unwanted redirect to /collector on tab focus.
  const prevSessionRef = useRef<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === "SIGNED_IN") {
          const isGenuineSignIn = prevSessionRef.current === null;
          prevSessionRef.current = session;

          if (isGenuineSignIn) {
            // Only redirect when the user was actually signed out before —
            // i.e., this is a real login, not a silent token refresh triggered
            // by the tab regaining focus.
            const redirectPath = localStorage.getItem("authRedirect");
            if (redirectPath) {
              localStorage.removeItem("authRedirect");
              navigate(redirectPath);
            } else {
              // Default redirect after sign-in (covers Google OAuth callback)
              navigate("/collector");
            }
          }
        } else {
          prevSessionRef.current = session;
        }

        // PostHog: identify user when a session is established
        if (session?.user) {
          identifyUser(session.user.id, {
            email: session.user.email,
            name:  session.user.user_metadata?.full_name,
            role:  session.user.user_metadata?.role ?? 'buyer',
          });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      // Seed the ref with the current session so the onAuthStateChange listener
      // knows the user was already signed in on page load. Without this,
      // a SIGNED_IN event fired shortly after would incorrectly look like a
      // fresh login (prevSessionRef.current === null) and trigger a redirect.
      prevSessionRef.current = session;

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // PostHog: identify on initial page load if already logged in
      if (session?.user) {
        identifyUser(session.user.id, {
          email: session.user.email,
          name:  session.user.user_metadata?.full_name,
          role:  session.user.user_metadata?.role ?? 'buyer',
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    // PostHog: fire sign-up event
    trackUserSignedUp({ method: 'email' });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // PostHog: reset identity so next session is anonymous
    resetAnalytics();
    navigate("/auth");
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, loading: isLoading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};




