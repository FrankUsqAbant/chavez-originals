# Chavez Originals

Sitio web de **Chavez Originals** (calzado deportivo y urbano, Cajamarca). React 19 + Vite + Tailwind 4 + TypeScript. Los pedidos se coordinan por WhatsApp. Versión **demo** para presentar al cliente.

## Comandos

| Comando | Acción |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor local en http://localhost:3000 |
| `npm run build` / `npm run preview` | Build de producción y vista previa |
| `npm run lint` | Chequeo de tipos |
| `npm test` | Tests de la lógica de negocio |
| `npm run spin -- <modelo>` | Genera las vistas (o el giro 360°) de un modelo, en todos sus colores |
| `npm run model3d -- <modelo> <archivo.glb>` | Optimiza y publica el modelo 3D de una zapatilla (giro libre con el mouse) |
| `node scripts/build-facade.mjs` | Limpia y amplía la foto de la fachada (quita pin y marca de agua de Street View) |

## Estructura

- Página: Inicio (hero) → Catálogo → Tienda. Las tallas se eligen en la ficha del producto.
- `src/data/storeData.ts`: productos y datos de la tienda (precios, tallas, contacto).
- `src/data/hero-models.json`: modelos y colores (los usan el hero, el catálogo y el generador de imágenes).
- `src/utils/b2b-logic.ts`: enlaces de pedido por WhatsApp y horario de atención.
- `src/lib/smoothScroll.ts`: scroll con inercia (Lenis). `src/lib/reclamos.ts`: envío del Libro de Reclamaciones.
- `src/components/`: secciones y modales. `SpinViewer.tsx`: visor de ángulos.
- `archive/spin-src/<modelo>/`: fotos de origen de cada modelo (fuera del build).

## Modelos de la demo

Fútbol Pro 2026, Air Glow Tech y Chunky Lavender: los tres tienen precio, código, tallas y vistas. Urban Low y Velocity Silver se retiraron de la demo por no tener aún precio, código ni tallas confirmadas (sus fotos están en el historial de git).

## Imágenes

- Todo lo que se sirve está en `public/assets/aistudio/`: la fachada (`Chaves_Originals_*.webp`) y las vistas `spin/<modelo>/<color>/NN.webp` (WebP, 900 px de ancho, ~40 KB c/u).
- La vista `01` (perfil) es también la foto del catálogo y de las fichas, para no duplicar imágenes.
- Las vistas se cargan solo para el modelo y color que se está viendo.

## Ángulos y giro 360° de las zapatillas

El hero muestra las zapatillas con un visor de ángulos (miniaturas Perfil / Frente / Atrás…, arrastre o deslizar, flechas del teclado). El ángulo se conserva al cambiar de color.

**Cómo está armado (por modelo):**
1. Las fotos van en `archive/spin-src/<modelo>/` con un `views.json` que define el orden, el nombre de cada ángulo y si hay que voltearla (`"flip": true`).
   Modelos con colores definidos en `hero-models.json`: `futbol-pro`, `air-glow-tech`, `chunky-lavender`.
2. `npm run spin -- <modelo>` quita el fondo (en tu PC), rellena huecos, encuadra todas las vistas en el mismo lienzo y genera **todos los colores**.
3. Requiere `@imgly/background-removal-node` (ya está en devDependencies; `package.json` lleva `"overrides": { "sharp": "$sharp" }` para que npm no bloquee `sharp`).

**Reglas para las fotos:** mismo diseño del modelo en todas las vistas; la vista de perfil mirando a la derecha (si mira a la izquierda se voltea con `flip`, y el texto de la zapatilla queda en espejo); fondo claro y liso.

**Giro 360° continuo (opcional):** con 24–36 fotos tomadas cada 10–15° sobre un plato giratorio (o un video de 15–20 s, requiere `ffmpeg`), sin `views.json`, el mismo comando genera un giro continuo y el visor pasa a arrastre fino.

**Para agregar un modelo:** crea su entrada en `hero-models.json` (colores), sus fotos y `views.json` en `archive/spin-src/<modelo>/`, corre `npm run spin -- <modelo>` y añade el producto en `storeData.ts`.

## Modelos 3D (giro libre con el mouse)

El hero ya trae el visor 3D (`Shoe3D.tsx`, basado en `<model-viewer>`): se gira en todas las direcciones con el mouse o el dedo (incluso desde abajo), con giro automático al inicio y sin zoom con la rueda (para no bloquear el scroll). **Se activa solo en los modelos que tengan un `.glb`** y aparece un selector "3D 360° / Fotos". Los colores tiñen el modelo. Si un modelo 3D falla, el hero vuelve a las fotos sin romper el sitio.

**Hoy ningún modelo tiene `.glb`**: un giro libre necesita un modelo 3D, no se puede hacer con fotos sueltas. Para activarlo en un modelo:
1. Conseguir el `.glb` de la zapatilla (ver opciones abajo).
2. `npm run model3d -- <modelo> C:\ruta\zapatilla.glb` (reduce polígonos a ~80 000 y comprime texturas; objetivo < 3 MB).
3. Listo: el hero lo usa de inmediato.

**Cómo conseguir el .glb (de mejor a más rápido):**
- **Fotogrametría con el celular** (Polycam, KIRI Engine, Luma): 60–100 fotos alrededor de la zapatilla real, fondo liso y luz pareja. Es el resultado más fiel al producto.
- **Archivo 3D de la fábrica** (diseño/CAD del modelo): si Punto Original lo tiene, es lo ideal.
- **Servicios de imagen a 3D con IA** (Tripo, Meshy, Hunyuan3D, Rodin): se suben las vistas de `archive/spin-src/<modelo>/` y se descarga el `.glb`. Es lo más rápido para una demo; la calidad es media y la parte trasera la inventa la IA.

## Libro de Reclamaciones (Supabase)

- Las hojas se guardan en el proyecto Supabase `chavez-originals` (tabla `reclamaciones`). El número de hoja (`REC-2026-0001`, `QUE-2026-0001`) lo asigna el servidor.
- **Para ver los reclamos:** Supabase > Table Editor > `reclamaciones` (se puede cambiar `estado` y escribir la `respuesta`). Desde internet la tabla **no se puede leer**: solo la función `registrar_reclamo` puede escribir.
- Protecciones: RLS sin políticas públicas, validación de datos en el servidor, límite de 5 envíos por hora por conexión (se guarda solo un hash de la IP) y campo trampa contra bots.
- Si el servidor no responde, el formulario entrega un número `PROV-…` y la hoja se envía por WhatsApp o correo.
- Configuración: copia `.env.example` como `.env.local`. Al desplegar, define `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY` en el hosting.
- El esquema está en las migraciones del proyecto Supabase (`libro_de_reclamaciones` y `reclamos_solo_anon_ejecuta`).

## Pendiente de confirmar por el negocio

- RUC y correo en `storeData.ts` (marcados con `TODO`).
- Las imágenes de producto son generadas con IA: confirmar que coinciden con los productos reales (logos, colores, diseño).
- Los colores son recoloreados digitalmente, no fotos del producto real.
- Textos legales (Términos, Privacidad, Garantías): base para revisión de un asesor.
