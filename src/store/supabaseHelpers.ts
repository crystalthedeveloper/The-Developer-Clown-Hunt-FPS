// store/supabaseHelpers.ts
import { supabase } from "./supabaseClient";

/**
 * ✅ Get the user's name from the `player_stats` table.
 */
export async function getUserName(): Promise<string | null> {
  try {
    // Step 1: Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Auth error or no user found:", authError);
      return "Player";
    }

    // Step 2: Query the player_stats table using user_id
    const { data, error } = await supabase
      .from("player_stats")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }) // Get most recent entry
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.warn("⚠️ Fallback to metadata: Couldn't find player_stats name.");
      const { full_name, first_name, last_name } = user.user_metadata || {};
      return (
        full_name ||
        [first_name, last_name].filter(Boolean).join(" ").trim() ||
        "Player"
      );
    }

    // ✅ Return name from player_stats
    const { first_name, last_name } = data;
    return [first_name, last_name].filter(Boolean).join(" ").trim() || "Player";
  } catch (err) {
    console.error("❌ Unexpected error getting user name:", err);
    return "Player";
  }
}