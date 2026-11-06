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

- Página: Inicio (hero) → Catálogo → Nosotros → Mayoristas → Tienda. Las tallas se eligen en la ficha del producto.
- Nosotros (`NosotrosSection.tsx`): distribuidor exclusivo de Punto Original y oficial de VELCAN, Premio Nacional Innovación Empresarial y auspicio de la Copa Perú 2026 (fotos en `public/assets/nosotros/`, originales en `archive/nosotros/`).
- Mayoristas (`MayoristasSection.tsx`): venta por mayor y reparto a provincias (lista `DELIVERY_PROVINCES` en `storeData.ts`).
- Redes sociales: `SOCIAL_LINKS` en `storeData.ts`. Una red sin enlace no se muestra; para activar Facebook, TikTok o YouTube basta con pegar su URL.
- `src/data/storeData.ts`: datos de la tienda (contacto, horario) y el catálogo de RESPALDO (el catálogo real está en Supabase, ver "Administración de productos").
- `src/lib/products.ts`: lee el catálogo de Supabase. `admin.html` + `src/admin/`: panel de administración, una página aparte en `/admin` (no carga nada de la tienda).
- Hosting: `/admin` es el archivo `admin.html`. En Vercel funciona con `vercel.json` (`cleanUrls`); Netlify, Cloudflare Pages y GitHub Pages lo sirven sin configuración. En desarrollo y en `npm run preview` lo sirve `vite.config.ts`.
- `src/data/hero-models.json`: modelos y colores (los usan el hero, el catálogo y el generador de imágenes).
- `src/data/spin-manifest.json` y `models-manifest.json`: registros que escriben `npm run spin` y `npm run model3d` (no se editan a mano).
- `src/utils/store.ts`: enlaces de pedido por WhatsApp y horario de atención.
- `src/lib/smoothScroll.ts`: scroll con inercia (Lenis). `src/lib/reclamos.ts`: envío del Libro de Reclamaciones.
- `src/components/`: secciones y modales. `HeroSection.tsx`: el hero "Showroom" (zapatilla sobre un podio con aro neón); sus modelos y precios están en `src/data/heroModels.ts`. Diseño de referencia en Figma: https://www.figma.com/design/8sgTAjjMAI7GkfUKQw5r1y
- `archive/spin-src/<modelo>/`: fotos de origen de cada modelo (fuera del build).

## Modelos de la demo (catálogo de respaldo)

Fútbol Pro 2026, Air Glow Tech y Chunky Lavender: los tres tienen precio, código, tallas y vistas. El catálogo muestra 10 productos: esos 3 y 7 **variantes de color** (mismo zapato, precio y tallas del modelo base; los códigos de variante son de ejemplo) para que la demo se vea completa. Urban Low y Velocity Silver se retiraron de la demo por no tener aún precio, código ni tallas confirmadas (sus fotos están en el historial de git).

## Imágenes

- Todo lo que se sirve está en `public/assets/aistudio/`: la fachada (`Chaves_Originals_*.webp`) y las vistas `spin/<modelo>/<color>/NN.webp` (WebP, 900 px de ancho, ~40 KB c/u).
- La vista `01` (perfil) es también la foto de las fichas, para no duplicar imágenes; las tarjetas del catálogo usan `thumb.webp` (480 px, ~15 KB).
- Se carga solo el modelo y color que se está viendo; los demás ángulos y colores se precargan en el tiempo libre del navegador.

## Ángulos y giro 360° de las zapatillas

El hero ("El impulso de tu pasión") muestra la zapatilla en una vitrina: luz de estudio, podio negro y aro verde neón, como en los afiches de la marca. Movimiento delicado: flota despacio, se inclina un poco con el mouse, y los ángulos (miniaturas) y modelos cambian con fundidos lentos. Nada depende del scroll; con "reducir movimiento" en el sistema no hay animaciones. La barra superior es transparente sobre el hero y toma fondo al bajar.

**Cómo está armado (por modelo):**
1. Las fotos van en `archive/spin-src/<modelo>/` con un `views.json` que define el orden, el nombre de cada ángulo y si hay que voltearla (`"flip": true`).
   Modelos con colores definidos en `hero-models.json`: `futbol-pro`, `air-glow-tech`, `chunky-lavender`.
2. `npm run spin -- <modelo>` quita el fondo (en tu PC), rellena huecos, encuadra todas las vistas en el mismo lienzo y genera **todos los colores**.
3. Requiere `@imgly/background-removal-node` (ya está en devDependencies; `package.json` lleva `"overrides": { "sharp": "$sharp" }` para que npm no bloquee `sharp`).

**Reglas para las fotos:** mismo diseño del modelo en todas las vistas; la vista de perfil mirando a la derecha (si mira a la izquierda se voltea con `flip`, y el texto de la zapatilla queda en espejo); fondo claro y liso.

**Giro 360° continuo (opcional):** con 24–36 fotos tomadas cada 10–15° sobre un plato giratorio (o un video de 15–20 s, requiere `ffmpeg`), sin `views.json`, el mismo comando genera un giro continuo y el visor pasa a arrastre fino.

**Para agregar un modelo:** crea su entrada en `hero-models.json` (colores), sus fotos y `views.json` en `archive/spin-src/<modelo>/`, corre `npm run spin -- <modelo>` y añade el producto en `storeData.ts`.

## Modelos 3D (giro libre con el mouse)

El hero ya trae el visor 3D (`Shoe3D.tsx`, basado en `<model-viewer>`): se gira en todas las direcciones con el mouse o el dedo (incluso desde abajo), con giro automático al inicio y sin zoom con la rueda (para no bloquear el scroll). **Se activa solo en los modelos que tengan un `.glb`**: ese modelo se muestra en 3D en lugar del giro por scroll. Si un modelo 3D falla, el hero vuelve a las fotos sin romper el sitio.

