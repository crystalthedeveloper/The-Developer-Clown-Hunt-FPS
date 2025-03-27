// App.tsx

import { useState, useEffect } from "react";
import WelcomeScreen from "./components/WelcomeScreen";
import LoginScreen from "./components/LoginScreen";
import GameCanvas from "./components/GameCanvas";
import { SupabaseAuth } from "./store/SupabaseAuth";
import { getUserName } from "./store/supabaseHelpers"; // 👈 Import the helper
import "./App.css";

// ✅ Define a simplified type
interface User {
  id: string;
  fullName: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const loggedInUser = await SupabaseAuth.getUser();
      if (loggedInUser) {
        const fullName = await getUserName(); // ✅ Get name from users_access table
        setUser({
          id: loggedInUser.id,
          fullName: fullName || "Player",
        });
      }
      setLoading(false);
    }

    fetchUser();
  }, []);

  // ✅ Prevent zooming on touch and gestures
  useEffect(() => {
    const preventZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };
    const preventGestureZoom = (event: Event) => event.preventDefault();

    document.addEventListener("touchstart", preventZoom, { passive: false });
    document.addEventListener("gesturestart", preventGestureZoom);
    document.addEventListener("gesturechange", preventGestureZoom);
    document.addEventListener("gestureend", preventGestureZoom);

    return () => {
      document.removeEventListener("touchstart", preventZoom);
      document.removeEventListener("gesturestart", preventGestureZoom);
      document.removeEventListener("gesturechange", preventGestureZoom);
      document.removeEventListener("gestureend", preventGestureZoom);
    };
  }, []);

  if (loading) return null;

  if (!user) {
    return <LoginScreen onLoginSuccess={() => window.location.reload()} />;
  }

  return (
    <>
      {!gameStarted && (
        <WelcomeScreen userName={user.fullName} onStart={() => setGameStarted(true)} />
      )}
      {gameStarted && <GameCanvas />}
    </>
  );
}

export default App;