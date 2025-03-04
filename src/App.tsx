// App.tsx

import { useState, useEffect } from "react";
import WelcomeScreen from "./components/WelcomeScreen";
import LoginScreen from "./components/LoginScreen";
import GameCanvas from "./components/GameCanvas"; // ✅ New component for rendering the game
import { SupabaseAuth } from "./store/SupabaseAuth";
import "./App.css";

// ✅ Define a type for the user object
interface User {
  id: string;
  fullName: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  confirmation_sent_at?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const loggedInUser = await SupabaseAuth.getUser();
      if (loggedInUser) {
        setUser({
          id: loggedInUser.id,
          fullName: loggedInUser.user_metadata?.full_name || "Player", // ✅ Ensure fullName is set
          app_metadata: loggedInUser.app_metadata,
          user_metadata: loggedInUser.user_metadata,
          aud: loggedInUser.aud,
          confirmation_sent_at: loggedInUser.confirmation_sent_at,
        });
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  // ✅ Show LoginScreen if user is not authenticated
  if (!user) {
    return <LoginScreen onLoginSuccess={setUser} />;
  }

  return (
    <>
      {!gameStarted && !loading && <WelcomeScreen onStart={() => setGameStarted(true)} userName={user.fullName} />}
      {gameStarted && <GameCanvas />}
    </>
  );
}

export default App;