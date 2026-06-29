import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8080";
const CHECK_INTERVAL = 10000;

export function useBackendStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/user`, {
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
