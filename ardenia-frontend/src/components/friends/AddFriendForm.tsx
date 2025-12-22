"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Loader2 } from "lucide-react";
import { sendFriendRequest } from "@/lib/friends";
import { createClient } from "@/lib/supabase/client";
import { getLevelFromXP } from "@/lib/constants/levels";

interface AddFriendFormProps {
  currentUserId: string;
  onRequestSent?: () => void;
}

interface SearchResult {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
}

export function AddFriendForm({ currentUserId, onRequestSent }: AddFriendFormProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handleSearch = async () => {
    if (!query || query.length < 2) {
      setError("Enter at least 2 characters to search");
      return;
    }

    setSearching(true);
    setError(null);
    setResults([]);

    try {
      // Search profiles by display_name or email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, display_name, avatar_url")
        .neq("id", currentUserId)
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (profileError) {
        console.error("Profile search error:", profileError);
        setError("Failed to search users");
        return;
      }

      if (!profiles || profiles.length === 0) {
        setError("No users found. Try a different name or email.");
        return;
      }

      // Get XP data for found users
      const userIds = profiles.map((p) => p.id);
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("user_id, total_xp")
        .in("user_id", userIds);

      const searchResults: SearchResult[] = profiles.map((p) => {
        const progress = progressData?.find((pr) => pr.user_id === p.id);
        return {
          id: p.id,
          email: p.email,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          total_xp: progress?.total_xp || 0,
        };
      });

      setResults(searchResults);
    } catch (err) {
      setError("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setSending(true);
    setError(null);
    setSuccess(null);

    const result = await sendFriendRequest(currentUserId, userId);

    if (result.success) {
      setSuccess("Friend request sent!");
      setResults((prev) => prev.filter((r) => r.id !== userId));
      onRequestSent?.();
    } else {
      setError(result.error || "Failed to send request");
    }

    setSending(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={searching}>
          {searching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-600">{success}</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => {
            const level = getLevelFromXP(user.total_xp);
            const displayName = user.display_name || user.email?.split("@")[0] || "User";
            const initial = displayName.charAt(0).toUpperCase();

            return (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-terracotta-500 text-white font-semibold flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.email && <span className="mr-2">{user.email}</span>}
                    {level.name} • {user.total_xp} XP
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSendRequest(user.id)}
                  disabled={sending}
                  className="bg-terracotta-500 hover:bg-terracotta-600"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
