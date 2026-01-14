import { createClient } from "@/lib/supabase/client";

export interface UserSettings {
  dark_mode: boolean;
  notifications: boolean;
  email_digest: boolean;
  show_on_leaderboard: boolean;
  show_streak: boolean;
  weekly_reset_day: number; // 0-6, Sunday-Saturday
}

const defaultSettings: UserSettings = {
  dark_mode: false,
  notifications: true,
  email_digest: false,
  show_on_leaderboard: true,
  show_streak: true,
  weekly_reset_day: 1, // Monday
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // Return defaults if no settings exist
    return defaultSettings;
  }

  return {
    dark_mode: data.dark_mode ?? defaultSettings.dark_mode,
    notifications: data.notifications ?? defaultSettings.notifications,
    email_digest: data.email_digest ?? defaultSettings.email_digest,
    show_on_leaderboard: data.show_on_leaderboard ?? defaultSettings.show_on_leaderboard,
    show_streak: data.show_streak ?? defaultSettings.show_streak,
    weekly_reset_day: data.weekly_reset_day ?? defaultSettings.weekly_reset_day,
  };
}

export async function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Error saving settings:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateSetting(
  userId: string,
  key: keyof UserSettings,
  value: boolean | number
): Promise<{ success: boolean; error?: string }> {
  return saveUserSettings(userId, { [key]: value } as Partial<UserSettings>);
}
