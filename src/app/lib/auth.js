import { supabase } from "@/services";

export const COUNTRY_OPTIONS = [
  { code: "AR", label: "Argentina", currency: "ARS", language: "es", locale: "es-AR" },
  { code: "BO", label: "Bolivia", currency: "BOB", language: "es", locale: "es-BO" },
  { code: "BR", label: "Brasil", currency: "BRL", language: "pt", locale: "pt-BR" },
  { code: "CL", label: "Chile", currency: "CLP", language: "es", locale: "es-CL" },
  { code: "CO", label: "Colombia", currency: "COP", language: "es", locale: "es-CO" },
  { code: "CR", label: "Costa Rica", currency: "CRC", language: "es", locale: "es-CR" },
  { code: "EC", label: "Ecuador", currency: "USD", language: "es", locale: "es-EC" },
  { code: "SV", label: "El Salvador", currency: "USD", language: "es", locale: "es-SV" },
  { code: "GT", label: "Guatemala", currency: "GTQ", language: "es", locale: "es-GT" },
  { code: "MX", label: "México", currency: "MXN", language: "es", locale: "es-MX" },
  { code: "PA", label: "Panamá", currency: "USD", language: "es", locale: "es-PA" },
  { code: "PY", label: "Paraguay", currency: "PYG", language: "es", locale: "es-PY" },
  { code: "PE", label: "Perú", currency: "PEN", language: "es", locale: "es-PE" },
  { code: "DO", label: "República Dominicana", currency: "DOP", language: "es", locale: "es-DO" },
  { code: "UY", label: "Uruguay", currency: "UYU", language: "es", locale: "es-UY" },
  { code: "VE", label: "Venezuela", currency: "VES", language: "es", locale: "es-VE" },
];

const UI_TEXTS = {
  es: {
    authWelcome: "Bienvenido",
    authCopy: "Crea tu cuenta o inicia sesión.",
    authName: "Nombre",
    authEmail: "Correo electrónico",
    authCountry: "País",
    authPassword: "Contraseña",
    authLogin: "Iniciar sesión",
    authSignup: "Registrarse",
    authRecover: "¿Olvidaste tu contraseña?",
    authPasswordShow: "Mostrar contraseña",
    authPasswordHide: "Ocultar contraseña",
    authNameRequired: "Escribe tu nombre para registrarte.",
    authNameMin: "El nombre debe tener al menos 2 caracteres.",
    authNameMax: "El nombre no puede exceder los 100 caracteres.",
    authNamePattern: "El nombre solo puede contener letras, espacios, apóstrofes y guiones.",
    authCountryRequired: "Selecciona un país para registrarte.",
    authCountryInvalid: "El país seleccionado no es válido.",
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
    authLoginError: "Correo o contraseña incorrectos.",
    authEmailTaken: "Este correo ya está registrado.",
    authEmailConfirm: "Debes confirmar tu correo antes de iniciar sesión.",
    authPasswordRule: "La contraseña no cumple los requisitos mínimos.",
    authGenericError: "Ocurrió un error. Inténtalo nuevamente.",
    uiEditGarmentName: "Editar nombre de la prenda",
    uiDeleteBlock: "Eliminar este bloque",
    uiAddRow: "Agregar fila",
    uiDeleteRow: "Eliminar fila",
    uiPrice: "PRECIO",
    uiDelete: "ELIMINAR",
    uiPriceAutomatic: "Precio automático",
    uiPriceOwn: "Precio propio",
    uiEditBlockName: "Editar nombre del bloque",
    uiDeleteFabricBlock: "Eliminar bloque de telas",
    uiAddFabricRow: "Agregar fila de tela",
    uiDeleteFabricRow: "Eliminar fila de tela",
    uiRolls: "Rollos",
    uiKgPerRoll: "Kg por rollo",
    uiPricePerKg: "Precio por kilo",
    uiTotalRolls: "Total rollos",
    uiTotalPrice: "Precio total",
    uiSummary: "RESUMEN GENERAL",
    uiGrandTotalCost: "Total compra",
    uiGrandTotalRolls: "Total rollos",
    uiGrandTotalKg: "Total kilos",
    uiTotalGarments: "Total prendas",
  },
  pt: {
    authWelcome: "Bem-vindo",
    authCopy: "Crie sua conta ou faça login.",
    authName: "Nome",
    authEmail: "E-mail",
    authCountry: "País",
    authPassword: "Senha",
    authLogin: "Entrar",
    authSignup: "Cadastrar-se",
    authRecover: "Esqueceu sua senha?",
    authPasswordShow: "Mostrar senha",
    authPasswordHide: "Ocultar senha",
    authNameRequired: "Escreva seu nome para se cadastrar.",
    authNameMin: "O nome deve ter pelo menos 2 caracteres.",
    authNameMax: "O nome não pode exceder 100 caracteres.",
    authNamePattern: "O nome só pode conter letras, espaços, apóstrofos e hífens.",
    authCountryRequired: "Selecione um país para se cadastrar.",
    authCountryInvalid: "O país selecionado não é válido.",
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
    authLoginError: "E-mail ou senha incorretos.",
    authEmailTaken: "Este e-mail já está cadastrado.",
    authEmailConfirm: "Você precisa confirmar seu e-mail antes de fazer login.",
    authPasswordRule: "A senha não atende aos requisitos mínimos.",
    authGenericError: "Ocorreu um erro. Tente novamente.",
    uiEditGarmentName: "Editar nome da peça",
    uiDeleteBlock: "Excluir este bloco",
    uiAddRow: "Adicionar linha",
    uiDeleteRow: "Excluir linha",
    uiPrice: "PREÇO",
    uiDelete: "EXCLUIR",
    uiPriceAutomatic: "Preço automático",
    uiPriceOwn: "Preço próprio",
    uiEditBlockName: "Editar nome do bloco",
    uiDeleteFabricBlock: "Excluir bloco de tecido",
    uiAddFabricRow: "Adicionar linha de tecido",
    uiDeleteFabricRow: "Excluir linha de tecido",
    uiRolls: "Rolos",
    uiKgPerRoll: "Kg por rolo",
    uiPricePerKg: "Preço por quilo",
    uiTotalRolls: "Total de rolos",
    uiTotalPrice: "Preço total",
    uiSummary: "RESUMO GERAL",
    uiGrandTotalCost: "Total da compra",
    uiGrandTotalRolls: "Total de rolos",
    uiGrandTotalKg: "Total de quilos",
    uiTotalGarments: "Total de peças",
  },
};

