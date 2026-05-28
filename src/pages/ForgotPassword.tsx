import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import FormInput from "@/components/auth/FormInput";

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
      <AuthLayout
        title="Check your inbox"
        subtitle="If an account exists for that email, your reset link is on the way."
      >
        <div className="mb-4 p-3 rounded-md bg-verified/10 border border-verified/20">
          <p className="text-[13px] text-verified">{SUCCESS_MESSAGE}</p>
        </div>
        <Link
          to="/auth"
          className="
            block w-full py-3 rounded-md
            bg-linen text-obsidian
            text-[14px] font-medium text-center
            hover:bg-gold
            transition-colors
          "
        >
          Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Email address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error || undefined}
          placeholder="you@example.com"
          required
          autoComplete="email"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-md
            bg-linen text-obsidian
            text-[14px] font-medium
            hover:bg-gold
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "Sending reset link..." : "Send reset link"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-border-faint text-center">
        <Link to="/auth" className="text-[13px] text-gold hover:text-linen transition-colors">
          Back to sign in
        </Link>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[11px] text-[#555]">
          Secured by ArtGuard - Your data is encrypted
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
