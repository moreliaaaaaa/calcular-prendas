import { supabase } from "@/services";

// Consulta una funcion de Supabase para aplicar validaciones adicionales desde el servidor.
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
