"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allRulesMet = PASSWORD_RULES.every((r) => r.test(password));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allRulesMet) return;
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-[380px]">
        {/* Logo + heading */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-foreground shadow-sm">
            <PenLine className="size-5 text-background" strokeWidth={2} />
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">
              Create your account
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Free forever. No credit card required.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card px-8 py-7 shadow-sm">
          {/* Google (UI only) */}
          <Button
            variant="outline"
            className="w-full h-9 gap-2.5 text-[14px] font-medium"
            type="button"
            disabled
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[12px] text-muted-foreground select-none">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-foreground/80">
                Full name
              </label>
              <Input
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-foreground/80">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-foreground/80">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowRules(true)}
                  autoComplete="new-password"
                  required
                  className="h-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-3.5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="size-3.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>

              {/* Password strength checklist */}
              {showRules && password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.test(password);
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-[12px] transition-colors ${
                          met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                        }`}
                      >
                        <Check
                          className={`size-3 shrink-0 transition-opacity ${met ? "opacity-100" : "opacity-30"}`}
                          strokeWidth={2.5}
                        />
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <Button
              type="submit"
              className="mt-1 w-full h-9 text-[14px] font-medium"
              disabled={loading || (password.length > 0 && !allRulesMet)}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        {/* Switch to login */}
        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue hover:underline">
            Log in
          </Link>
        </p>

        {/* Legal */}
        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground/60">
          By creating an account, you agree to our{" "}
          <span className="cursor-pointer hover:underline">Terms of Service</span>
          {" "}and{" "}
          <span className="cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
