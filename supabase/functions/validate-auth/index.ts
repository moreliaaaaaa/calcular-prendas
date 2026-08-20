import { serve } from "https://deno.land/std@0.205.0/http/server.ts";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const DEFAULT_COUNTRY_CODE = "CL";
const EMAIL_MAX_LENGTH = 254;
const NAME_MAX_LENGTH = 100;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 128;

const COUNTRY_LANGUAGES: Record<string, "es" | "pt"> = {
  AR: "es",
  BO: "es",
  BR: "pt",
  CL: "es",
  CO: "es",
  CR: "es",
  EC: "es",
  SV: "es",
  GT: "es",
  MX: "es",
  PA: "es",
  PY: "es",
  PE: "es",
  DO: "es",
  UY: "es",
  VE: "es",
};

const TEXTS = {
  es: {
    authNameRequired: "Escribe tu nombre para registrarte.",
    authNameMin: "El nombre debe tener al menos 2 caracteres.",
    authNameMax: "El nombre no puede exceder los 100 caracteres.",
    authNamePattern: "El nombre solo puede contener letras, espacios, apóstrofes y guiones.",
    authCountryRequired: "Selecciona un país para registrarte.",
    authCountryInvalid: "El país seleccionado no es válido.",
    authRecoverEmailRequired: "Escribe tu correo electrónico para enviarte el enlace.",
    authEmailRequired: "Completa el correo electrónico y la contraseña.",
    authEmailInvalid: "Ingresa un correo electrónico válido.",
    authEmailMax: "El correo electrónico es demasiado largo.",
    authPasswordMin: "La contraseña debe tener al menos 6 caracteres.",
    authPasswordMax: "La contraseña no puede exceder los 128 caracteres.",
    authPasswordSpaces: "La contraseña no puede contener espacios.",
    authPasswordUpper: "La contraseña debe incluir al menos una letra mayúscula.",
    authPasswordLower: "La contraseña debe incluir al menos una letra minúscula.",
    authPasswordNumber: "La contraseña debe incluir al menos un número.",
    authPasswordSpecial: "La contraseña debe incluir al menos un carácter especial (!@#$%, etc.).",
  },
  pt: {
    authNameRequired: "Escreva seu nome para se cadastrar.",
    authNameMin: "O nome deve ter pelo menos 2 caracteres.",
    authNameMax: "O nome não pode exceder 100 caracteres.",
    authNamePattern: "O nome só pode conter letras, espaços, apóstrofos e hífens.",
    authCountryRequired: "Selecione um país para se cadastrar.",
    authCountryInvalid: "O país selecionado não é válido.",
    authRecoverEmailRequired: "Informe seu e-mail para receber o link.",
    authEmailRequired: "Preencha o e-mail e a senha.",
    authEmailInvalid: "Insira um e-mail válido.",
    authEmailMax: "O e-mail é muito longo.",
    authPasswordMin: "A senha deve ter pelo menos 6 caracteres.",
    authPasswordMax: "A senha não pode exceder 128 caracteres.",
    authPasswordSpaces: "A senha não pode conter espaços.",
    authPasswordUpper: "A senha deve incluir pelo menos uma letra maiúscula.",
    authPasswordLower: "A senha deve incluir pelo menos uma letra minúscula.",
    authPasswordNumber: "A senha deve incluir pelo menos um número.",
    authPasswordSpecial: "A senha deve incluir pelo menos um caractere especial (!@#$%, etc.).",
  },
};

function getAllowedOrigins() {
  const configuredOrigins =
    Deno.env.get("VALIDATE_AUTH_ALLOWED_ORIGINS")
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) || [];

  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]);
}

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const headers = {
    "Vary": "Origin",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (origin && getAllowedOrigins().has(origin)) {
    return { ...headers, "Access-Control-Allow-Origin": origin };
  }

  return headers;
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || getAllowedOrigins().has(origin);
}

const jsonHeaders = {
  "content-type": "application/json",
};

function getLanguage(countryCode?: string) {
  const normalized = (countryCode || DEFAULT_COUNTRY_CODE).toUpperCase();
  return COUNTRY_LANGUAGES[normalized] || COUNTRY_LANGUAGES[DEFAULT_COUNTRY_CODE];
}

