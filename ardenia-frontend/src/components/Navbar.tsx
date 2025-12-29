"use client";
import { useState, useEffect } from "react";
import MobileDashboard from "./MobileDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getPendingRequestCount } from "@/lib/friends";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings, LogOut, User, Moon, Sun } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { user, loading, signOut } = useAuth();
  const { level, currentLevelXP, xpToNextLevel, progress } = useGame();
  const { darkMode, toggleDarkMode } = useTheme();

  // Fetch pending friend request count
  useEffect(() => {
    if (user) {
      getPendingRequestCount(user.id).then(setPendingCount);
    }
  }, [user]);

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
              <Link className="relative hover:text-blue-500" href="/friends">
                Friends
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-3 px-1.5 py-0.5 text-xs bg-terracotta-500 text-white rounded-full min-w-[18px] text-center">
                    {pendingCount}
                  </span>
                )}
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

              {/* User menu */}
              <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger asChild>
                  <button className="w-8 h-8 rounded-full bg-terracotta-500 text-white font-semibold text-sm flex items-center justify-center hover:bg-terracotta-600 transition-colors cursor-pointer">
                    {displayName.charAt(0).toUpperCase()}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2">
                  {/* User info header */}
                  <div className="px-2 py-3 border-b border-border mb-2">
                    <p className="font-medium text-sm text-foreground">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="space-y-1">
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Account
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Preferences
                    </Link>
                    <button
                      onClick={toggleDarkMode}
                      className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full"
                    >
                      {darkMode ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                      {darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
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
