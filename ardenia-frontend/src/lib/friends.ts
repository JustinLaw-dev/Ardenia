import { createClient } from "@/lib/supabase/client";
import type { Friendship, FriendWithProfile } from "@/lib/types/database";

const supabase = createClient();

// Get all accepted friends for a user
export async function getFriends(userId: string): Promise<FriendWithProfile[]> {
  // Get friendships where user is either requester or addressee
  const { data: friendships, error } = await supabase
    .from("friendships")
    .select("*")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (error) {
    console.error("Error fetching friends:", error);
    return [];
  }

  if (!friendships || friendships.length === 0) {
    return [];
  }

  // Get friend user IDs
  const friendIds = friendships.map((f) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  );

  // Fetch profiles and progress for all friends
  const [{ data: profiles }, { data: progressData }] = await Promise.all([
    supabase.from("profiles").select("*").in("id", friendIds),
    supabase.from("user_progress").select("*").in("user_id", friendIds),
  ]);

  const friends: FriendWithProfile[] = friendships.map((f) => {
    const friendId = f.requester_id === userId ? f.addressee_id : f.requester_id;
    const profile = profiles?.find((p) => p.id === friendId);
    const progress = progressData?.find((p) => p.user_id === friendId);

    return {
      friendship_id: f.id,
      user_id: friendId,
      username: profile?.display_name || null,
      email: profile?.email || null,
      display_name: profile?.display_name || null,
      avatar_url: profile?.avatar_url || null,
      total_xp: progress?.total_xp || 0,
      streak: progress?.streak || 0,
      status: f.status,
      is_requester: f.requester_id === userId,
    };
  });

  return friends;
}

// Get pending friend requests (received)
export async function getPendingRequests(userId: string): Promise<FriendWithProfile[]> {
  const { data: requests, error } = await supabase
    .from("friendships")
    .select("*")
    .eq("addressee_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching requests:", error);
    return [];
  }

  if (!requests || requests.length === 0) {
    return [];
  }

  // Get requester IDs
  const requesterIds = requests.map((r) => r.requester_id);

  // Fetch profiles and progress for requesters
  const [{ data: profiles }, { data: progressData }] = await Promise.all([
    supabase.from("profiles").select("*").in("id", requesterIds),
    supabase.from("user_progress").select("*").in("user_id", requesterIds),
  ]);

  const pending: FriendWithProfile[] = requests.map((r) => {
    const profile = profiles?.find((p) => p.id === r.requester_id);
    const progress = progressData?.find((p) => p.user_id === r.requester_id);

    return {
      friendship_id: r.id,
      user_id: r.requester_id,
      username: profile?.display_name || null,
      email: profile?.email || null,
      display_name: profile?.display_name || null,
      avatar_url: profile?.avatar_url || null,
      total_xp: progress?.total_xp || 0,
      streak: progress?.streak || 0,
      status: r.status,
      is_requester: false,
    };
  });

  return pending;
}

// Get sent friend requests (pending)
export async function getSentRequests(userId: string): Promise<FriendWithProfile[]> {
  const { data: requests, error } = await supabase
    .from("friendships")
    .select("*")
    .eq("requester_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching sent requests:", error);
    return [];
  }

  if (!requests || requests.length === 0) {
    return [];
  }

  const addresseeIds = requests.map((r) => r.addressee_id);

  // Fetch profiles and progress for addressees
  const [{ data: profiles }, { data: progressData }] = await Promise.all([
    supabase.from("profiles").select("*").in("id", addresseeIds),
    supabase.from("user_progress").select("*").in("user_id", addresseeIds),
  ]);

  const sent: FriendWithProfile[] = requests.map((r) => {
    const profile = profiles?.find((p) => p.id === r.addressee_id);
    const progress = progressData?.find((p) => p.user_id === r.addressee_id);

    return {
      friendship_id: r.id,
      user_id: r.addressee_id,
      username: profile?.display_name || null,
      email: profile?.email || null,
      display_name: profile?.display_name || null,
      avatar_url: profile?.avatar_url || null,
      total_xp: progress?.total_xp || 0,
      streak: progress?.streak || 0,
      status: r.status,
      is_requester: true,
    };
  });

  return sent;
}

// Send a friend request
export async function sendFriendRequest(
  requesterId: string,
  addresseeId: string
): Promise<{ success: boolean; error?: string }> {
  // Check if friendship already exists
  const { data: existing } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`
    )
    .single();

  if (existing) {
    if (existing.status === "accepted") {
      return { success: false, error: "Already friends" };
    }
    if (existing.status === "pending") {
      return { success: false, error: "Request already pending" };
    }
    if (existing.status === "blocked") {
      return { success: false, error: "Cannot send request" };
    }
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: requesterId,
    addressee_id: addresseeId,
    status: "pending",
  });

  if (error) {
    console.error("Error sending request:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Accept a friend request
export async function acceptFriendRequest(
  friendshipId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", friendshipId);

  if (error) {
    console.error("Error accepting request:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Decline a friend request
export async function declineFriendRequest(
  friendshipId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) {
    console.error("Error declining request:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Remove a friend
export async function removeFriend(
  friendshipId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) {
    console.error("Error removing friend:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Search users by email (for adding friends)
export async function searchUsers(
  query: string,
  currentUserId: string
): Promise<{ id: string; email: string; total_xp: number }[]> {
  if (!query || query.length < 3) {
    return [];
  }

  // Search in user_progress table by user_id
  // Note: For production, you'd want a proper users table with searchable fields
  const { data: progressData, error } = await supabase
    .from("user_progress")
    .select("user_id, total_xp")
    .neq("user_id", currentUserId)
    .limit(10);

  if (error) {
    console.error("Error searching users:", error);
    return [];
  }

  // For now, return user_id as email placeholder
  // In production, join with auth.users or a profiles table
  return (progressData || []).map((p) => ({
    id: p.user_id,
    email: p.user_id.slice(0, 8) + "...", // Placeholder
    total_xp: p.total_xp || 0,
  }));
}

// Get pending request count
export async function getPendingRequestCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("addressee_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching request count:", error);
    return 0;
  }

  return count || 0;
}
