const env = import.meta.env;

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === "true" || value === true;
}

export const SUPABASE_CONFIG = {
  url: env.VITE_SUPABASE_URL || "",
  anonKey: env.VITE_SUPABASE_ANON_KEY || "",
  table: "shared_states",
  activityTable: "user_activity",
  useAuth: parseBoolean(env.VITE_USE_AUTH, true),
  enableRealtime: parseBoolean(env.VITE_ENABLE_REALTIME, true),
};
