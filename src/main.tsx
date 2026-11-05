import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { initSmoothScroll } from './lib/smoothScroll';

initSmoothScroll();

createRoot(document.getElementById('root')!).render(<App />);
