import { useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import { BackgroundWrapper } from "./components/BackgroundWrapper";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] =
    useState<boolean>(
      !!localStorage.getItem("token")
    );

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
  };

  return (
    <BackgroundWrapper>
      {isLoggedIn ? (
        <AdminLayout onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </BackgroundWrapper>
  );
}