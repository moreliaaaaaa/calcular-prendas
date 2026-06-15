# Calculadora de prendas

Aplicacion React + Vite para gestionar calculos de prendas y compras de telas,
con persistencia local y sincronizacion opcional mediante Supabase.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Estructura

```text
src/
  app/                 Entrada de React, hooks de app y composicion principal.
    hooks/             Acciones y hooks propios de la aplicacion.
  features/            Pantallas y componentes por dominio funcional.
    auth/              Modulo de autenticacion.
    fabric/            Modulo de compras de telas.
    garments/          Modulo de calculadora de prendas.
  config/              Configuracion editable por entorno/proyecto.
  services/            Integraciones externas, como Supabase.
  shared/
    assets/            Helpers de assets publicos.
    hooks/             Hooks reutilizables sin dominio fuerte.
    lib/               Logica pura y normalizacion de datos.
    ui/                Componentes reutilizables sin dominio fuerte.
  styles/              Estilos globales y modulos CSS.
  widgets/             Bloques de interfaz compartidos por la app.
public/                Assets estaticos servidos por Vite.
supabase/              Scripts SQL y recursos de base de datos.
```

## Criterios de crecimiento

- Mantener `src/app/App.jsx` como orquestador de estado y pantallas.
- Crear nuevas carpetas en `src/features/<dominio>` cuando una funcionalidad
  tenga componentes, hooks y reglas propias.
- Usar `src/widgets` para piezas grandes de interfaz que cruzan dominios, como
  el encabezado o el menu lateral.
- Dejar calculos puros en `src/shared/lib` para poder probarlos sin React.
- Encapsular APIs externas en `src/services` antes de usarlas desde la UI.
