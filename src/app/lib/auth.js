// Punto publico de autenticacion: mantiene los imports existentes y delega en modulos pequenos.
export { COUNTRY_OPTIONS, DEFAULT_COUNTRY_CODE, getCountryConfig } from "./auth/config.js";
export { getUiText } from "./auth/texts.js";
export { validateAuthForm } from "./auth/validation.js";
export { validateAuthFormServer } from "./auth/serverValidation.js";
export { showAuthError } from "./auth/errors.js";
