"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getLevelFromXP } from "@/lib/constants/levels";
import type { FriendWithProfile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface FriendRequestCardProps {
  request: FriendWithProfile;
  onAccept: (friendshipId: string) => Promise<void>;
  onDecline: (friendshipId: string) => Promise<void>;
  className?: string;
}

export function FriendRequestCard({
  request,
  onAccept,
  onDecline,
  className,
}: FriendRequestCardProps) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const level = getLevelFromXP(request.total_xp);
  const displayName = request.display_name || request.username || request.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleAccept = async () => {
    setLoading("accept");
    await onAccept(request.friendship_id);
    setLoading(null);
  };

  const handleDecline = async () => {
    setLoading("decline");
    await onDecline(request.friendship_id);
    setLoading(null);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 bg-card border border-border rounded-lg",
        className
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-terracotta-500 text-white font-semibold text-lg flex items-center justify-center">
          {request.avatar_url ? (
            <img
              src={request.avatar_url}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
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
          <span>{request.total_xp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={loading !== null}
          className="bg-terracotta-500 hover:bg-terracotta-600"
        >
          {loading === "accept" ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" />
              Accept
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDecline}
          disabled={loading !== null}
        >
          {loading === "decline" ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              <X className="w-4 h-4 mr-1" />
              Decline
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
