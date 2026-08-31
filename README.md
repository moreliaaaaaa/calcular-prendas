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
proyecto/
  src/                  Codigo editable de la aplicacion.
    app/                Entrada, composicion principal, hooks y componentes base.
      components/       Componentes que conectan partes grandes de la app.
      hooks/            Hooks de estado, autenticacion, sincronizacion y acciones.
      lib/              Logica general de la app, como textos y validaciones.
    features/           Pantallas y modulos por funcionalidad.
      auth/             Pantalla de inicio de sesion y registro.
      fabric/           Modulo de compras de telas.
      garments/         Modulo de calculadora de prendas.
    widgets/            Bloques grandes compartidos por la interfaz.
      header/           Encabezado superior.
      side-menu/        Menu lateral, ajustes y actividad admin.
    shared/             Recursos reutilizables sin depender de una pantalla.
      assets/           Logos e iconos usados por componentes React.
        brand/          Assets de marca, como el logo de Morelia.
        icons/          Iconos SVG de botones y controles.
      hooks/            Hooks reutilizables.
      lib/              Calculos, store local y utilidades puras.
      ui/               Componentes pequenos reutilizables.
    services/           Integraciones externas.
      supabase/         Cliente de Supabase.
    config/             Configuracion editable del proyecto.
    styles/             CSS global y modulos por area.
      modules/          Estilos separados por pantalla o widget.

  public/               Archivos que Vite publica tal cual.
    icons/              Iconos PWA para instalar la app.
    manifest.json       Manifest de la app instalable.
    service-worker.js   Cache y soporte offline.

  supabase/             Migraciones, schema y funciones backend.
  dist/                 Build generado por Vite. No se edita.
  node_modules/         Dependencias instaladas. No se edita.
  index.html            HTML base de Vite.
  package.json          Scripts y dependencias.
  vite.config.js        Configuracion de Vite.
```

## Reglas de orden

- Trabajar la interfaz, componentes, estilos y assets visuales dentro de `src/`.
- Usar `src/shared/assets/brand` para logos y recursos de marca.
- Usar `src/shared/assets/icons` para iconos SVG usados en botones o controles.
- Dejar en `public/` solo archivos que deban publicarse con ruta fija, como
  `manifest.json`, `service-worker.js` e iconos PWA.
- No editar `dist/` ni `node_modules/`; se generan automaticamente.
- Encapsular APIs externas en `src/services` antes de usarlas desde la UI.
