"use client";

import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import LoginPage from "./LoginPage";
import AppHeader from "./AppHeader";
import RevitDashboard from "./RevitDashboard";
import { Loader2, Settings } from "lucide-react";

export default function AuthWrapper() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const code = params?.get("code");
    const next = params?.get("next") ?? "/";

    if (code && typeof window !== "undefined") {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data: { session: s } }) => {
          setSession(s);
          window.history.replaceState({}, "", next);
        })
        .finally(() => setLoading(false));
    } else {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
        setLoading(false);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <Settings className="mx-auto mb-3 h-10 w-10 text-amber-600" />
          <h2 className="text-center font-semibold">Supabase not configured</h2>
          <p className="mt-2 text-center text-sm">
            Add <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
            <code className="rounded bg-amber-100 px-1">.env.local</code> in the <code className="rounded bg-amber-100 px-1">my-app</code> folder, then restart <code className="rounded bg-amber-100 px-1">npm run dev</code>.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <>
      <AppHeader user={session.user} />
      <RevitDashboard userId={session.user.id} />
    </>
  );
}
