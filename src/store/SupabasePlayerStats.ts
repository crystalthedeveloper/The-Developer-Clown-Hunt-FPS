//store/SupabasePlayerStats.ts

import { supabase } from "./supabaseClient";

export class SupabasePlayerStats {
  /** Save Player Stats */
  static async savePlayerStats(score: number, kills: number, gameResult: "win" | "lose"): Promise<boolean> {
    try {
      // Fetch authenticated user
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user) {
        console.error("❌ Error: User is not authenticated");
        return false;
      }

      const userId = userData.user.id;
      let firstName: string | null = null;
      let lastName: string | null = null;

      // ✅ Try fetching from `profiles` table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles") // Ensure this is your actual table name
        .select("first_name, last_name")
        .eq("user_id", userId) // If `user_id` does not work, change to `.eq("id", userId)`
        .single();

      if (profileError) {
        console.warn("⚠️ Warning: Could not fetch user's name from 'profiles'", profileError.message);
      }

      if (profileData) {
        firstName = profileData.first_name;
        lastName = profileData.last_name;
      } else {
        console.warn("⚠️ No user profile found in 'profiles'. Checking user metadata...");
      }

      // ✅ If no profile data, fallback to `user_metadata`
      if (!firstName) {
        firstName = userData.user.user_metadata?.first_name || userData.user.user_metadata?.full_name || "Player";
      }
      if (!lastName) {
        lastName = userData.user.user_metadata?.last_name || "";
      }

      console.log(`✅ Fetched Name: ${firstName} ${lastName}`);

      // ✅ Ensure game_result is stored as lowercase
      const result = gameResult.toLowerCase();

      // Insert a new game result
      const { error } = await supabase
        .from("player_stats")
        .insert([
          {
            user_id: userId,
            first_name: firstName, // ✅ Store first name
            last_name: lastName, // ✅ Store last name
            score,
            kills,
            game_result: result, // ✅ Store lowercase "win" or "lose"
          }
        ]);

      if (error) {
        console.error("❌ Error saving player stats:", error);
        return false;
      }

      console.log("✅ Game saved successfully");
      return true;
    } catch (error) {
      console.error("❌ Unexpected error saving player stats:", error);
      return false;
    }
  }
}