**Hoy ningún modelo tiene `.glb`**: un giro libre necesita un modelo 3D, no se puede hacer con fotos sueltas. Para activarlo en un modelo:
1. Conseguir el `.glb` de la zapatilla (ver opciones abajo).
2. `npm run model3d -- <modelo> C:\ruta\zapatilla.glb` (reduce polígonos a ~80 000 y comprime texturas; objetivo < 3 MB).
3. Listo: el hero lo usa de inmediato.

**Cómo conseguir el .glb (de mejor a más rápido):**
- **Fotogrametría con el celular** (Polycam, KIRI Engine, Luma): 60–100 fotos alrededor de la zapatilla real, fondo liso y luz pareja. Es el resultado más fiel al producto.
- **Archivo 3D de la fábrica** (diseño/CAD del modelo): si Punto Original lo tiene, es lo ideal.
- **Servicios de imagen a 3D con IA** (Tripo, Meshy, Hunyuan3D, Rodin): se suben las vistas de `archive/spin-src/<modelo>/` y se descarga el `.glb`. Es lo más rápido para una demo; la calidad es media y la parte trasera la inventa la IA.

## Administración de productos

El candado junto al botón de WhatsApp abre el **panel de administración** en una **pestaña nueva** (página propia en `/admin`, con barra lateral, resumen, búsqueda y filtros): crear, editar, ocultar, reordenar, duplicar y eliminar productos (nombre, código, precio, etiqueta, descripción, tallas, características, colores, foto y combo). Los cambios se ven al instante; si la tienda está abierta en otra pestaña, se actualiza sola.

**Seguridad.** El sitio es estático, así que el candado solo abre la pantalla de acceso: quien manda es la base de datos (Supabase).
- Cualquiera puede *leer* los productos visibles. Para *crear, cambiar, borrar o subir fotos* hay que haber iniciado sesión con una cuenta que figure en la tabla `admins` (reglas RLS + función `es_admin()`). Se comprobó que una cuenta normal, un visitante o alguien con el código del sitio no pueden modificar nada.
- La tabla `admins` y la función `hacer_admin()` no son accesibles desde internet.
- Las fotos se guardan en el bucket público `productos` (solo el admin escribe; máx. 1 MB; solo imágenes). El panel las reduce a 900 px y las convierte a WebP antes de subirlas.
- La sesión se comparte entre las pestañas del panel y se cierra con “Cerrar sesión” o tras 60 minutos sin actividad. Los datos tienen validaciones también en el servidor (precio, longitudes, imagen obligatoria).

**Cuenta de administrador.** Ya existe (usquizafranquer@gmail.com). Se creó con una contraseña **temporal** que se entregó aparte (no se guarda en el código): mientras siga siendo la temporal, la base de datos no le da ningún permiso de escritura y el panel obliga a elegir una nueva en el primer ingreso. Después se puede cambiar cuando se quiera con el botón "Cambiar contraseña" del panel (pide la actual, exige 10+ caracteres con letras y números, y cierra las demás sesiones).

**Agregar otro administrador:**
1. Supabase > Authentication > Users > **Add user** > *Create new user*: correo + contraseña larga, con **Auto Confirm User** marcado.
2. Supabase > SQL Editor: `select public.hacer_admin('otro-correo@ejemplo.com');`

Para quitar a un admin: borrar su fila en la tabla `admins`. Recomendado: en Supabase > Authentication > Sign In / Providers, desactivar **Allow new users to sign up** (nadie más podrá registrarse).

**Qué cubre y qué no.**
- Cubre todo el catálogo. Un producto puede usar las imágenes de un modelo que ya viene con el sitio (cambian con el color) o una foto propia (se ve igual en todos los colores).
- No cubre el hero (los 3 modelos con ángulos y 3D) ni los textos legales: eso se cambia en el código. Un modelo nuevo con visor de ángulos requiere `npm run spin`.
- Si Supabase no responde (por ejemplo, el plan gratuito pausa el proyecto tras 7 días sin actividad), la tienda muestra el catálogo de respaldo de `storeData.ts` y el panel no podrá guardar.

## Libro de Reclamaciones (Supabase)

- Las hojas se guardan en el proyecto Supabase `chavez-originals` (tabla `reclamaciones`). El número de hoja (`REC-2026-0001`, `QUE-2026-0001`) lo asigna el servidor.
- **Para ver los reclamos:** Supabase > Table Editor > `reclamaciones` (se puede cambiar `estado` y escribir la `respuesta`). Desde internet la tabla **no se puede leer**: solo la función `registrar_reclamo` puede escribir.
- Protecciones: RLS sin políticas públicas, validación de datos en el servidor, límite de 5 envíos por hora por conexión (se guarda solo un hash de la IP) y campo trampa contra bots.
- Si el servidor no responde, el formulario entrega un número `PROV-…` y la hoja se envía por WhatsApp o correo.
- Configuración: copia `.env.example` como `.env.local`. Al desplegar, define `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY` en el hosting.
- El esquema está en las migraciones del proyecto Supabase (`libro_de_reclamaciones` y `reclamos_solo_anon_ejecuta`).

## Pendiente de confirmar por el negocio

- Desactivar el registro público en Supabase (Authentication > Sign In / Providers > Allow new users to sign up).
- RUC y correo en `storeData.ts` (marcados con `TODO`).
- Las imágenes de producto son generadas con IA: confirmar que coinciden con los productos reales (logos, colores, diseño).
- Los colores son recoloreados digitalmente, no fotos del producto real.
- Textos legales (Términos, Privacidad, Garantías): base para revisión de un asesor.
