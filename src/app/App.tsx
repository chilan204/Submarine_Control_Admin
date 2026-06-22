import { useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import { BackgroundWrapper } from "./components/BackgroundWrapper";
import { Toaster } from "sonner";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] =
    useState<boolean>(
      !!sessionStorage.getItem("token")
    );

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setIsLoggedIn(false);
  };

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