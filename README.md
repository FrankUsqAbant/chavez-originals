# Chavez Originals

Sitio web de **Chavez Originals** (calzado deportivo y urbano, Cajamarca). React 19 + Vite + Tailwind 4 + TypeScript. Los pedidos se coordinan por WhatsApp; no hay backend.

## Comandos

| Comando | Acción |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor local en http://localhost:3000 |
| `npm run build` / `npm run preview` | Build de producción y vista previa |
| `npm run lint` | Chequeo de tipos |
| `npm test` | Tests de la lógica de negocio |
| `npm run images` | Convierte imágenes de `archive/originals` a WebP en `public/assets/aistudio` |
| `npm run hero` | Genera una imagen por modelo y color del hero en `public/assets/aistudio/hero` (agrega `-- --sheet` para una hoja de revisión en `archive/work`) |

## Zapatillas del hero

- Cada color es una imagen real (recoloreada con `scripts/build-hero-assets.mjs`), no un filtro CSS.
- Modelos y colores se definen en `src/data/hero-models.json`; el script y el componente lo comparten.
- Las fuentes son recortes con fondo transparente en `archive/hero-src/`. Para sumar un modelo: recorta la foto
  (ver `scripts/cutout-hero.mjs`), guarda el PNG en `archive/hero-src/`, agrégalo al JSON y corre `npm run hero`.
- Fotos de origen de baja resolución (Urban Low, Air Glow Tech, Chunky Lavender) se ven mejor con fotos de estudio nuevas.

## Estructura

- `src/data/storeData.ts`: productos y datos de la tienda (editar aquí precios, tallas y contacto).
- `src/utils/b2b-logic.ts`: enlaces de WhatsApp, horario de atención, cálculo mayorista.
- `src/components/`: secciones y modales.
- `archive/`: imágenes de prueba y originales pesados, fuera del build.

## Pendiente de confirmar por el negocio

- RUC, premios, patrocinio, correo y Facebook en `storeData.ts` (marcados con `TODO`).
- Guardado real del Libro de Reclamaciones (hoy se envía por WhatsApp y se guarda una copia en el navegador).
- Fotos reales por color: los colores del hero son simulados con filtros CSS.
