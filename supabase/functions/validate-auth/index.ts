import { serve } from "https://deno.land/std@0.205.0/http/server.ts";

function validateAuthForm(
  form: { name?: string; email?: string; password?: string },
  mode: string,
) {
  const email = (form.email || "").trim();
  const password = form.password || "";
  const name = (form.name || "").trim();

  if (mode === "signup") {
    if (!name) return "Escribe tu nombre para registrarte.";
    if (name.length < 2) return "El nombre debe tener al menos 2 caracteres.";
    if (name.length > 100)
      return "El nombre no puede exceder los 100 caracteres.";
    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'-]+$/.test(name)) {
      return "El nombre solo puede contener letras, espacios, apóstrofes y guiones.";
    }
  }

  if (mode === "recover") {
    if (!email) return "Escribe tu correo electrónico para enviarte el enlace.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Ingresa un correo electrónico válido.";
    }
    if (email.length > 254) return "El correo electrónico es demasiado largo.";
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

serve(async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido." }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo JSON inválido." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const error = validateAuthForm(body, body.mode || "login");
  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
