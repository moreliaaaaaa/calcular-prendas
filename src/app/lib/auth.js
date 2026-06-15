export function validateAuthForm(form, mode) {
  const email = form.email.trim();
  const password = form.password;

  if (mode === "signup" && !form.name.trim()) {
    return "Escribe tu nombre para registrarte.";
  }

  if (mode === "recover") {
    if (!email) {
      return "Escribe tu correo electrónico para enviarte el enlace.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Ingresa un correo electrónico válido.";
    }

    return "";
  }

  if (!email || !password) {
    return "Completa el correo electrónico y la contraseña.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Ingresa un correo electrónico válido.";
  }

  if (mode === "signup" && password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
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
