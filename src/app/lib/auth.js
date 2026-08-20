import { supabase } from "@/services";

export const DEFAULT_COUNTRY_CODE = "CL";
const EMAIL_MAX_LENGTH = 254;
const NAME_MAX_LENGTH = 100;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 128;

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
    authWelcomeBack: "Bienvenido de nuevo",
    authCopy: "Crea tu cuenta o inicia sesión.",
    authContinueCopy: "Ingresa a tu cuenta para continuar.",
    authName: "Nombre",
    authEmail: "Correo electrónico",
    authCountry: "País",
    authPassword: "Contraseña",
    authConfirmPassword: "Confirmar contraseña",
    authLogin: "Iniciar sesión",
    authSignup: "Registrarse",
    authSignupAction: "Crear cuenta",
    authRecover: "¿Olvidaste tu contraseña?",
    authNoAccount: "¿No tienes una cuenta?",
    authOr: "o",
    authPasswordShow: "Mostrar contraseña",
    authPasswordHide: "Ocultar contraseña",
    authPasswordRequired: "Escribe tu contraseña.",
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
    authPasswordMismatch: "Las contraseñas no coinciden.",
    authLoginError: "Correo o contraseña incorrectos.",
    authEmailTaken: "Este correo ya está registrado.",
    authEmailConfirm: "Debes confirmar tu correo antes de iniciar sesión.",
    authPasswordRule: "La contraseña no cumple los requisitos mínimos.",
    authGenericError: "Ocurrió un error. Inténtalo nuevamente.",
    authRecoverEmailRequired: "Escribe tu correo electrónico para enviarte el enlace.",
    authLoginLoading: "Iniciando sesión...",
    authLoginSuccess: "Sesión iniciada correctamente.",
    authSignupLoading: "Creando cuenta...",
    authSignupSuccessLoggedIn: "Cuenta creada y sesión iniciada.",
    authSignupSuccessConfirm: "Cuenta creada. Revisa tu correo para confirmar tu registro.",
    authRecoverLoading: "Enviando correo de recuperación...",
    authRecoverSuccess: "Te enviamos un correo para recuperar tu contraseña.",
    authResetTitle: "Crea una nueva contraseña",
    authResetCopy: "Escribe una contraseña segura para volver a entrar.",
    authResetSubmit: "Guardar nueva contraseña",
    authResetLoading: "Guardando contraseña...",
    authResetSuccess: "Contraseña actualizada correctamente.",
    authResetRequired: "Abre el enlace de recuperación desde tu correo para cambiar la contraseña.",
    authSessionRequired: "Inicia sesión o regístrate para acceder a tus datos.",
    authSessionClosed: "La sesión se cerró. Vuelve a iniciar sesión.",
    authNameEmpty: "Escribe un nombre.",
    authNameSaveError: "No se pudo guardar el nombre.",
    authNameSaved: "Nombre actualizado.",
    authLogoutError: "No se pudo cerrar sesión.",
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
    authWelcomeBack: "Bem-vindo de volta",
    authCopy: "Crie sua conta ou entre.",
    authContinueCopy: "Entre na sua conta para continuar.",
    authName: "Nome",
    authEmail: "E-mail",
    authCountry: "País",
    authPassword: "Senha",
    authConfirmPassword: "Confirmar senha",
    authLogin: "Entrar",
    authSignup: "Cadastrar-se",
    authSignupAction: "Criar conta",
    authRecover: "Esqueceu sua senha?",
    authNoAccount: "Ainda não tem uma conta?",
    authOr: "ou",
    authPasswordShow: "Mostrar senha",
    authPasswordHide: "Ocultar senha",
    authPasswordRequired: "Digite sua senha.",
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
    authPasswordMismatch: "As senhas não coincidem.",
    authLoginError: "E-mail ou senha incorretos.",
    authEmailTaken: "Este e-mail já está cadastrado.",
    authEmailConfirm: "Você precisa confirmar seu e-mail antes de entrar.",
    authPasswordRule: "A senha não atende aos requisitos mínimos.",
    authGenericError: "Ocorreu um erro. Tente novamente.",
    authRecoverEmailRequired: "Informe seu e-mail para receber o link.",
    authLoginLoading: "Entrando...",
    authLoginSuccess: "Sessão iniciada com sucesso.",
    authSignupLoading: "Criando conta...",
    authSignupSuccessLoggedIn: "Conta criada e sessão iniciada.",
    authSignupSuccessConfirm: "Conta criada. Verifique seu e-mail para confirmar o cadastro.",
    authRecoverLoading: "Enviando e-mail de recuperação...",
    authRecoverSuccess: "Enviamos um e-mail para você recuperar sua senha.",
    authResetTitle: "Crie uma nova senha",
    authResetCopy: "Digite uma senha segura para entrar novamente.",
    authResetSubmit: "Salvar nova senha",
    authResetLoading: "Salvando senha...",
    authResetSuccess: "Senha atualizada com sucesso.",
    authResetRequired: "Abra o link de recuperação enviado ao seu e-mail para alterar a senha.",
    authSessionRequired: "Entre ou crie uma conta para acessar seus dados.",
    authSessionClosed: "A sessão foi encerrada. Entre novamente.",
    authNameEmpty: "Informe um nome.",
    authNameSaveError: "Não foi possível salvar o nome.",
    authNameSaved: "Nome atualizado.",
    authLogoutError: "Não foi possível sair.",
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
  const normalized = (countryCode || DEFAULT_COUNTRY_CODE).toUpperCase();
  const fallback = COUNTRY_OPTIONS.find(
    (option) => option.code === DEFAULT_COUNTRY_CODE,
  );

  return (
    COUNTRY_OPTIONS.find((option) => option.code === normalized) ||
    fallback ||
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
        DEFAULT_COUNTRY_CODE;
  const language = getCountryConfig(countryCode).language || "es";
  return UI_TEXTS[language]?.[key] || UI_TEXTS.es[key] || key;
}

