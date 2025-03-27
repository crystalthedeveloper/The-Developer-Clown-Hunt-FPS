//store/SupabasePlayerStats.ts

import { supabase } from "./supabaseClient";
import { SupabaseAuth } from "./SupabaseAuth";

export class SupabasePlayerStats {
  static async getAuthenticatedUser() {
    const session = await SupabaseAuth.refreshSession();
    if (!session) return null;

    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) return null;

    return {
      userId: userData.user.id,
      firstName: userData.user.user_metadata?.first_name || "Player",
      lastName: userData.user.user_metadata?.last_name || "",
    };
  }

  static formatPlayTime(seconds: number): string {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  static async trackLogin(): Promise<boolean> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) return false;

      const { error } = await supabase.from("player_stats").insert([
        {
          user_id: user.userId,
          first_name: user.firstName,
          last_name: user.lastName,
          logo: null,
          kills: null,
          game_result: null,
          play_time: null,
          created_at: new Date().toISOString(),
        },
      ]);

      return !error;
    } catch {
      return false;
    }
  }

  static async savePlayerStats(
    rawKills: number,
    rawLogos: number,
    gameResult: "win" | "lose",
    playTime: number
  ): Promise<boolean> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) return false;

      const killScore = rawKills * 20;
      const logoScore = rawLogos * 40;
      const formattedTime = this.formatPlayTime(playTime);

      const { error } = await supabase.from("player_stats").insert([
        {
          user_id: user.userId,
          first_name: user.firstName,
          last_name: user.lastName,
          logo: logoScore,       // ✅ Score for logos
          kills: killScore,      // ✅ Score for kills
          game_result: gameResult.toLowerCase(),
          play_time: formattedTime,
          created_at: new Date().toISOString(),
        },
      ]);

      return !error;
    } catch {
      return false;
    }
  }
}

export default SupabasePlayerStats;