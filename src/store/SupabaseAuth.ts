//store/SupabaseAuth.ts

import { supabase } from "./supabaseClient";

export const SupabaseAuth = {
  /** ✅ User Login with Email */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("⚠️ Login failed:", error.message);
      return null;
    }

    return data?.user ?? null; // ✅ Ensure `user` exists
  },

  /** ✅ User Logout */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("⚠️ Logout failed:", error.message);
    }
  },

  /** ✅ Fetch the Currently Logged-in User */
  async getUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      console.error("⚠️ Error fetching user:", error?.message ?? "No user found.");
      return null;
    }

    // Extract user details with fallback
    const user = data.user;
    const fullName = user.user_metadata?.full_name || "Player";
    
    return { ...user, fullName };
  },

  /** ✅ Get Active Session (Token & Auth Info) */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("⚠️ Failed to retrieve session:", error.message);
      return null;
    }
    return data.session; // ✅ Contains access_token, refresh_token, user data
  },

  /** ✅ Auto-Persist Session */
  async getOrRefreshSession() {
    let session = await this.getSession();

    if (!session) {
      console.log("🔄 No active session found, refreshing...");
      session = await this.refreshSession();
    }

    return session;
  },

  /** ✅ Refresh Auth Session (if needed) */
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("⚠️ Failed to refresh session:", error.message);
      return null;
    }
    return data.session;
  },
};