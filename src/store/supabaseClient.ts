//store/supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Supabase environment variables are missing in Vercel!");
  throw new Error("Supabase environment variables are missing!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);