"use client";

import { cn } from "@/lib/utils";
import { getLevelFromXP } from "@/lib/constants/levels";
import type { FriendWithProfile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";

interface FriendCardProps {
  friend: FriendWithProfile;
  onRemove?: (friendshipId: string) => void;
  className?: string;
}

export function FriendCard({ friend, onRemove, className }: FriendCardProps) {
  const level = getLevelFromXP(friend.total_xp);
  const displayName = friend.display_name || friend.username || friend.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 bg-card border border-border rounded-lg transition-all hover:border-terracotta-300",
        className
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-terracotta-500 text-white font-semibold text-lg flex items-center justify-center">
          {friend.avatar_url ? (
            <img
              src={friend.avatar_url}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        {/* Level badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center text-xs">
          {level.icon}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{level.name}</span>
          <span>•</span>
          <span>{friend.total_xp.toLocaleString()} XP</span>
          {friend.streak > 0 && (
            <>
              <span>•</span>
              <span className="text-orange-500">{friend.streak} day streak</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(friend.friendship_id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <UserMinus className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