export function getCountryConfig(countryCode) {
  const normalized = (countryCode || "CL").toUpperCase();
  return (
    COUNTRY_OPTIONS.find((option) => option.code === normalized) ||
    COUNTRY_OPTIONS[0]
  );
}

export function getUiText(key, value = null) {
  const countryCode =
    typeof value === "string"
      ? value
      : value?.user_metadata?.country ||
        value?.user_metadata?.country_code ||
        value?.country ||
        "CL";
  const language = getCountryConfig(countryCode).language || "es";
  return UI_TEXTS[language]?.[key] || UI_TEXTS.es[key] || key;
}

export function validateAuthForm(form, mode) {
  const email = (form.email || "").trim();
  const password = form.password || "";
  const name = (form.name || "").trim();
  const country = (form.country || "").trim().toUpperCase();
  const t = (key, fallback) => getUiText(key, country) || fallback;

  if (mode === "signup") {
    if (!name) {
      return t("authNameRequired", "Escribe tu nombre para registrarte.");
    }

    if (name.length < 2) {
      return t("authNameMin", "El nombre debe tener al menos 2 caracteres.");
    }

    if (name.length > 100) {
      return t("authNameMax", "El nombre no puede exceder los 100 caracteres.");
    }

    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'-]+$/.test(name)) {
      return t("authNamePattern", "El nombre solo puede contener letras, espacios, apóstrofes y guiones.");
    }

    if (!country) {
      return t("authCountryRequired", "Selecciona un país para registrarte.");
    }

    if (!COUNTRY_OPTIONS.some((option) => option.code === country)) {
      return t("authCountryInvalid", "El país seleccionado no es válido.");
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
    return t("authEmailRequired", "Completa el correo electrónico y la contraseña.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return t("authEmailInvalid", "Ingresa un correo electrónico válido.");
  }

  if (email.length > 254) {
    return t("authEmailMax", "El correo electrónico es demasiado largo.");
  }

  if (password.length < 6) {
    return t("authPasswordMin", "La contraseña debe tener al menos 6 caracteres.");
  }

  if (password.length > 128) {
    return t("authPasswordMax", "La contraseña no puede exceder los 128 caracteres.");
  }

  if (mode === "signup") {
    if (/\s/.test(password)) {
      return t("authPasswordSpaces", "La contraseña no puede contener espacios.");
    }

    if (!/[A-Z]/.test(password)) {
      return t("authPasswordUpper", "La contraseña debe incluir al menos una letra mayúscula.");
    }

    if (!/[a-z]/.test(password)) {
      return t("authPasswordLower", "La contraseña debe incluir al menos una letra minúscula.");
    }

    if (!/[0-9]/.test(password)) {
      return t("authPasswordNumber", "La contraseña debe incluir al menos un número.");
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return t("authPasswordSpecial", "La contraseña debe incluir al menos un carácter especial (!@#$%, etc.).");
    }
  }

  return "";
}

export async function validateAuthFormServer(form, mode) {
  if (!supabase) return "";

  const { data, error } = await supabase.functions.invoke("validate-auth", {
    body: { form, mode },
  });

  if (error) {
    const response = error?.context;

    if (response && typeof response.json === "function") {
      try {
        const payload = await response.json();
        if (payload && typeof payload === "object" && payload.error) {
          return payload.error;
        }
      } catch {
        // Si no podemos leer el cuerpo, dejamos pasar el registro.
      }
    }

    if (error.message?.includes("not found")) return "";
    console.warn("validate-auth no disponible:", error);
    return "";
  }

  const result = data && typeof data === "object" ? data : null;
  if (!result) {
    return "";
  }

  if (result.error) {
    return result.error;
  }

  return "";
}

export function showAuthError(error, countryCode = "CL") {
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
