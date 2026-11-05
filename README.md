# Chavez Originals

Sitio web de **Chavez Originals** (calzado deportivo y urbano, Cajamarca). React 19 + Vite + Tailwind 4 + TypeScript. Los pedidos se coordinan por WhatsApp; no hay backend.

## Comandos

| Comando | AcciÃ³n |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor local en http://localhost:3000 |
| `npm run build` / `npm run preview` | Build de producciÃ³n y vista previa |
| `npm run lint` | Chequeo de tipos |
| `npm test` | Tests de la lÃ³gica de negocio |
| `npm run images` | Convierte imÃ¡genes de `archive/originals` a WebP en `public/assets/aistudio` |
| `node scripts/build-facade.mjs` | Limpia y amplía la foto de la fachada (quita pin y marca de agua de Street View) |
| `npm run hero` | Genera una imagen por modelo y color del hero en `public/assets/aistudio/hero` (agrega `-- --sheet` para una hoja de revisiÃ³n en `archive/work`) |

## Zapatillas (hero y catálogo)

- Cada color es una imagen real (recoloreada con `scripts/build-hero-assets.mjs`), no un filtro CSS.
- Modelos y colores se definen en `src/data/hero-models.json`; el script y el componente lo comparten.
- Las fuentes son recortes con fondo transparente en `archive/hero-src/`. Para sumar un modelo: recorta la foto
  (ver `scripts/cutout-hero.mjs`), guarda el PNG en `archive/hero-src/`, agrÃ©galo al JSON y corre `npm run hero`.
- Fotos de origen de baja resoluciÃ³n (Urban Low, Air Glow Tech, Chunky Lavender) se ven mejor con fotos de estudio nuevas.

## Estructura

- PÃ¡gina: Inicio (hero) â†’ CatÃ¡logo â†’ Tienda. Las tallas se eligen en la ficha del producto.
- `src/data/storeData.ts`: productos y datos de la tienda (editar aquÃ­ precios, tallas y contacto).
- `src/utils/b2b-logic.ts`: enlaces de pedido por WhatsApp y horario de atenciÃ³n.
- `src/lib/smoothScroll.ts`: scroll con inercia (Lenis) y navegaciÃ³n entre secciones.
- `src/components/`: secciones y modales.
- `archive/`: fuentes de las imÃ¡genes (`originals`, `hero-src`), fuera del build.

## Libro de Reclamaciones (Supabase)

- Las hojas se guardan en el proyecto Supabase `chavez-originals` (tabla `reclamaciones`). El número de hoja (`REC-2026-0001`, `QUE-2026-0001`) lo asigna el servidor.
- **Para ver los reclamos:** Supabase > Table Editor > `reclamaciones` (se puede cambiar `estado` y escribir la `respuesta`). Desde internet la tabla **no se puede leer**: solo la función `registrar_reclamo` puede escribir.
- Protecciones: RLS sin políticas públicas, validación de datos en el servidor, límite de 5 envíos por hora por conexión (se guarda solo un hash de la IP) y campo trampa contra bots.
- Si el servidor no responde, el formulario entrega un número `PROV-…` y la hoja se envía por WhatsApp o correo.
- Configuración: copia `.env.example` como `.env.local`. Al desplegar, define `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY` en el hosting.
- El esquema está en las migraciones del proyecto Supabase (`libro_de_reclamaciones` y `reclamos_solo_anon_ejecuta`).

## Pendiente de confirmar por el negocio

- RUC y correo en `storeData.ts` (marcados con `TODO`).
- Precios, tallas y características de Urban Low y Velocity Silver (hoy muestran "Consultar precio" con tallas 38–44 supuestas).
- Guardado real del Libro de Reclamaciones (hoy se envÃ­a por WhatsApp y se guarda una copia en el navegador).
- Fotos reales por color: los colores del hero son recoloreados digitalmente, no fotos del producto real.



