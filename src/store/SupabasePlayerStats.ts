//store/SupabasePlayerStats.ts

import { supabase } from "./supabaseClient";

export class SupabasePlayerStats {
  /** ✅ Save Player Stats */
  static async savePlayerStats(score: number, kills: number): Promise<boolean> {
    try {
      // ✅ Fetch authenticated user
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        return false; // User is not authenticated
      }

      const userId = userData.user.id;

      // ✅ Insert player stats into `player_stats` table
      const { error } = await supabase
        .from("player_stats")
        .insert([
          {
            user_id: userId,
            score,
            kills,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      return !error; // Return true if no error, false otherwise
    } catch {
      return false; // Handle unexpected errors silently
    }
  }

  /** ✅ Fetch Player Stats */
  static async getPlayerStats(): Promise<any> {
    try {
      // ✅ Ensure user is authenticated
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return null; // Return null if user is not authenticated
      }

      const userId = userData.user.id;

      // ✅ Query player's stats
      const { data, error } = await supabase
        .from("player_stats")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      return error ? null : data; // Return data if no error, otherwise null
    } catch {
      return null; // Handle unexpected errors silently
    }
  }
}