function isCombiningMark(character) {
  const codePoint = character.codePointAt(0);
  return codePoint >= 0x0300 && codePoint <= 0x036f;
}

function isLetter(character) {
  return character.toLocaleLowerCase() !== character.toLocaleUpperCase();
}

function isValidNameCharacter(character) {
  return (
    character === " " ||
    character === "'" ||
    character === "’" ||
    character === "-" ||
    isCombiningMark(character) ||
    isLetter(character)
  );
}

function isValidName(name) {
  return [...name].every(isValidNameCharacter);
}

function hasUppercaseLetter(value) {
  return [...value].some((character) => {
    return isLetter(character) && character === character.toLocaleUpperCase();
  });
}

function hasLowercaseLetter(value) {
  return [...value].some((character) => {
    return isLetter(character) && character === character.toLocaleLowerCase();
  });
}

function validatePasswordRules(password, t) {
  if (!password) {
    return t("authPasswordRequired", "Escribe tu contraseña.");
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return t("authPasswordMin", "La contraseña debe tener al menos 6 caracteres.");
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return t("authPasswordMax", "La contraseña no puede exceder los 128 caracteres.");
  }

  if (/\s/.test(password)) {
    return t("authPasswordSpaces", "La contraseña no puede contener espacios.");
  }

  if (!hasUppercaseLetter(password)) {
    return t("authPasswordUpper", "La contraseña debe incluir al menos una letra mayúscula.");
  }

  if (!hasLowercaseLetter(password)) {
    return t("authPasswordLower", "La contraseña debe incluir al menos una letra minúscula.");
  }

  if (!/[0-9]/.test(password)) {
    return t("authPasswordNumber", "La contraseña debe incluir al menos un número.");
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return t("authPasswordSpecial", "La contraseña debe incluir al menos un carácter especial (!@#$%, etc.).");
  }

  return "";
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

    if (name.length > NAME_MAX_LENGTH) {
      return t("authNameMax", "El nombre no puede exceder los 100 caracteres.");
    }

    if (!isValidName(name)) {
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
      return t("authRecoverEmailRequired", "Escribe tu correo electrónico para enviarte el enlace.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return t("authEmailInvalid", "Ingresa un correo electrónico válido.");
    }

    if (email.length > EMAIL_MAX_LENGTH) {
      return t("authEmailMax", "El correo electrónico es demasiado largo.");
    }

    return "";
  }

  if (mode === "reset") {
    const passwordError = validatePasswordRules(password, t);
    if (passwordError) return passwordError;

    if (form.confirmPassword !== password) {
      return t("authPasswordMismatch", "Las contraseñas no coinciden.");
    }

    return "";
  }

  if (!email || !password) {
    return t("authEmailRequired", "Completa el correo electrónico y la contraseña.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return t("authEmailInvalid", "Ingresa un correo electrónico válido.");
  }

  if (email.length > EMAIL_MAX_LENGTH) {
    return t("authEmailMax", "El correo electrónico es demasiado largo.");
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return t("authPasswordMin", "La contraseña debe tener al menos 6 caracteres.");
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return t("authPasswordMax", "La contraseña no puede exceder los 128 caracteres.");
  }

  if (mode === "signup") {
    const passwordError = validatePasswordRules(password, t);
    if (passwordError) return passwordError;
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
