import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCountryConfig,
  showAuthError,
  validateAuthForm,
} from "@/app/lib/auth.js";
import { supabase } from "@/services";
import { shouldRequireAuth } from "@/shared/lib/store.js";

export function useAuthController({ showToast }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!supabase || !shouldRequireAuth());
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const requiresAuth = Boolean(supabase && shouldRequireAuth());

  const isAdmin = useMemo(() => {
    return Boolean(user && user?.app_metadata?.role === "admin");
  }, [user]);

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

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setUser(null);
        setAuthReady(true);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("No se pudo leer la sesión de Supabase:", error);

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

      if (!nextUser && requiresAuth) {
        setAuthMessage("La sesión se cerró. Vuelve a iniciar sesión.");
      }
    });

    return () => data.subscription.unsubscribe();
  }, [requiresAuth]);

  const login = useCallback(async (form, clear) => {
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
    setAuthMessage("Sesion iniciada correctamente.");
    setAuthMessageType("success");
  }, []);

  const signup = useCallback(async (form, clear) => {
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

    const countryConfig = getCountryConfig(form.country);

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          name: form.name.trim(),
          full_name: form.name.trim(),
          country: countryConfig.code,
          country_name: countryConfig.label,
          currency: countryConfig.currency,
          language: countryConfig.language,
          locale: countryConfig.locale,
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
  }, []);

  const recoverPassword = useCallback(async (form, clear) => {
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
      { redirectTo },
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
  }, []);

  const updateDisplayName = useCallback(
    async (name) => {
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
    },
    [showToast, user],
  );

  const logout = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) showToast("No se pudo cerrar sesión", "error");
  }, [showToast]);

  return {
    user,
    authReady,
    authMessage,
    authMessageType,
    authLoading,
    requiresAuth,
    displayName,
    isAdmin,
    login,
    signup,
    recoverPassword,
    updateDisplayName,
    logout,
  };
}
