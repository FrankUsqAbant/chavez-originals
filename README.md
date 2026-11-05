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

## Estructura

- `src/data/storeData.ts`: productos y datos de la tienda (editar aquí precios, tallas y contacto).
- `src/utils/b2b-logic.ts`: enlaces de WhatsApp, horario de atención, cálculo mayorista.
- `src/components/`: secciones y modales.
- `archive/`: imágenes de prueba y originales pesados, fuera del build.

## Pendiente de confirmar por el negocio

- RUC, premios, patrocinio, correo y Facebook en `storeData.ts` (marcados con `TODO`).
- Guardado real del Libro de Reclamaciones (hoy se envía por WhatsApp y se guarda una copia en el navegador).
- Fotos reales por color: los colores del hero son simulados con filtros CSS.
