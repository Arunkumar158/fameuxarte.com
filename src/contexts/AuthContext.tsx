
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { identifyUser, resetAnalytics, trackUserSignedUp } from "@/lib/analytics";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

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
      setSession(session);
      setUser(session?.user ?? null);

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
    navigate("/");
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

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut }}>
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
