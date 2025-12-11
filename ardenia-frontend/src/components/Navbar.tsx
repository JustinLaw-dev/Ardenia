"use client";
import { useState } from "react";
import MobileDashboard from "./MobileDashboard";
import { CircleUser } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  // Get display name from user metadata or email
  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "User";

  return (
    <>
      <nav className="w-full h-16 bg-background border-b border-border flex items-center justify-between px-4">
        {/* Button to open sidebar */}
        <button onClick={() => setOpen(true)} className="p-2 cursor-pointer">
          ☰
        </button>

        <Link href="/" className="text-xl font-semibold text-foreground">
          My Mind Matters
        </Link>

        {/* User info */}
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : user ? (
            <>
              <span className="text-sm text-muted-foreground">{displayName}</span>
              <CircleUser className="text-foreground" />
            </>
          ) : (
            <Link href="/login" className="text-sm text-primary hover:text-primary/80">
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
