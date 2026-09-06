import {
  COUNTRY_OPTIONS,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./config.js";
import { getUiText } from "./texts.js";

// Helpers para validar nombres con letras Unicode, tildes combinadas y signos permitidos.
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

// Revisa las reglas fuertes de contrasena que se exigen al crear o restablecer cuenta.
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

// Valida el formulario en el cliente segun el flujo: login, registro, recuperacion o reset.
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
