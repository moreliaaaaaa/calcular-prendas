import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCalculatorActions } from "@/app/hooks/useCalculatorActions.js";
import { validateAuthForm, showAuthError } from "@/app/lib/auth.js";
import { SUPABASE_CONFIG } from "@/config";
import { supabase } from "@/services";
import { useTheme } from "@/shared";
import {
  DEFAULT_SECTION_TITLES,
  clone,
  createFabricBlock,
  createFabricPurchase,
  createOperation,
  createSection,
  fabricPurchaseDisplayName,
  loadLocalState,
  normalizeState,
  saveLocalState,
  shouldRequireAuth,
} from "@/shared/lib/store.js";

export function useAppController() {
  const [theme, setTheme] = useTheme();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!supabase || !shouldRequireAuth());
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [state, setState] = useState(null);
  const [activeView, setActiveView] = useState("garments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [adminActivity, setAdminActivity] = useState([]);
  const [adminActivityLoading, setAdminActivityLoading] = useState(false);
  const [adminActivityError, setAdminActivityError] = useState("");
  const [adminActivityUpdatedAt, setAdminActivityUpdatedAt] = useState("");
  const [syncStatus, setSyncStatus] = useState({
    status: "Modo local",
    room: "Datos guardados en este dispositivo",
    enabled: false,
    state: "ready",
  });
  const [installPrompt, setInstallPrompt] = useState(null);

  const channelRef = useRef(null);
  const remoteApplyingRef = useRef(false);
  const lastSerializedRef = useRef("");
  const saveTimerRef = useRef(null);
  const activityTimerRef = useRef(null);

  const requiresAuth = Boolean(supabase && shouldRequireAuth());
  const isAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase() || "";
    const adminEmails = (SUPABASE_CONFIG.adminEmails || []).map((item) =>
      item.toLowerCase(),
    );

    return Boolean(
      user &&
      (user?.app_metadata?.role === "admin" || adminEmails.includes(email)),
    );
  }, [user]);

  const active = useMemo(() => {
    if (!state) return null;
    return (
      state.operations.find((operation) => operation.id === state.activeId) ||
      state.operations[0] ||
      null
    );
  }, [state]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const displayName = useMemo(() => {
    if (!requiresAuth) return "Modo local";

    const email = user?.email || "";
    return (
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      email.split("@")[0] ||
      "Modo local"
    );
  }, [requiresAuth, user]);

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
      .limit(10);

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

  const updateSyncStatus = useCallback(
    (ready = false) => {
      if (!supabase) {
        setSyncStatus({
          status: "Modo local",
          room: "Datos guardados en este dispositivo",
          enabled: false,
          state: "ready",
        });
        return;
      }

      if (requiresAuth && !user) {
        setSyncStatus({
          status: "Acceso requerido",
          room: "Inicia sesión para cargar tus datos",
          enabled: false,
          state: "pending",
        });
        return;
      }

      setSyncStatus({
        status: ready
          ? "Conectado con Supabase"
          : "Supabase configurado, pendiente de conexión",
        room: `Cuenta privada: ${user?.email || "sin correo"}`,
        enabled: true,
        state: ready ? "ready" : "pending",
      });
    },
    [requiresAuth, user],
  );

  const persistRemote = useCallback(
    async (nextState, force = false) => {
      if (!supabase || remoteApplyingRef.current) return;
      if (requiresAuth && !user) return;

      const serialized = JSON.stringify(nextState);
      if (!force && serialized === lastSerializedRef.current) return;

      const { error } = await supabase.from(SUPABASE_CONFIG.table).upsert(
        {
          id: user?.id || "guest",
          payload: nextState,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("Error al guardar en Supabase:", error);
        setSyncStatus((current) => ({
          ...current,
          status: "Error de conexion con Supabase",
          state: "error",
        }));
        return;
      }

      lastSerializedRef.current = serialized;
    },
    [requiresAuth, user],
  );

  const saveState = useCallback(
    (producer, options = {}) => {
      setState((current) => {
        const base = current || normalizeState(null);
        const draft = clone(base);
        producer(draft);
        const normalized = normalizeState(draft);
        saveLocalState(user, normalized);
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = window.setTimeout(
          () => persistRemote(normalized, options.force),
          500,
        );
        return normalized;
      });
    },
    [persistRemote, user],
  );

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setUser(null);
        setAuthReady(true);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("No se pudo leer la sesion de Supabase:", error);

      const sessionUser = data.session?.user || null;
      setUser(sessionUser);
      setAuthReady(!requiresAuth || Boolean(sessionUser));

      if (requiresAuth && !sessionUser) {
        setAuthMessage("Inicia sesión o regístrate para acceder a tus datos.");
      }
    };

    init();

    if (!supabase) return undefined;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      setUser(nextUser);
      setAuthReady(!requiresAuth || Boolean(nextUser));
      setState(null);

      if (!nextUser && requiresAuth) {
        setAuthMessage("La sesión se cerró. Vuelve a iniciar sesión.");
      }
    });

    return () => data.subscription.unsubscribe();
  }, [requiresAuth]);

  useEffect(() => {
    if (!authReady) {
      updateSyncStatus(false);
      return;
    }

    const boot = async () => {
      let nextState = normalizeState(loadLocalState(user));
      saveLocalState(user, nextState);
      setState(nextState);
      updateSyncStatus(false);

      if (!supabase) return;
      if (requiresAuth && !user) return;

      const accountId = user?.id || "guest";
      const { data, error } = await supabase
        .from(SUPABASE_CONFIG.table)
        .select("payload")
        .eq("id", accountId)
        .maybeSingle();

      if (error) {
        console.error("Error al cargar datos de Supabase:", error);
        setSyncStatus((current) => ({
          ...current,
          status: "Error de conexion con Supabase",
          state: "error",
        }));
        return;
      }

      if (data?.payload) {
        nextState = normalizeState(data.payload);
        saveLocalState(user, nextState);
        setState(nextState);
      } else {
        await persistRemote(nextState, true);
      }

      lastSerializedRef.current = JSON.stringify(nextState);
      updateSyncStatus(true);

      if (SUPABASE_CONFIG.enableRealtime) {
        channelRef.current?.unsubscribe();
        channelRef.current = supabase
          .channel(`private-account-${accountId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: SUPABASE_CONFIG.table,
              filter: `id=eq.${accountId}`,
            },
            (payload) => {
              const remoteState = payload.new?.payload;
              if (!remoteState) return;

              const normalized = normalizeState(remoteState);
              const incoming = JSON.stringify(normalized);
              if (incoming === lastSerializedRef.current) return;

              remoteApplyingRef.current = true;
              lastSerializedRef.current = incoming;
              saveLocalState(user, normalized);
              setState(normalized);
              remoteApplyingRef.current = false;
            },
          )
          .subscribe();
      }
    };

    boot();

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [authReady, persistRemote, requiresAuth, updateSyncStatus, user]);

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
  }, [authReady, recordUserActivity, supabase, user]);

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

  useEffect(() => {
    const beforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const installed = () => {
      setInstallPrompt(null);
      showToast("Aplicacion instalada", "success");
    };

    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installed);

    if ("serviceWorker" in navigator) {
      if (import.meta.env.DEV) {
        // En desarrollo, desregistrar cualquier Service Worker y limpiar caches
        try {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((r) => r.unregister());
          });
        } catch (e) {
          console.log("No se pudo desregistrar Service Workers:", e);
        }

        try {
          if (window.caches && caches.keys) {
            caches
              .keys()
              .then((names) => Promise.all(names.map((n) => caches.delete(n))));
          }
        } catch (e) {
          console.log("No se pudieron limpiar caches:", e);
        }
      } else {
        navigator.serviceWorker
          .register("/service-worker.js")
          .catch((error) => {
            console.log("Error:", error);
          });
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", installed);
    };
  }, [showToast]);

  const login = async (form, clear) => {
    if (!supabase) return;

    const validation = validateAuthForm(form, "login");
    if (validation) {
      setAuthMessage(validation);
      setAuthMessageType("error");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("Iniciando sesión...");
    setAuthMessageType("");

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    setAuthLoading(false);

    if (error) {
      setAuthMessage(showAuthError(error));
      setAuthMessageType("error");
      return;
    }

    clear();
    setAuthMessage("Sesión iniciada correctamente.");
    setAuthMessageType("success");
  };

  const signup = async (form, clear) => {
    if (!supabase) return;

    const validation = validateAuthForm(form, "signup");
    if (validation) {
      setAuthMessage(validation);
      setAuthMessageType("error");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("Creando cuenta...");
    setAuthMessageType("");

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          name: form.name.trim(),
          full_name: form.name.trim(),
        },
      },
    });

    setAuthLoading(false);

    if (error) {
      setAuthMessage(showAuthError(error));
      setAuthMessageType("error");
      return;
    }

    clear();
    setAuthMessage(
      data.session?.user
        ? "Cuenta creada y sesión iniciada."
        : "Cuenta creada. Revisa tu correo para confirmar tu registro.",
    );
    setAuthMessageType("success");
  };

  const recoverPassword = async (form, clear) => {
    if (!supabase) return;

    const validation = validateAuthForm(form, "recover");
    if (validation) {
      setAuthMessage(validation);
      setAuthMessageType("error");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("Enviando correo de recuperación...");
    setAuthMessageType("");

    const redirectTo = `${window.location.origin}${window.location.pathname}?reset-password=true`;
    const { error } = await supabase.auth.resetPasswordForEmail(
      form.email.trim(),
      {
        redirectTo,
      },
    );

    setAuthLoading(false);

    if (error) {
      setAuthMessage(showAuthError(error));
      setAuthMessageType("error");
      return;
    }

    clear?.();
    setAuthMessage("Te enviamos un correo para recuperar tu contraseña.");
    setAuthMessageType("success");
  };

  const actions = useCalculatorActions({
    active,
    saveState,
    showToast,
    state,
    setActiveView,
    setMenuOpen,
  });

  const activeTitle = useMemo(() => {
    if (!active) return "";

    if (activeView === "fabric") {
      const fabric =
        active.fabricPurchases.find(
          (item) => item.id === active.activeFabricId,
        ) || active.fabricPurchases[0];
      return fabric ? fabricPurchaseDisplayName(fabric) : "Compra de telas";
    }

    return active.name;
  }, [active, activeView]);

  const addSectionOrBlock = () => {
    if (activeView === "fabric") {
      saveState((draft) => {
        const operation =
          draft.operations.find((item) => item.id === draft.activeId) ||
          draft.operations[0];
        const fabric =
          operation.fabricPurchases.find(
            (item) => item.id === operation.activeFabricId,
          ) || operation.fabricPurchases[0];
        fabric.blocks.push(createFabricBlock(fabric.blocks.length));
      });
      showToast("Bloque de telas agregado", "success");
      return;
    }

    saveState((draft) => {
      const operation =
        draft.operations.find((item) => item.id === draft.activeId) ||
        draft.operations[0];
      operation.sections.push(
        createSection(
          `${DEFAULT_SECTION_TITLES.generic} ${operation.sections.length + 1}`,
        ),
      );
    });
    showToast("Bloque agregado", "success");
  };

  const createNew = () => {
    if (activeView === "fabric") {
      saveState((draft) => {
        const operation =
          draft.operations.find((item) => item.id === draft.activeId) ||
          draft.operations[0];
        const fabric = createFabricPurchase(operation.fabricPurchases.length);
        operation.fabricPurchases.push(fabric);
        operation.activeFabricId = fabric.id;
      });
      showToast("Compra de telas creada", "success");
      return;
    }

    saveState((draft) => {
      const operation = createOperation(null, {
        kids: [{ size: "", qty: 0, price: 0, priceManual: false }],
        adults: [{ size: "", qty: 0, price: 0, priceManual: false }],
      });
      draft.operations.push(operation);
      draft.activeId = operation.id;
    });
    showToast("Operacion creada", "success");
  };

  const updateDisplayName = async (name) => {
    if (!supabase || !user) return;

    const clean = name.trim();
    if (!clean) {
      showToast("Escribe un nombre", "error");
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { name: clean, full_name: clean },
    });

    if (error) {
      showToast("No se pudo guardar el nombre", "error");
      return;
    }

    setUser(data.user || user);
    showToast("Nombre actualizado", "success");
  };

  const logout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) showToast("No se pudo cerrar sesión", "error");
  };

  const syncNow = useCallback(() => {
    if (!state) return;
    void persistRemote(state, true);
    showToast("Sincronizacion solicitada", "success");
  }, [persistRemote, showToast, state]);

  const installApp = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }, [installPrompt]);

  return {
    theme,
    setTheme,
    user,
    authReady,
    authMessage,
    authMessageType,
    authLoading,
    state,
    active,
    activeView,
    activeTitle,
    requiresAuth,
    displayName,
    isAdmin,
    menuOpen,
    settingsOpen,
    toast,
    adminActivity,
    adminActivityLoading,
    adminActivityError,
    adminActivityUpdatedAt,
    syncStatus,
    installPrompt,
    actions,
    persistRemote,
    showToast,
    login,
    signup,
    recoverPassword,
    addSectionOrBlock,
    createNew,
    updateDisplayName,
    logout,
    syncNow,
    installApp,
    setMenuOpen,
    setSettingsOpen,
    setActiveView,
  };
}
