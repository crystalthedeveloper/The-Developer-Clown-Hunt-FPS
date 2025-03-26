// store/supabaseHelpers.ts
import { supabase } from "./supabaseClient";

export async function getUserName(): Promise<string | null> {
  // Step 1: Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("❌ Auth error or no user found:", authError);
    return null;
  }

  // Step 2: Query users_access table using user's email
  const { data, error } = await supabase
    .from("users_access")
    .select("first_name, last_name")
    .eq("email", user.email)
    .limit(1);

  if (error || !data?.length) {
    console.error("❌ Error fetching user from users_access:", error);
    return "Player";
  }

  const { first_name, last_name } = data[0];
  return [first_name, last_name].filter(Boolean).join(" ").trim() || "Player";
}