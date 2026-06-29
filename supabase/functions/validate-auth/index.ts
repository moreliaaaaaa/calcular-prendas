import { serve } from "https://deno.land/std@0.205.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    if (name.length > 100) {
      return "El nombre no puede exceder los 100 caracteres.";
    }
    if (!/^[a-zA-ZÃ¡Ã©Ã­Ã³ÃºÃ¼Ã±ÃÃ‰ÃÃ“ÃšÃœÃ‘\s'-]+$/.test(name)) {
      return "El nombre solo puede contener letras, espacios, apÃ³strofes y guiones.";
    }
  }

  if (mode === "recover") {
    if (!email) return "Escribe tu correo electrÃ³nico para enviarte el enlace.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Ingresa un correo electrÃ³nico vÃ¡lido.";
    }
    if (email.length > 254) return "El correo electrÃ³nico es demasiado largo.";
    return "";
  }

  if (!email || !password) {
    return "Completa el correo electrÃ³nico y la contraseÃ±a.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Ingresa un correo electrÃ³nico vÃ¡lido.";
  }

  if (email.length > 254) {
    return "El correo electrÃ³nico es demasiado largo.";
  }

  if (password.length < 6) {
    return "La contraseÃ±a debe tener al menos 6 caracteres.";
  }

  if (password.length > 128) {
    return "La contraseÃ±a no puede exceder los 128 caracteres.";
  }

  if (mode === "signup") {
    if (/\s/.test(password)) {
      return "La contraseÃ±a no puede contener espacios.";
    }

    if (!/[A-Z]/.test(password)) {
      return "La contraseÃ±a debe incluir al menos una letra mayÃºscula.";
    }

    if (!/[a-z]/.test(password)) {
      return "La contraseÃ±a debe incluir al menos una letra minÃºscula.";
    }

    if (!/[0-9]/.test(password)) {
      return "La contraseÃ±a debe incluir al menos un nÃºmero.";
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return "La contraseÃ±a debe incluir al menos un carÃ¡cter especial (!@#$%, etc.).";
    }
  }

  return "";
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "MÃ©todo no permitido." }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  let body;
  try {
    const contentType = request.headers.get("content-type") || "";
    body = contentType.includes("application/json")
      ? await request.json()
      : JSON.parse(await request.text());
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo JSON invÃ¡lido." }), {
      status: 400,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const { form = {}, mode = "login" } = body;
  const error = validateAuthForm(form, mode);
  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 400,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});
