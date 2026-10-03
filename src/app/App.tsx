import { useEffect, useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import { BackgroundWrapper } from "./components/BackgroundWrapper";
import { Toaster } from "sonner";
import { apiFetch, AUTH_EXPIRED_EVENT, expireSession } from "./lib/api";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const handleExpired = () => setIsLoggedIn(false);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);

    const validateSession = async () => {
      const token = sessionStorage.getItem("token");
      const storedUser = sessionStorage.getItem("user");
      if (!token || !storedUser) {
        expireSession();
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        if (user.roleCode !== "ADMIN") throw new Error("Not an admin");
        await apiFetch("/api/user");
        if (sessionStorage.getItem("token") === token) setIsLoggedIn(true);
      } catch {
        expireSession(token);
      }
    };

    validateSession();
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem("token");
    try {
      await apiFetch("/api/auth/logout", { method: "POST", timeoutMs: 3000 });
    } catch {
      // Clear the local session even if the server is unreachable.
    } finally {
      expireSession(token);
    }
  };

  if (isLoggedIn === null) {
    return <BackgroundWrapper><div className="min-h-screen" /></BackgroundWrapper>;
  }

  return (
    <BackgroundWrapper>
      <Toaster theme="dark" position="top-right" />
      {isLoggedIn ? (
        <AdminLayout onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </BackgroundWrapper>
  );
}
