// Elemento web <model-viewer> (Google): visor 3D con órbita libre. Se carga de forma perezosa en Shoe3D.tsx.
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        [attribute: string]: unknown;
      };
    }
  }
}
