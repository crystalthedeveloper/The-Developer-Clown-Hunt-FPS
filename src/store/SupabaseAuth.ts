//store/SupabaseAuth.ts

import { supabase } from "./supabaseClient";

export const SupabaseAuth = {
  /** User Login with Email */
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return null; // Return null on failure
      }

      // Store session in localStorage to persist login
      if (data?.session) {
        localStorage.setItem("supabaseSession", JSON.stringify(data.session));
      }

      return data?.user ?? null;
    } catch {
      return null; // Handle unexpected errors
    }
  },

  /** User Logout */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        localStorage.removeItem("supabaseSession"); // 🗑 Clear stored session
      }
    } catch {
      // Handle unexpected logout errors silently
    }
  },

  /** Fetch the Currently Logged-in User */
  async getUser() {
    try {
      // First, check if a session exists in localStorage (for persistent login)
      const storedSession = localStorage.getItem("supabaseSession");
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        await supabase.auth.setSession(parsedSession);
      }

      // Fetch the latest session from Supabase
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        return null; // No active session found
      }

      // Now fetch the user
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        return null; // No user found, session might have expired
      }

      return {
        ...data.user,
        fullName: data.user.user_metadata?.full_name || "Player",
      };
    } catch {
      return null; // Handle errors silently
    }
  },
};