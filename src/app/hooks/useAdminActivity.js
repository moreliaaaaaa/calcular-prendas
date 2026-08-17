import { useCallback, useEffect, useState } from "react";
import { SUPABASE_CONFIG } from "@/config";
import { supabase } from "@/services";

export function useAdminActivity({ authReady, isAdmin }) {
  const [adminActivity, setAdminActivity] = useState([]);
  const [adminActivityLoading, setAdminActivityLoading] = useState(false);
  const [adminActivityError, setAdminActivityError] = useState("");
  const [adminActivityUpdatedAt, setAdminActivityUpdatedAt] = useState("");

  const loadAdminActivity = useCallback(async () => {
    if (!supabase || !isAdmin) return;

    setAdminActivityLoading(true);
    setAdminActivityError("");

    const { data, error } = await supabase
      .from(SUPABASE_CONFIG.activityTable)
      .select(
        "user_id,email,display_name,activity_score,active_seconds,last_seen_at,last_activity_at,updated_at",
      )
      .order("activity_score", { ascending: false })
      .order("last_activity_at", { ascending: false })
      .limit(100);

    if (error) {
      setAdminActivity([]);
      setAdminActivityError(
        "No se pudo cargar el ranking. Revisa la migración de actividad.",
      );
      console.error("Error al cargar el ranking de actividad:", error);
      setAdminActivityLoading(false);
      return;
    }

    setAdminActivity(data || []);
    setAdminActivityUpdatedAt(new Date().toLocaleString());
    setAdminActivityLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !authReady) {
      setAdminActivity([]);
      setAdminActivityError("");
      setAdminActivityLoading(false);
      return undefined;
    }

    void loadAdminActivity();
    const interval = window.setInterval(() => {
      void loadAdminActivity();
    }, 20000);

    return () => window.clearInterval(interval);
  }, [authReady, isAdmin, loadAdminActivity]);

  return {
    adminActivity,
    adminActivityLoading,
    adminActivityError,
    adminActivityUpdatedAt,
    loadAdminActivity,
  };
}
