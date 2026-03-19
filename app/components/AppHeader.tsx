"use client";

import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface AppHeaderProps {
  user: User | null;
}

export default function AppHeader({ user }: AppHeaderProps) {
  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <span className="text-sm font-medium text-slate-600">
          {user?.email ?? "Dashboard"}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </header>
  );
}
