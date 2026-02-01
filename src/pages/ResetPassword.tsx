import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/layouts/MainLayout";

const MIN_PASSWORD_LENGTH = 8;

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Validate recovery session: Supabase exchanges hash for session on load
  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const resolve = (ready: boolean) => {
      if (mounted) setSessionReady(ready);
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mounted) {
        resolve(true);
        return;
      }
      // Hash may be processed asynchronously; give it a short window
      timeoutId = setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
          resolve(!!s);
        });
      }, 1500);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted && session) {
          resolve(true);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    );
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const isValid =
    password.length >= MIN_PASSWORD_LENGTH && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setError(null);
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        console.error("[ResetPassword] updateUser error:", updateError);
        if (updateError.message.toLowerCase().includes("password")) {
          setError("Password does not meet requirements. Use at least 8 characters.");
        } else {
          setError("Unable to update password. The link may have expired.");
        }
        setLoading(false);
        return;
      }
      // Clear session after update so user must sign in with new password
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
    } catch (err) {
      console.error("[ResetPassword] unexpected error:", err);
      setError("A network or unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Still resolving session (e.g. hash not yet processed)
  if (sessionReady === null) {
    return (
      <MainLayout>
        <div className="container max-w-md px-4 pt-24 pb-8 sm:pt-32 sm:pb-12">
          <div className="rounded-lg border bg-card p-4 sm:p-8 text-card-foreground shadow-sm">
            <p className="text-muted-foreground text-center">
              Verifying reset link…
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Invalid or expired reset link
  if (sessionReady === false) {
    return (
      <MainLayout>
        <div className="container max-w-md px-4 pt-24 pb-8 sm:pt-32 sm:pb-12">
          <div className="rounded-lg border bg-card p-4 sm:p-8 text-card-foreground shadow-sm">
            <h1 className="mb-6 text-xl sm:text-2xl font-semibold">
              Invalid or expired link
            </h1>
            <p className="text-muted-foreground mb-4">
              This password reset link is invalid or has expired. Request a new
              one from the sign-in page.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link to="/forgot-password">Request new link</Link>
            </Button>
            <p className="mt-4 text-center text-sm">
              <Link to="/auth" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-md px-4 pt-24 pb-8 sm:pt-32 sm:pb-12">
        <div className="rounded-lg border bg-card p-4 sm:p-8 text-card-foreground shadow-sm">
          <h1 className="mb-6 text-xl sm:text-2xl font-semibold">
            Set new password
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={MIN_PASSWORD_LENGTH}
                className="w-full"
                disabled={loading}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                At least {MIN_PASSWORD_LENGTH} characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={MIN_PASSWORD_LENGTH}
                className="w-full"
                disabled={loading}
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={!isValid || loading}
            >
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link to="/auth" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPassword;
