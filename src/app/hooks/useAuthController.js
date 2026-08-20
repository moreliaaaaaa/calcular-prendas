import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCountryConfig,
  getUiText,
  showAuthError,
  validateAuthForm,
  validateAuthFormServer,
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
  const t = useCallback((key, value) => getUiText(key, value || user), [user]);

  const validateForm = useCallback(async (form, mode) => {
    return validateAuthForm(form, mode) || validateAuthFormServer(form, mode);
  }, []);

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
        setAuthMessage(getUiText("authSessionRequired", sessionUser));
      }
    };

    init();

    if (!supabase) return undefined;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      setUser(nextUser);
      setAuthReady(!requiresAuth || Boolean(nextUser));

      if (!nextUser && requiresAuth) {
        setAuthMessage(getUiText("authSessionClosed", nextUser));
      }
    });

    return () => data.subscription.unsubscribe();
  }, [requiresAuth]);

  const login = useCallback(async (form, clear) => {
    if (!supabase) return;

    const validation = await validateForm(form, "login");
    if (validation) {
      setAuthMessage(validation);
      setAuthMessageType("error");
      return;
    }

    setAuthLoading(true);
    setAuthMessage(t("authLoginLoading", form.country));
    setAuthMessageType("");

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    setAuthLoading(false);

    if (error) {
      setAuthMessage(showAuthError(error, form.country));
      setAuthMessageType("error");
      return;
    }

    clear();
    setAuthMessage(t("authLoginSuccess", form.country));
    setAuthMessageType("success");
  }, [t, validateForm]);

  const signup = useCallback(async (form, clear) => {
    if (!supabase) return;

    const validation = await validateForm(form, "signup");
    if (validation) {
      setAuthMessage(validation);
      setAuthMessageType("error");
      return;
    }

    setAuthLoading(true);
    setAuthMessage(t("authSignupLoading", form.country));
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
      setAuthMessage(showAuthError(error, countryConfig.code));
      setAuthMessageType("error");
      return;
    }

    clear();
    setAuthMessage(
      data.session?.user
        ? t("authSignupSuccessLoggedIn", countryConfig.code)
        : t("authSignupSuccessConfirm", countryConfig.code),
    );
    setAuthMessageType("success");
  }, [t, validateForm]);

  const recoverPassword = useCallback(async (form, clear) => {
    if (!supabase) return;

    const validation = await validateForm(form, "recover");
    if (validation) {
      setAuthMessage(validation);
      setAuthMessageType("error");
      return;
    }

    setAuthLoading(true);
    setAuthMessage(t("authRecoverLoading", form.country));
    setAuthMessageType("");

    const redirectTo = `${window.location.origin}${window.location.pathname}?reset-password=true`;
    const { error } = await supabase.auth.resetPasswordForEmail(
      form.email.trim(),
      { redirectTo },
    );

    setAuthLoading(false);

    if (error) {
      setAuthMessage(showAuthError(error, form.country));
      setAuthMessageType("error");
      return;
    }

    clear?.();
    setAuthMessage(t("authRecoverSuccess", form.country));
    setAuthMessageType("success");
  }, [t, validateForm]);

  const updateDisplayName = useCallback(
    async (name) => {
      if (!supabase || !user) return;

      const clean = name.trim();
      if (!clean) {
        showToast(t("authNameEmpty"), "error");
        return;
      }

      const { data, error } = await supabase.auth.updateUser({
        data: { name: clean, full_name: clean },
      });

      if (error) {
        showToast(t("authNameSaveError"), "error");
        return;
      }

      setUser(data.user || user);
      showToast(t("authNameSaved"), "success");
    },
    [showToast, t, user],
  );

  const logout = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) showToast(t("authLogoutError"), "error");
  }, [showToast, t]);

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
