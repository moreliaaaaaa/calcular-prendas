import { DEFAULT_COUNTRY_CODE } from "./config.js";
import { getUiText } from "./texts.js";

// Traduce errores tecnicos de Supabase a mensajes claros para mostrar en la interfaz.
export function showAuthError(error, countryCode = DEFAULT_COUNTRY_CODE) {
  const message = error?.message || "";
  const t = (key, fallback) => getUiText(key, countryCode) || fallback;

  if (message.includes("Invalid login credentials")) {
    return t("authLoginError", "Correo o contraseña incorrectos.");
  }

  if (message.includes("User already registered")) {
    return t("authEmailTaken", "Este correo ya está registrado.");
  }

  if (message.includes("Email not confirmed")) {
    return t("authEmailConfirm", "Debes confirmar tu correo antes de iniciar sesión.");
  }

  if (message.includes("Password")) {
    return t("authPasswordRule", "La contraseña no cumple los requisitos mínimos.");
  }

  return t("authGenericError", "Ocurrió un error. Inténtalo nuevamente.");
}
