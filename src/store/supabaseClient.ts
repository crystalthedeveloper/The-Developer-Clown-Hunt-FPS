//store/supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://your-project-url.supabase.co"; // Replace with your Supabase project URL
const SUPABASE_ANON_KEY = "your-anon-key"; // Replace with your Supabase API key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
