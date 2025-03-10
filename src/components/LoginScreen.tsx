// components/LoginScreen.tsx

import { useState } from "react";
import { supabase } from "../store/supabaseClient";
import "../css/LoginScreen.css";

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Sign in user with Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      // ✅ Get logged-in user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("User not found.");

      const userId = userData.user.id;
      const firstName = userData.user.user_metadata?.first_name || "Unknown";
      const lastName = userData.user.user_metadata?.last_name || "User";

      // ✅ Step 2: Check if user exists in player_stats
      const { data: existingPlayer, error: fetchError } = await supabase
        .from("player_stats")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (fetchError) console.error("Fetch player error:", fetchError.message);

      // ✅ If player doesn't exist, insert into `player_stats`
      if (!existingPlayer) {
        const { error: insertError } = await supabase.from("player_stats").insert([
          {
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            score: 0,
            kills: 0,
          },
        ]);

        if (insertError) throw new Error("Failed to create player record.");
      }

      // ✅ Call success function
      onLoginSuccess(userData.user);
    } catch (err: any) {
      setError(`❌ Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen fade-in">
      <div className="login-box">
        <h2 className="login-box-header">🔐 Login to Play</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="📧 Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="🔑 Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "🔄 Logging in..." : "🎮 Log In"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="button-group">
          <button className="back-button" onClick={() => window.location.href = "https://www.crystalthedeveloper.ca/"}>
            🔙 Back to Home
          </button>

          <button className="next-button" onClick={() => window.location.href = "https://www.crystalthedeveloper.ca/user-pages/signup"}>
            🖊️ Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;