import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const ArtistRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<'customer' | 'artist' | 'admin' | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (!error && data) {
            setRole(data.role as 'customer' | 'artist' | 'admin');
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

  useEffect(() => {
    if (!loading && !roleLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [loading, roleLoading, user, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian text-gold">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // if (role !== 'artist' && role !== 'admin') {
  //   return <Navigate to="/for-artists" replace />;
  // }

  return children ? <>{children}</> : <Outlet />;
};
