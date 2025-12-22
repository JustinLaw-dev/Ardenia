"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FriendCard } from "@/components/friends/FriendCard";
import { FriendRequestCard } from "@/components/friends/FriendRequestCard";
import { AddFriendForm } from "@/components/friends/AddFriendForm";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Bell } from "lucide-react";
import {
  getFriends,
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "@/lib/friends";
import type { FriendWithProfile } from "@/lib/types/database";
import { cn } from "@/lib/utils";

type Tab = "friends" | "requests" | "add";

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendWithProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const [friendsData, pendingData, sentData] = await Promise.all([
      getFriends(user.id),
      getPendingRequests(user.id),
      getSentRequests(user.id),
    ]);

    setFriends(friendsData);
    setPendingRequests(pendingData);
    setSentRequests(sentData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAcceptRequest = async (friendshipId: string) => {
    const result = await acceptFriendRequest(friendshipId);
    if (result.success) {
      fetchData();
    }
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    const result = await declineFriendRequest(friendshipId);
    if (result.success) {
      setPendingRequests((prev) => prev.filter((r) => r.friendship_id !== friendshipId));
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    const result = await removeFriend(friendshipId);
    if (result.success) {
      setFriends((prev) => prev.filter((f) => f.friendship_id !== friendshipId));
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Please log in to view friends.</p>
      </div>
    );
  }

  const tabs = [
    { id: "friends" as Tab, label: "Friends", icon: Users, count: friends.length },
    {
      id: "requests" as Tab,
      label: "Requests",
      icon: Bell,
      count: pendingRequests.length,
      highlight: pendingRequests.length > 0,
    },
    { id: "add" as Tab, label: "Add Friend", icon: UserPlus },
  ];

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Friends</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-terracotta-500 text-terracotta-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full",
                  tab.highlight
                    ? "bg-terracotta-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <>
          {/* Friends Tab */}
          {activeTab === "friends" && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No friends yet</p>
                  <Button
                    onClick={() => setActiveTab("add")}
                    className="bg-terracotta-500 hover:bg-terracotta-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Your First Friend
                  </Button>
                </div>
              ) : (
                friends.map((friend) => (
                  <FriendCard
                    key={friend.friendship_id}
                    friend={friend}
                    onRemove={handleRemoveFriend}
                  />
                ))
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <div className="space-y-6">
              {/* Pending Requests */}
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Incoming Requests
                </h2>
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No pending friend requests
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <FriendRequestCard
                        key={request.friendship_id}
                        request={request}
                        onAccept={handleAcceptRequest}
                        onDecline={handleDeclineRequest}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              {sentRequests.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">
                    Sent Requests
                  </h2>
                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <div
                        key={request.friendship_id}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-terracotta-300 text-white font-semibold flex items-center justify-center">
                          {(request.display_name || request.username || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {request.display_name || request.username || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeclineRequest(request.friendship_id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Friend Tab */}
          {activeTab === "add" && (
            <div className="max-w-md">
              <p className="text-sm text-muted-foreground mb-4">
                Search for friends by name or email.
              </p>
              <AddFriendForm
                currentUserId={user.id}
                onRequestSent={fetchData}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
