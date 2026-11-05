import React, { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Rotate3d } from 'lucide-react';

interface Shoe3DProps {
  /** Archivo .glb del modelo. */
  src: string;
  /** Imagen que se muestra mientras carga el modelo. */
  poster: string;
  alt: string;
  /** Color (hex) para teñir el modelo; null = colores originales. */
  tint: string | null;
  /** Se llama si el modelo no se puede cargar (el hero vuelve a las fotos). */
  onError: () => void;
}

interface ModelViewerEl extends HTMLElement {
  model?: {
    materials: { isLoaded?: boolean; pbrMetallicRoughness: { setBaseColorFactor: (c: string) => void } }[];
  };
}

/** Si el visor 3D falla por cualquier motivo, solo se vuelve a las fotos: nunca se cae el sitio. */
class Shoe3DBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Zapatilla en 3D: se gira libremente con el mouse o el dedo en todas las direcciones
 * (incluso desde abajo). Sin zoom con la rueda, para no bloquear el scroll de la página.
 * <model-viewer> se descarga solo cuando un modelo tiene .glb.
 */
const Shoe3DInner: React.FC<Shoe3DProps> = ({ src, poster, alt, tint, onError }) => {
  const ref = useRef<ModelViewerEl | null>(null);
  const [defined, setDefined] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    let alive = true;
    import('@google/model-viewer')
      .then(() => alive && setDefined(true))
      .catch(() => alive && onError());
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!defined || !el) return;
    const onLoad = () => setLoaded(true);
    const onFail = () => onError();
    const onCamera = (e: Event) => {
      if ((e as CustomEvent).detail?.source === 'user-interaction') setTouched(true);
    };
    el.addEventListener('load', onLoad);
    el.addEventListener('error', onFail);
    el.addEventListener('camera-change', onCamera);
    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('error', onFail);
      el.removeEventListener('camera-change', onCamera);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defined]);

  // Tinte de color (el modelo conserva sus texturas; el color se multiplica)
  useEffect(() => {
    if (!loaded) return;
    ref.current?.model?.materials.forEach((m) => {
      try {
        if (m.isLoaded === false) return; // variantes de material que el modelo no está usando
        m.pbrMetallicRoughness.setBaseColorFactor(tint ?? '#ffffff');
      } catch {
        /* material no disponible: se deja con su color original */
      }
    });
  }, [tint, loaded]);

  return (
    <div className="relative w-full h-full">
      {defined && (
        <model-viewer
          ref={ref}
          src={src}
          alt={alt}
          camera-controls=""
          disable-zoom=""
          disable-pan=""
          auto-rotate=""
          auto-rotate-delay="2500"
          rotation-per-second="16deg"
          interaction-prompt="none"
          touch-action="pan-y"
          camera-orbit="35deg 76deg auto"
          min-camera-orbit="-Infinity 0deg auto"
          max-camera-orbit="Infinity 180deg auto"
          field-of-view="28deg"
          environment-image="neutral"
          exposure="1.05"
          shadow-intensity="0.9"
          shadow-softness="1"
          style={{ width: '100%', height: '100%', background: 'transparent', outline: 'none', cursor: 'grab' }}
        />
      )}
      {!loaded && (
        <img
          src={poster}
          alt={alt}
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-80"
        />
      )}
      {loaded && !touched && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-xs text-gray-300 pointer-events-none">
          <Rotate3d className="w-3.5 h-3.5 text-[#00ff66]" aria-hidden="true" />
          Arrastra para girar en 3D
        </span>
      )}
    </div>
  );
};

export const Shoe3D: React.FC<Shoe3DProps> = (props) => (
  <Shoe3DBoundary onError={props.onError}>
    <Shoe3DInner {...props} />
  </Shoe3DBoundary>
);
