"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { getPendingRequestCount } from "@/lib/friends";
import {
  Home,
  CheckSquare,
  Users,
  Lightbulb,
  Trophy,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/weekly-quest", label: "Weekly Quest", icon: ScrollText },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/gamify", label: "Ideas", icon: Lightbulb },
];

interface NavLinkProps {
  item: NavItem;
  isCollapsed?: boolean;
  isActive: boolean;
  pendingCount: number;
  onClick?: () => void;
}

function NavLinkItem({
  item,
  isCollapsed = false,
  isActive,
  pendingCount,
  onClick,
}: NavLinkProps) {
  const Icon = item.icon;
  const showBadge = item.href === "/friends" && pendingCount > 0;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
        isCollapsed ? "justify-center px-2" : ""
      } ${
        isActive
          ? "bg-terracotta-100 text-terracotta-700 font-medium"
          : "text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
      {showBadge && (
        <span
          className={`px-1.5 py-0.5 text-xs bg-terracotta-500 text-white rounded-full min-w-[18px] text-center ${
            isCollapsed ? "absolute -top-1 -right-1" : "absolute right-3"
          }`}
        >
          {pendingCount}
        </span>
      )}
    </Link>
  );
}

interface LevelInfo {
  icon: string;
  name: string;
}

interface SidebarContentProps {
  isCollapsed?: boolean;
  level: LevelInfo;
  progress: number;
  pathname: string;
  pendingCount: number;
  onNavClick?: () => void;
}

function SidebarContent({
  isCollapsed = false,
  level,
  progress,
  pathname,
  pendingCount,
  onNavClick,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className={`flex-1 p-4 space-y-1 ${isCollapsed ? "p-2" : ""}`}>
        {navItems.map((item) => (
          <NavLinkItem
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            isActive={pathname === item.href}
            pendingCount={pendingCount}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Level Progress */}
      <div className={`p-4 border-t border-border ${isCollapsed ? "p-2" : ""}`}>
        <div
          className={`flex items-center gap-3 ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={
            isCollapsed ? `${level.name} - ${Math.round(progress)}%` : undefined
          }
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-terracotta-100 text-lg shrink-0">
            {level.icon}
            <svg
              className="absolute inset-0 w-10 h-10 -rotate-90"
              viewBox="0 0 40 40"
            >
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-terracotta-200"
              />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${(progress / 100) * 113} 113`}
                className="text-terracotta-600"
              />
            </svg>
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium text-foreground">
                {level.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% to next level
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to get initial collapsed state (runs once on mount)
function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sidebar-collapsed") === "true";
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();
  const { user } = useAuth();
  const { level, progress } = useGame();

  // Update CSS variable and localStorage when collapsed changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "4rem" : "16rem"
    );
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  // Fetch pending friend request count
  useEffect(() => {
    if (user) {
      getPendingRequestCount(user.id).then(setPendingCount);
    }
  }, [user]);

  const closeMobileMenu = () => setMobileOpen(false);

  if (!user) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-terracotta-500 text-white rounded-full shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-semibold">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 hover:bg-muted rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent
          level={level}
          progress={progress}
          pathname={pathname}
          pendingCount={pendingCount}
          onNavClick={closeMobileMenu}
        />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:top-16 lg:left-0 lg:bottom-0 bg-card border-r border-border transition-all duration-300 ${
          collapsed ? "lg:w-16" : "lg:w-64"
        }`}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-10 p-1 bg-background border border-border rounded-full hover:bg-muted transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        <SidebarContent
          isCollapsed={collapsed}
          level={level}
          progress={progress}
          pathname={pathname}
          pendingCount={pendingCount}
        />
      </aside>
    </>
  );
}
