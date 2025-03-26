//store/SupabasePlayerStats.ts

import { supabase } from "./supabaseClient";
import { SupabaseAuth } from "./SupabaseAuth";

export class SupabasePlayerStats {
  /** ✅ Helper function to fetch authenticated user */
  static async getAuthenticatedUser() {
    console.log("👤 Fetching authenticated user...");

    const session = await SupabaseAuth.refreshSession();
    if (!session) {
      console.error("❌ Session expired. User needs to re-login.");
      return null;
    }

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

  /** ✅ Format raw seconds into MM:SS */
  static formatPlayTime(seconds: number): string {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  /** ✅ Create an entry when the user logs in */
  static async trackLogin(): Promise<boolean> {
    try {
      console.log("🔄 Tracking user login...");
      const user = await this.getAuthenticatedUser();
      if (!user) return false;

      console.log(`✅ Logging login for: ${user.firstName} ${user.lastName}`);

      const { data, error } = await supabase
        .from("player_stats")
        .insert([
          {
            user_id: user.userId,
            first_name: user.firstName,
            last_name: user.lastName,
            score: null,
            kills: null,
            game_result: null,
            play_time: null, // optional for login-only entries
            created_at: new Date().toISOString(),
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

  /** ✅ Save Player Stats with formatted time */
  static async savePlayerStats(
    score: number,
    kills: number,
    gameResult: "win" | "lose",
    playTime: number
  ): Promise<boolean> {
    try {
      console.log("🔄 Preparing to save game stats...");
      const user = await this.getAuthenticatedUser();
      if (!user) return false;

      const result = gameResult.toLowerCase();
      const formattedTime = this.formatPlayTime(playTime); // ⏱ Convert to MM:SS format

      console.log(`✅ Saving stats for: ${user.firstName} ${user.lastName}`);
      console.log(`🕒 Formatted play time: ${formattedTime}`);

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
            play_time: formattedTime, // ✅ Save as "MM:SS"
            created_at: new Date().toISOString(),
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

export default SupabasePlayerStats;