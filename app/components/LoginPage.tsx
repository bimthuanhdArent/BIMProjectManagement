"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, Loader2 } from "lucide-react";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const getLoginErrorMessage = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : "";
    const lower = msg.toLowerCase();
    if (lower.includes("invalid login credentials"))
      return "Invalid email or password. If you just signed up, check your email (including Spam) and click the confirmation link before signing in.";
    if (lower.includes("email not confirmed"))
      return "Email not confirmed. Check your inbox (and Spam), click the confirmation link in the email from Supabase, then sign in again.";
    return msg || "Sign in failed.";
  };

  const getSignUpErrorMessage = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : "";
    const lower = msg.toLowerCase();
    if (lower.includes("email rate limit exceeded") || lower.includes("rate limit"))
      return "Too many emails sent in a short time. Please wait about an hour and try again, or use \"Sign in with Google\" to sign in now.";
    return msg || "Sign up failed.";
  };

  const isEmailNotConfirmedError = (): boolean =>
    error?.toLowerCase().includes("not confirmed") ?? false;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
    } catch (err: unknown) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) throw err;
      setSuccessMessage("Check your email to confirm your account.");
    } catch (err: unknown) {
      setError(getSignUpErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!supabase || !email.trim()) return;
    setResendSuccess(false);
    setResendLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.resend({ type: "signup", email: email.trim() });
      if (err) throw err;
      setResendSuccess(true);
    } catch (err: unknown) {
      setError(getSignUpErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!supabase || !email.trim()) return;
    setError(null);
    setResetSent(false);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
      });
      if (err) throw err;
      setResetSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send password reset email.");
    }
  };

  const handleSignInWithGoogle = async () => {
    if (!supabase) return;
    setError(null);
    setLoadingGoogle(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign in failed.";
      setError(message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const onSubmit = isSignUp ? handleSignUp : handleEmailLogin;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="relative z-10 w-full max-w-md">
        {/* Login card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-10 shadow-xl backdrop-blur-sm">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25">
            <LayoutDashboard className="h-8 w-8" strokeWidth={2} />
          </div>

          <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-800">
            Project Health Dashboard
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
            Manage and track your BIM model health in one place.
          </p>

          {/* Email / Password form */}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                  setResetSent(false);
                  setResendSuccess(false);
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
              {!isSignUp && (
                <div className="mt-1.5 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 focus:outline-none focus:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {resetSent && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
                Password reset link sent. Check your inbox (and Spam).
              </p>
            )}
            {error && (
              <div className="space-y-2">
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
                {isEmailNotConfirmedError() && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading}
                      className="rounded-lg border border-emerald-600 bg-white px-3 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-70"
                    >
                      {resendLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </span>
                      ) : (
                        "Resend confirmation email"
                      )}
                    </button>
                    {resendSuccess && (
                      <p className="text-sm text-emerald-700">
                        Email resent. Check your inbox (and Spam).
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            {successMessage && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isSignUp ? "Signing up…" : "Signing in…"}
                </>
              ) : isSignUp ? (
                "Sign up"
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {!isSignUp ? (
            <p className="mt-4 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                  setSuccessMessage(null);
                  setResetSent(false);
                  setResendSuccess(false);
                }}
                className="font-medium text-emerald-600 hover:text-emerald-700 focus:outline-none focus:underline"
              >
                Sign up now
              </button>
            </p>
          ) : (
            <p className="mt-4 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                  setSuccessMessage(null);
                  setResetSent(false);
                  setResendSuccess(false);
                }}
                className="font-medium text-emerald-600 hover:text-emerald-700 focus:outline-none focus:underline"
              >
                Sign in
              </button>
            </p>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/90 px-3 text-sm font-medium text-slate-500">Or</span>
            </div>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleSignInWithGoogle}
            disabled={loadingGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-700 shadow-md transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {loadingGoogle ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            ) : (
              <GoogleLogo className="h-6 w-6 shrink-0" />
            )}
            {loadingGoogle ? "Redirecting…" : "Sign in with Google"}
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Developed by BimThuanHD @ Arent Vietnam
        </p>
      </div>
    </div>
  );
}
