// components/LoginScreen.tsx

import { useState } from "react";
import { SupabaseAuth } from "../store/SupabaseAuth";
import "../css/LoginScreen.css"; // Import external CSS

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Prevent multiple submissions

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Disable the login button

    try {
      const user = await SupabaseAuth.signInWithEmail(email, password);

      if (!user) {
        setError("⚠️ Invalid email or password.");
      } else {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      if (err.message.includes("403")) {
        setError("⚠️ Access Denied: Please check your permissions.");
      } else if (err.message.includes("401")) {
        setError("⚠️ Unauthorized: Invalid email or password.");
      } else {
        setError("❌ Unexpected error. Please try again.");
      }
    } finally {
      setLoading(false); // Re-enable the login button
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

        {/* Redirects to Crystal's website */}
        <button className="back-button" onClick={() => window.location.href = "https://www.crystalthedeveloper.ca/"}>
          🔙 Back to Home
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;