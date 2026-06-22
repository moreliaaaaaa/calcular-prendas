import { supabase } from "@/services";

export function validateAuthForm(form, mode) {
  const email = (form.email || "").trim();
  const password = form.password || "";
  const name = (form.name || "").trim();

  if (mode === "signup") {
    if (!name) {
      return "Escribe tu nombre para registrarte.";
    }

    if (name.length < 2) {
      return "El nombre debe tener al menos 2 caracteres.";
    }

    if (name.length > 100) {
      return "El nombre no puede exceder los 100 caracteres.";
    }

    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'-]+$/.test(name)) {
      return "El nombre solo puede contener letras, espacios, apóstrofes y guiones.";
    }
  }

  if (mode === "recover") {
    if (!email) {
      return "Escribe tu correo electrónico para enviarte el enlace.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Ingresa un correo electrónico válido.";
    }

    if (email.length > 254) {
      return "El correo electrónico es demasiado largo.";
    }

    return "";
  }

  if (!email || !password) {
    return "Completa el correo electrónico y la contraseña.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Ingresa un correo electrónico válido.";
  }

  if (email.length > 254) {
    return "El correo electrónico es demasiado largo.";
  }

  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  if (password.length > 128) {
    return "La contraseña no puede exceder los 128 caracteres.";
  }

  if (mode === "signup") {
    if (/\s/.test(password)) {
      return "La contraseña no puede contener espacios.";
    }

    if (!/[A-Z]/.test(password)) {
      return "La contraseña debe incluir al menos una letra mayúscula.";
    }

    if (!/[a-z]/.test(password)) {
      return "La contraseña debe incluir al menos una letra minúscula.";
    }

    if (!/[0-9]/.test(password)) {
      return "La contraseña debe incluir al menos un número.";
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return "La contraseña debe incluir al menos un carácter especial (!@#$%, etc.).";
    }
  }

  return "";
}

export async function validateAuthFormServer(form, mode) {
  if (!supabase) return "";

  const body = JSON.stringify({ form, mode });
  const { data, error } = await supabase.functions.invoke("validate-auth", {
    body,
  });

  if (error) {
    if (error.message?.includes("not found")) return "";
    return "Error de validación del servidor. Inténtalo de nuevo.";
  }

  let result = data;

  if (data instanceof Uint8Array) {
    try {
      result = JSON.parse(new TextDecoder().decode(data));
    } catch {
      result = null;
    }
  }

  if (result && typeof result === "object" && "error" in result) {
    return result.error || "Error de validación del servidor.";
  }

  return "";
}

export function showAuthError(error) {
  const message = error?.message || "";

  if (message.includes("Invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }

  if (message.includes("User already registered")) {
    return "Este correo ya está registrado.";
  }

  if (message.includes("Email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesión.";
  }

  if (message.includes("Password")) {
    return "La contraseña no cumple los requisitos mínimos.";
  }

  return "Ocurrió un error. Inténtalo nuevamente.";
}
