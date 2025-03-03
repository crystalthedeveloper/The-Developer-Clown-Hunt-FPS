//store/SupabasePlayerStats.ts

import { supabase } from "./supabaseClient";

export class SupabasePlayerStats {
  static async savePlayerStats(score: number, kills: number): Promise<boolean> {
    try {
      const user = await supabase.auth.getUser();
      if (!user?.data?.user) {
        console.error("User is not authenticated.");
        return false;
      }

      const { data, error } = await supabase
        .from("player_stats")
        .insert([{ user_id: user.data.user.id, score, kills, created_at: new Date() }]);

      if (error) {
        console.error("Error saving player stats:", error);
        return false;
      }

      console.log("✅ Player stats saved successfully:", data);
      return true;
    } catch (err) {
      console.error("Unexpected error saving player stats:", err);
      return false;
    }
  }
}
