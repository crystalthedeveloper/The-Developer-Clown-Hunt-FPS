//store/supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase environment variables are missing!");
}

// Ensure session is persisted across refreshes & different browser tabs
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    // Handle sign-out logic here if needed
  }
  if (event === "SIGNED_IN") {
    // Handle sign-in logic here if needed
  }
});