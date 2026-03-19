"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Confirming…");

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setStatus("error");
      setMessage("Supabase not configured.");
      return;
    }

    const run = async () => {
      if (!client) return;
      const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const code = params?.get("code");
      const errorParam = params?.get("error_description") ?? params?.get("error");
      const hashParams = hash ? new URLSearchParams(hash) : null;
      const accessToken = hashParams?.get("access_token");
      const refreshToken = hashParams?.get("refresh_token");

      if (errorParam) {
        setStatus("error");
        setMessage(decodeURIComponent(errorParam));
        return;
      }

      try {
        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (accessToken && refreshToken) {
          const { error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
        } else if (hash) {
          await new Promise((r) => setTimeout(r, 500));
          const { data: { session } } = await client.auth.getSession();
          if (!session) throw new Error("Could not confirm session.");
        } else {
          setStatus("error");
          setMessage("Invalid or expired link.");
          return;
        }

        setStatus("ok");
        setMessage("Confirmed. Redirecting…");
        window.location.replace("/");
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Confirmation failed.");
      }
    };

    run();
  }, []);

  if (status === "ok") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-center text-slate-700">{message}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="max-w-md text-center text-slate-700">{message}</p>
        <a
          href="/"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Back to home
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      <p className="text-center text-slate-700">{message}</p>
    </div>
  );
}
