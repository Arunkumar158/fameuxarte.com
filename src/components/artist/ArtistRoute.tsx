import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const ArtistRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<'customer' | 'artist' | 'admin' | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          console.log("DEBUG: ArtistRoute fetched profile", { userId: user.id, data, error });

          if (!error && data) {
            setRole(data.role as 'customer' | 'artist' | 'admin');
          } else {
            console.error("DEBUG: ArtistRoute fetch error or empty data");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      }
      setRoleLoading(false);
    };

    if (!loading) {
      if (user) {
        fetchRole();
      } else {
        setRoleLoading(false);
      }
    }
  }, [user, loading]);

  if (loading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian text-gold">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // if (role !== 'artist' && role !== 'admin') {
  //   return <Navigate to="/for-artists" replace />;
  // }

  return children ? <>{children}</> : <Outlet />;
};
