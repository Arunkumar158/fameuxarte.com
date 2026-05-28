import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/auth/AuthLayout";
import FormInput from "@/components/auth/FormInput";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else {
        await signUp(email, password, fullName);
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <AuthLayout
      title={isLogin ? "Welcome back" : "Create your account"}
      subtitle={isLogin ? "Sign in to continue collecting original art" : "Start building your art collection today"}
    >
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <FormInput
            label="Full name"
            type="text"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required={!isLogin}
            autoComplete="name"
          />
        )}

        <FormInput
          label="Email address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <FormInput
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isLogin ? "Enter your password" : "Create a strong password"}
          required
          autoComplete={isLogin ? "current-password" : "new-password"}
        />

        {isLogin ? (
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border-subtle bg-surface-2 text-gold focus:ring-gold/20"
              />
              <span className="text-[13px] text-[#888]">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-[13px] text-gold hover:text-linen transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        ) : (
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-border-subtle bg-surface-2 text-gold focus:ring-gold/20"
              />
              <span className="text-[13px] text-[#888] leading-[1.6]">
                I agree to the{" "}
                <a href="/terms" className="text-gold hover:text-linen">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" className="text-gold hover:text-linen">Privacy Policy</a>
              </span>
            </label>
          </div>
        )}

        <button
          type="submit"
          className="
            w-full py-3 rounded-md
            bg-linen text-obsidian
            text-[14px] font-medium
            hover:bg-gold
            transition-colors
          "
        >
          {isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <SocialAuthButtons onGoogleAuth={() => undefined} />

      <div className="mt-8 pt-6 border-t border-border-faint text-center">
        <p className="text-[13px] text-[#666]">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-gold hover:text-linen font-medium transition-colors"
          >
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[11px] text-[#555]">
          {isLogin
            ? "Secured by ArtGuard - Your data is encrypted"
            : "ArtGuard verified platform - Trusted by 12,000+ collectors"}
        </p>
      </div>
    </AuthLayout>
  );
};

export default Auth;
