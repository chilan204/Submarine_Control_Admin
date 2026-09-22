import { useState, useEffect } from "react";
import { API_BASE_URL } from "../lib/api";

const CHECK_INTERVAL = 10000;

export function useBackendStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/ping`, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
        });
        if (mounted) setIsOnline(res.ok);
      } catch {
        if (mounted) setIsOnline(false);
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return isOnline;
}
