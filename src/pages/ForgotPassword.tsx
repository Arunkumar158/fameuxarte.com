import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/layouts/MainLayout";

const SUCCESS_MESSAGE =
  "If an account exists, a password reset link has been sent.";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (resetError) {
        // Never reveal if email exists; show generic message for auth errors
        console.error("[ForgotPassword] resetPasswordForEmail error:", resetError);
        setError("Something went wrong. Please try again later.");
        return;
      }
      setSuccess(true);
    } catch (err) {
      console.error("[ForgotPassword] unexpected error:", err);
      setError("A network or unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="container max-w-md px-4 pt-24 pb-8 sm:pt-32 sm:pb-12">
          <div className="rounded-lg border bg-card p-4 sm:p-8 text-card-foreground shadow-sm">
            <p className="text-muted-foreground text-center">{SUCCESS_MESSAGE}</p>
            <Button asChild className="mt-6 w-full" variant="outline">
              <Link to="/auth">Back to sign in</Link>
            </Button>
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
            Forgot password
          </h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
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

export default ForgotPassword;
