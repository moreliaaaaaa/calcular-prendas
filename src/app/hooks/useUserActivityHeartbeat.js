import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/services";

export function useUserActivityHeartbeat({ authReady, displayName, user }) {
  const activityTimerRef = useRef(null);

  const recordUserActivity = useCallback(
    async ({ activeSeconds = 0, boost = 1 } = {}) => {
      if (!supabase || !user) return;

      const { error } = await supabase.rpc("record_user_activity", {
        p_display_name: displayName,
        p_email: user.email || "",
        p_active_seconds: activeSeconds,
        p_activity_boost: boost,
      });

      if (error) {
        console.error("No se pudo registrar la actividad del usuario:", error);
      }
    },
    [displayName, user],
  );

  useEffect(() => {
    if (!supabase || !user || !authReady) return undefined;

    let cancelled = false;
    const heartbeatMs = 30000;

    const bump = async (activeSeconds = 0, boost = 1) => {
      if (cancelled) return;
      await recordUserActivity({ activeSeconds, boost });
    };

    const heartbeat = () => {
      if (document.visibilityState === "hidden") return;
      void bump(heartbeatMs / 1000, 1);
    };

    void bump(0, 1);

    activityTimerRef.current = window.setInterval(heartbeat, heartbeatMs);
    document.addEventListener("visibilitychange", heartbeat);
    window.addEventListener("focus", heartbeat);
    window.addEventListener("pagehide", heartbeat);

    return () => {
      cancelled = true;
      window.clearInterval(activityTimerRef.current);
      activityTimerRef.current = null;
      document.removeEventListener("visibilitychange", heartbeat);
      window.removeEventListener("focus", heartbeat);
      window.removeEventListener("pagehide", heartbeat);
    };
  }, [authReady, recordUserActivity, user]);
}
