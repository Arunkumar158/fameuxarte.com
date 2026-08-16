import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Only check if authentication has finished loading
      if (isLoading) return;

      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Check user metadata first as a fast path if we sync it there
      if (user.user_metadata?.role === 'admin') {
         setIsAdmin(true);
         return;
      }

      // Otherwise fetch from profiles table
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, isLoading]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAdmin === false && !user) {
      navigate("/auth", { state: { from: location.pathname }, replace: true });
    }
  }, [isLoading, isAdmin, user, navigate, location.pathname]);

  if (isAdmin === null || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    if (!user) {
      // Return null while the useEffect handles the redirect
      return null;
    }

    // Show explicit error if logged in but not an admin
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-2 text-slate-900">Access Denied</h1>
        <p className="text-gray-600 mb-4">You do not have the required "admin" role to access the Founder Dashboard.</p>
        <p className="text-sm text-gray-500 max-w-md">
          Current User ID: {user?.id}
          <br/>
          (Check your public.profiles table in Supabase to ensure this ID has role='admin')
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
