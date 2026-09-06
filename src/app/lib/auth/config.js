export const DEFAULT_COUNTRY_CODE = "CL";
export const EMAIL_MAX_LENGTH = 254;
export const NAME_MAX_LENGTH = 100;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

// Opciones de pais usadas para definir moneda, idioma y formato regional.
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

// Devuelve la configuracion regional de un pais o usa Chile como respaldo.
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
