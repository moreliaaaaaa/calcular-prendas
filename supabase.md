# Supabase para Morelia Atelier

## 1. Crear la tabla privada

En Supabase, abre el SQL Editor y ejecuta el archivo `supabase/schema.sql`.

Ese script hace dos cosas importantes:

- crea la tabla `shared_states`
- activa reglas para que cada usuario autenticado solo pueda leer y guardar su propio registro

## 2. Activar Auth por correo

En el dashboard de Supabase:

1. ve a `Authentication`
2. habilita `Email`
3. si quieres que el acceso sea inmediato, desactiva la confirmacion por correo

Si prefieres confirmacion por email, el registro igual funciona, pero la persona tendra que revisar su correo antes de entrar.

## 3. Copiar tus credenciales

En el dashboard de Supabase copia:

- `Project URL`
- `Publishable key` o `anon key`

Luego pegalas en `src/config/supabase.js`:

```js
export const SUPABASE_CONFIG = {
  url: "https://TU-PROYECTO.supabase.co",
  anonKey: "TU-KEY",
  table: "shared_states",
  useAuth: true,
  enableRealtime: true,
};
```

Notas:

- con `useAuth: true`, la app deja de usar una sala compartida y pasa a guardar un estado privado por cuenta
- si `url` y `anonKey` estan vacios, la app sigue funcionando solo en local

## 4. Como funciona ahora

- cada usuario crea su cuenta desde la propia app
- al iniciar sesion, la calculadora carga solo las operaciones de esa cuenta
- si le pasas la app a tu amigo, el vera un espacio vacio con su propio usuario, no tus datos
- si dos dispositivos entran con la misma cuenta, ambos veran los mismos datos sincronizados

## 5. Panel privado de admin

La app ahora puede guardar actividad por usuario en `public.user_activity`.

Ese panel:

- solo se muestra para la cuenta admin
- solo el admin puede leer el ranking completo
- cada usuario solo puede escribir su propia actividad

Antes de usarlo en Supabase:

- ejecuta `supabase/schema.sql`
- confirma que la cuenta `estereltnia@gmail.com` esté marcada como admin, o cambia ese correo por el tuyo en el archivo SQL y en `src/config/supabase.js`

## 6. Publicar en Netlify

Este proyecto sigue siendo un sitio estatico.

- `Build command`: `npm run build`
- `Publish directory`: `dist`
- `netlify.toml`: ya incluido
