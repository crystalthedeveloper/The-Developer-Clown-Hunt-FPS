// components/LoginScreen.tsx

import { useState, useEffect } from "react";
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
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          console.log("✅ Auto-login with session");
          onLoginSuccess(userData.user);
          return;
        }
      }
      setCheckingSession(false);
    };

    checkSession();

    // ✅ Listen for auth changes (auto-login after form submission)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        console.log("🎉 Supabase SIGNED_IN event");
        onLoginSuccess(session.user);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [onLoginSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw new Error(error.message);

      // ❗️DO NOT call onLoginSuccess here directly
      // Let the auth listener above handle it
    } catch (err: any) {
      setError(`❌ Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) return null; // or show a loading spinner

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
            autoComplete="email"
            autoCapitalize="none"
            autoFocus
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
          <button
            className="back-button"
            onClick={() => (window.location.href = "https://www.crystalthedeveloper.ca")}
          >
            🔙 Back to Home
          </button>

          <button
            className="next-button"
            onClick={() => (window.location.href = "https://www.crystalthedeveloper.ca/user-pages/signup")}
          >
            🖊️ Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;