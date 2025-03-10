//store/SupabasePlayerStats.ts

import { supabase } from "./supabaseClient";
import { SupabaseAuth } from "./SupabaseAuth"; // Import authentication handling

export class SupabasePlayerStats {
  /** ✅ Helper function to fetch authenticated user */
  static async getAuthenticatedUser() {
    console.log("👤 Fetching authenticated user...");

    // ✅ Refresh session before proceeding
    const session = await SupabaseAuth.refreshSession();
    if (!session) {
      console.error("❌ Session expired. User needs to re-login.");
      return null;
    }

    // ✅ Fetch user data
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      console.error("❌ Error fetching user:", authError?.message);
      return null;
    }

    return {
      userId: userData.user.id,
      firstName: userData.user.user_metadata?.first_name || "Player",
      lastName: userData.user.user_metadata?.last_name || "",
    };
  }

  /** ✅ Create an entry when the user logs in */
  static async trackLogin(): Promise<boolean> {
    try {
      console.log("🔄 Tracking user login...");
      const user = await this.getAuthenticatedUser();
      if (!user) return false;

      console.log(`✅ Logging login for: ${user.firstName} ${user.lastName}`);

      // ✅ Insert a login entry (empty game stats)
      const { data, error } = await supabase
        .from("player_stats")
        .insert([
          {
            user_id: user.userId,
            first_name: user.firstName,
            last_name: user.lastName,
            score: null, // ✅ No game data yet
            kills: null, // ✅ No game data yet
            game_result: null, // ✅ No game result
            created_at: new Date().toISOString(), // ✅ Timestamp for tracking
          }
        ])
        .select();

      if (error) {
        console.error("❌ Error tracking login:", error.message);
        return false;
      }

      console.log("✅ Login tracked successfully:", data);
      return true;
    } catch (error) {
      console.error("❌ Unexpected error tracking login:", error);
      return false;
    }
  }

  /** ✅ Save Player Stats (adds a new entry for each save) */
  static async savePlayerStats(score: number, kills: number, gameResult: "win" | "lose"): Promise<boolean> {
    try {
      console.log("🔄 Preparing to save game stats...");
      const user = await this.getAuthenticatedUser();
      if (!user) return false;

      console.log(`✅ Saving stats for: ${user.firstName} ${user.lastName}`);

      // ✅ Ensure game result is stored as lowercase
      const result = gameResult.toLowerCase();

      console.log("🆕 Inserting new player stats...");

      // ✅ Insert new game entry
      const { data, error } = await supabase
        .from("player_stats")
        .insert([
          {
            user_id: user.userId,
            first_name: user.firstName,
            last_name: user.lastName,
            score,
            kills,
            game_result: result,
            created_at: new Date().toISOString(), // ✅ Timestamp for tracking
          }
        ])
        .select();

      if (error) {
        console.error("❌ Error inserting player stats:", error.message);
        return false;
      }

      console.log("✅ New player stats saved successfully:", data);
      return true;
    } catch (error) {
      console.error("❌ Unexpected error saving player stats:", error);
      return false;
    }
  }
}

// ✅ Ensure the module is exported correctly
export default SupabasePlayerStats;