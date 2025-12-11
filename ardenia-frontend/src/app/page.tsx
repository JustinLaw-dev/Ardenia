"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground">
            My Mind Matters
          </h1>
          <p className="max-w-md text-lg leading-8 text-muted-foreground">
            Getting things done,{" "}
            <span className="text-foreground font-bold">the fun way.</span>
          </p>
          <div className="flex gap-4">
            <a href="/tasks" className="text-primary underline hover:text-primary/80">
              Tasks
            </a>
            <a href="/gamify" className="text-primary underline hover:text-primary/80">
              Gamify Doc
            </a>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
