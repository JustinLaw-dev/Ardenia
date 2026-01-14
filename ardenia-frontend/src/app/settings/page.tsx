"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Moon, Sun, Bell, Shield, Trash2, Loader2, CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserSettings, updateSetting, type UserSettings } from "@/lib/settings";
import { RESET_DAYS } from "@/lib/constants/weekly-quest";

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  loading?: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({ label, description, checked, loading, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        disabled={loading}
        className="mt-0.5"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const [settings, setSettings] = useState<Omit<UserSettings, "dark_mode">>({
    notifications: true,
    email_digest: false,
    show_on_leaderboard: true,
    show_streak: true,
    weekly_reset_day: 1,
  });
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<keyof UserSettings | null>(null);

  // Load settings on mount
  useEffect(() => {
    if (user) {
      getUserSettings(user.id).then((data) => {
        setSettings({
          notifications: data.notifications,
          email_digest: data.email_digest,
          show_on_leaderboard: data.show_on_leaderboard,
          show_streak: data.show_streak,
          weekly_reset_day: data.weekly_reset_day,
        });
        setLoading(false);
      });
    }
  }, [user]);

  const handleToggle = async (key: keyof UserSettings, value: boolean) => {
    if (!user) return;

    // Dark mode is handled by ThemeContext
    if (key === "dark_mode") {
      setSavingKey(key);
      await setDarkMode(value);
      setSavingKey(null);
      return;
    }

    // Optimistic update
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSavingKey(key);

    const result = await updateSetting(user.id, key, value);

    if (!result.success) {
      // Revert on error
      setSettings((prev) => ({ ...prev, [key]: !value }));
    }

    setSavingKey(null);
  };

  const handleResetDayChange = async (value: string) => {
    if (!user) return;
    const dayValue = parseInt(value, 10);

    // Optimistic update
    setSettings((prev) => ({ ...prev, weekly_reset_day: dayValue }));
    setSavingKey("weekly_reset_day");

    const result = await updateSetting(user.id, "weekly_reset_day", dayValue);

    if (!result.success) {
      // Revert on error
      setSettings((prev) => ({ ...prev, weekly_reset_day: settings.weekly_reset_day }));
    }

    setSavingKey(null);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Please log in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Preferences</h1>

      {/* Appearance */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          {darkMode ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        </div>

        <SettingToggle
          label="Dark Mode"
          description="Use dark theme throughout the app"
          checked={darkMode}
          loading={savingKey === "dark_mode"}
          onChange={(checked) => handleToggle("dark_mode", checked)}
        />
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        </div>

        <div className="divide-y divide-border">
          <SettingToggle
            label="Push Notifications"
            description="Receive notifications for friend requests and achievements"
            checked={settings.notifications}
            loading={savingKey === "notifications"}
            onChange={(checked) => handleToggle("notifications", checked)}
          />
          <SettingToggle
            label="Email Digest"
            description="Receive weekly summary of your progress"
            checked={settings.email_digest}
            loading={savingKey === "email_digest"}
            onChange={(checked) => handleToggle("email_digest", checked)}
          />
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-foreground">Privacy</h2>
        </div>

        <div className="divide-y divide-border">
          <SettingToggle
            label="Show on Leaderboard"
            description="Allow friends to see your ranking"
            checked={settings.show_on_leaderboard}
            loading={savingKey === "show_on_leaderboard"}
            onChange={(checked) => handleToggle("show_on_leaderboard", checked)}
          />
          <SettingToggle
            label="Show Streak Publicly"
            description="Let friends see your current streak"
            checked={settings.show_streak}
            loading={savingKey === "show_streak"}
            onChange={(checked) => handleToggle("show_streak", checked)}
          />
        </div>
      </div>

      {/* Weekly Quest */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-foreground">Weekly Quest</h2>
        </div>

        <div className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Week Reset Day</p>
              <p className="text-xs text-muted-foreground">
                Choose when your weekly quest cycle resets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(settings.weekly_reset_day)}
                onValueChange={handleResetDayChange}
                disabled={savingKey === "weekly_reset_day"}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESET_DAYS.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {savingKey === "weekly_reset_day" && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-destructive/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5 text-destructive" />
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={signOut}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Sign Out
          </Button>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete your account? This cannot be undone."
                )
              ) {
                alert("Account deletion is not implemented yet.");
              }
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
