import { useEffect, useState } from "react";
import { authService } from "../services/authService";

interface LogoutDetectionResult {
  isLoggedOut: boolean;
}

export function useLogoutDetection(
  userId?: string,
  intervalMs = 30000,
): LogoutDetectionResult {
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsLoggedOut(false);
      return;
    }

    let isMounted = true;

    const checkSession = async () => {
      const activeToken = authService.getActiveToken();
      if (!activeToken) {
        if (isMounted) {
          setIsLoggedOut(true);
        }
        return;
      }

      const result = await authService.checkAuth();
      if (isMounted) {
        setIsLoggedOut(!result.valid);
      }
    };

    void checkSession();
    const intervalId = window.setInterval(() => {
      void checkSession();
    }, intervalMs);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [intervalMs, userId]);

  return { isLoggedOut };
}
