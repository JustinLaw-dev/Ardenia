"use client";
import { useState } from "react";
import Image from "next/image";
import MobileDashboard from "./MobileDashboard";
import { CircleUser } from "lucide-react";

export default function Navbar({ user }: { user?: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="w-full h-16 bg-white border-b flex items-center justify-between px-4">
        {/* Button to open sidebar */}
        <button onClick={() => setOpen(true)} className="p-2 cursor-pointer">
          ☰
        </button>

        <a className="text-xl font-semibold" href="/">
          My Mind Matters
        </a>

        {/* User info */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-gray-700">{user.name}</span>
              <CircleUser />
            </>
          ) : (
            <button className="text-sm">Login</button>
          )}
        </div>
      </nav>

      {/* Slide-out dashboard */}
      <MobileDashboard open={open} setOpen={setOpen} />
    </>
  );
}
