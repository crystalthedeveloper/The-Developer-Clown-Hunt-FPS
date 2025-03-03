//store/supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Supabase environment variables are missing in Vercel!");
  throw new Error("Supabase environment variables are missing!");
}

// ✅ Ensure session is persisted across refreshes & different browser tabs
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // 🔄 Ensures session stays after refresh
    storage: localStorage, // ✅ Explicitly use localStorage for session storage
    autoRefreshToken: true, // 🔄 Automatically refresh tokens
    detectSessionInUrl: true, // ✅ Detects session tokens in URL (for embedded login flows)
  },
});

// ✅ Log session restoration for debugging
supabase.auth.getSession().then(({ data, error }) => {
  if (error || !data.session) {
    console.warn("⚠️ No active session found on load.");
  } else {
    console.log("✅ Session restored:", data.session);
  }
});

// ✅ Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`🔄 Auth state changed: ${event}`, session);
  if (event === "SIGNED_OUT") {
    console.log("👋 User logged out.");
  }
  if (event === "SIGNED_IN") {
    console.log("✅ User signed in:", session?.user);
  }
});