function getText(countryCode: string | undefined, key: keyof typeof TEXTS.es) {
  const language = getLanguage(countryCode);
  return TEXTS[language][key] || TEXTS.es[key];
}

function isCombiningMark(character: string) {
  const codePoint = character.codePointAt(0);
  return typeof codePoint === "number" && codePoint >= 0x0300 && codePoint <= 0x036f;
}

function isLetter(character: string) {
  return character.toLocaleLowerCase() !== character.toLocaleUpperCase();
}

function isValidNameCharacter(character: string) {
  return (
    character === " " ||
    character === "'" ||
    character === "’" ||
    character === "-" ||
    isCombiningMark(character) ||
    isLetter(character)
  );
}

function isValidName(name: string) {
  return [...name].every(isValidNameCharacter);
}

function hasUppercaseLetter(value: string) {
  return [...value].some((character) => {
    return isLetter(character) && character === character.toLocaleUpperCase();
  });
}

function hasLowercaseLetter(value: string) {
  return [...value].some((character) => {
    return isLetter(character) && character === character.toLocaleLowerCase();
  });
}

function validateAuthForm(
  form: { name?: string; email?: string; password?: string; country?: string },
  mode: string,
) {
  const email = (form.email || "").trim();
  const password = form.password || "";
  const name = (form.name || "").trim();
  const country = (form.country || "").trim().toUpperCase();
  const t = (key: keyof typeof TEXTS.es) => getText(country, key);

  if (mode === "signup") {
    if (!name) return t("authNameRequired");
    if (name.length < 2) return t("authNameMin");
    if (name.length > NAME_MAX_LENGTH) return t("authNameMax");
    if (!isValidName(name)) return t("authNamePattern");
    if (!country) return t("authCountryRequired");
    if (!(country in COUNTRY_LANGUAGES)) return t("authCountryInvalid");
  }

  if (mode === "recover") {
    if (!email) return t("authRecoverEmailRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t("authEmailInvalid");
    if (email.length > EMAIL_MAX_LENGTH) return t("authEmailMax");
    return "";
  }

  if (!email || !password) return t("authEmailRequired");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t("authEmailInvalid");
  if (email.length > EMAIL_MAX_LENGTH) return t("authEmailMax");
  if (password.length < PASSWORD_MIN_LENGTH) return t("authPasswordMin");
  if (password.length > PASSWORD_MAX_LENGTH) return t("authPasswordMax");

  if (mode === "signup") {
    if (/\s/.test(password)) return t("authPasswordSpaces");
    if (!hasUppercaseLetter(password)) return t("authPasswordUpper");
    if (!hasLowercaseLetter(password)) return t("authPasswordLower");
    if (!/[0-9]/.test(password)) return t("authPasswordNumber");
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return t("authPasswordSpecial");
    }
  }

  return "";
}

serve(async (request) => {
  const corsHeaders = getCorsHeaders(request);

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(request)) {
      return new Response("Origen no permitido.", {
        status: 403,
        headers: corsHeaders,
      });
    }

    return new Response("ok", { headers: corsHeaders });
  }

  if (!isAllowedOrigin(request)) {
    return new Response(JSON.stringify({ error: "Origen no permitido." }), {
      status: 403,
      headers: { ...corsHeaders, ...jsonHeaders },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido." }), {
      status: 405,
      headers: { ...corsHeaders, ...jsonHeaders },
    });
  }

  let body;
  try {
    const contentType = request.headers.get("content-type") || "";
    body = contentType.includes("application/json")
      ? await request.json()
      : JSON.parse(await request.text());
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo JSON inválido." }), {
      status: 400,
      headers: { ...corsHeaders, ...jsonHeaders },
    });
  }

  const { form = {}, mode = "login" } = body;
  const error = validateAuthForm(form, mode);
  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 400,
      headers: { ...corsHeaders, ...jsonHeaders },
    });
  }

  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { ...corsHeaders, ...jsonHeaders },
  });
});
