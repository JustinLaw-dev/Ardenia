"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserSettings, updateSetting } from "@/lib/settings";

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { user } = useAuth();

  // Load theme from user settings or localStorage
  useEffect(() => {
    const loadTheme = async () => {
      // First check localStorage for immediate load (prevents flash)
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "dark") {
        setDarkModeState(true);
        document.documentElement.classList.add("dark");
      }

      // Then load from database if user is logged in
      if (user) {
        const settings = await getUserSettings(user.id);
        setDarkModeState(settings.dark_mode);
        if (settings.dark_mode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", settings.dark_mode ? "dark" : "light");
      }

      setLoaded(true);
    };

    loadTheme();
  }, [user]);

  // Apply dark class when darkMode changes
  useEffect(() => {
    if (!loaded) return;

    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode, loaded]);

  const setDarkMode = async (value: boolean) => {
    setDarkModeState(value);

    // Save to database if user is logged in
    if (user) {
      await updateSetting(user.id, "dark_mode", value);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
