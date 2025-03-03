//store/SupabaseAuth.ts

import { supabase } from "./supabaseClient";

export const SupabaseAuth = {
  /** ✅ User Login with Email */
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("⚠️ Login failed:", error.message);
        return null;
      }

      console.log("✅ User logged in:", data?.user);
      return data?.user ?? null; // ✅ Ensure `user` exists
    } catch (err) {
      console.error("❌ Unexpected login error:", err);
      return null;
    }
  },

  /** ✅ User Logout */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("⚠️ Logout failed:", error.message);
      } else {
        console.log("✅ User logged out successfully");
      }
    } catch (err) {
      console.error("❌ Unexpected logout error:", err);
    }
  },

  /** ✅ Fetch the Currently Logged-in User */
  async getUser() {
    try {
      // 🔄 Ensure session is up-to-date before checking user
      await supabase.auth.refreshSession();

      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.warn("⚠️ No user found or session expired.");
        return null;
      }

      console.log("✅ Authenticated User:", data.user);
      return {
        ...data.user,
        fullName: data.user.user_metadata?.full_name || "Player",
      };
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      return null;
    }
  },

  /** ✅ Get Active Session (Token & Auth Info) */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) {
        console.warn("⚠️ No active session found.");
        return null;
      }
      console.log("✅ Active session retrieved.");
      return data.session;
    } catch (err) {
      console.error("❌ Error retrieving session:", err);
      return null;
    }
  },

  /** ✅ Auto-Persist Session */
  async getOrRefreshSession() {
    try {
      let session = await this.getSession();

      if (!session) {
        console.log("🔄 No active session found, refreshing...");
        session = await this.refreshSession();
      }

      return session;
    } catch (err) {
      console.error("❌ Error auto-refreshing session:", err);
      return null;
    }
  },

  /** ✅ Refresh Auth Session (if needed) */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data?.session) {
        console.warn("⚠️ Failed to refresh session.");
        return null;
      }
      console.log("✅ Session refreshed successfully.");
      return data.session;
    } catch (err) {
      console.error("❌ Error refreshing session:", err);
      return null;
    }
  },
};