import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SUPABASE_CONFIG } from "@/config";
import { supabase } from "@/services";
import {
  clone,
  loadLocalStateCandidates,
  mergeStates,
  normalizeState,
  saveLocalState,
  touchState,
} from "@/shared/lib/store.js";

export function useRemoteStateSync({ authReady, requiresAuth, user }) {
  const [state, setState] = useState(null);
  const [syncStatus, setSyncStatus] = useState({
    status: "Modo local",
    room: "Datos guardados en este dispositivo",
    enabled: false,
    state: "ready",
  });

  const channelRef = useRef(null);
  const remoteApplyingRef = useRef(false);
  const lastSerializedRef = useRef("");
  const saveTimerRef = useRef(null);

  const active = useMemo(() => {
    if (!state) return null;
    return (
      state.operations.find((operation) => operation.id === state.activeId) ||
      state.operations[0] ||
      null
    );
  }, [state]);

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

      const normalized = normalizeState(nextState);
      const serialized = JSON.stringify(normalized);
      if (!force && serialized === lastSerializedRef.current) return;

      const { error } = await supabase.from(SUPABASE_CONFIG.table).upsert(
        {
          id: user?.id || "guest",
          payload: normalized,
          updated_at: normalized.updatedAt,
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("Error al guardar en Supabase:", error);
        setSyncStatus((current) => ({
          ...current,
          status: "Error de conexión con Supabase",
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
        const normalized = touchState(normalizeState(draft));
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
    setState(null);
    lastSerializedRef.current = "";
  }, [user?.id]);

  useEffect(() => {
    if (!authReady) {
      updateSyncStatus(false);
      return undefined;
    }

    let cancelled = false;

    const boot = async () => {
      const localState = loadLocalStateCandidates(user).reduce(
        (merged, candidate) => mergeStates(merged, candidate),
        null,
      );
      let nextState = localState || normalizeState(null);

      saveLocalState(user, nextState);
      if (!cancelled) setState(nextState);
      updateSyncStatus(false);

      if (!supabase) return;
      if (requiresAuth && !user) return;

      const accountId = user?.id || "guest";
      const { data, error } = await supabase
        .from(SUPABASE_CONFIG.table)
        .select("payload, updated_at")
        .eq("id", accountId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Error al cargar datos de Supabase:", error);
        setSyncStatus((current) => ({
          ...current,
          status: "Error de conexión con Supabase",
          state: "error",
        }));
        return;
      }

      if (data?.payload) {
        const remoteState = normalizeState({
          ...data.payload,
          updatedAt: data.payload.updatedAt || data.updated_at,
        });
        nextState = mergeStates(remoteState, localState);
        saveLocalState(user, nextState);
        setState(nextState);

        if (JSON.stringify(nextState) !== JSON.stringify(remoteState)) {
          await persistRemote(nextState, true);
        }
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

              setState((current) => {
                const normalized = normalizeState(remoteState);
                const merged = mergeStates(normalized, current);
                const incoming = JSON.stringify(merged);
                if (incoming === lastSerializedRef.current) return current;

                remoteApplyingRef.current = true;
                lastSerializedRef.current = incoming;
                saveLocalState(user, merged);
                remoteApplyingRef.current = false;

                if (JSON.stringify(merged) !== JSON.stringify(normalized)) {
                  void persistRemote(merged, true);
                }

                return merged;
              });
            },
          )
          .subscribe();
      }
    };

    boot();

    return () => {
      cancelled = true;
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [authReady, persistRemote, requiresAuth, updateSyncStatus, user]);

  useEffect(() => {
    return () => window.clearTimeout(saveTimerRef.current);
  }, []);

  return {
    state,
    active,
    syncStatus,
    saveState,
    persistRemote,
  };
}
