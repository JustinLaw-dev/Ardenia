"use client";
import { useState } from "react";
import MobileDashboard from "./MobileDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const { level, currentLevelXP, xpToNextLevel, progress } = useGame();

  // Get display name from user metadata or email
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <>
      <nav className="w-full h-16 bg-background border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-16">
          <Link href="/" className="text-xl font-semibold text-foreground h-7">
            My Mind Matters
          </Link>
          {user && (
            <div className="flex items-center h-7 gap-4">
              <Link className=" hover:text-blue-500" href="/tasks">
                Tasks
              </Link>
              <Link className=" hover:text-blue-500" href="/gamify">
                Ideas
              </Link>
            </div>
          )}
        </div>
        {/* Button to open sidebar */}
        {/* <button onClick={() => setOpen(true)} className="p-2 cursor-pointer">
          ☰
        </button> */}

        {/* User info with level */}
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : user ? (
            <>
              {/* Level indicator */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-terracotta-100 text-white font-bold text-xs">
                  {level.icon}
                  {/* Progress ring */}
                  <svg
                    className="absolute inset-0 w-8 h-8 -rotate-90"
                    viewBox="0 0 32 32"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-terracotta-200"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${(progress / 100) * 88} 88`}
                      className="text-terracotta-600"
                    />
                  </svg>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-medium text-foreground">
                    {level.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {currentLevelXP}/{xpToNextLevel} XP
                  </span>
                </div>
              </div>

              <div className="w-px h-6 bg-border hidden sm:block" />
              <div className="w-8 h-8 rounded-full bg-terracotta-500 text-white font-semibold text-sm flex items-center justify-center">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary/80"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Slide-out dashboard */}
      <MobileDashboard open={open} setOpen={setOpen} />
    </>
  );
}
