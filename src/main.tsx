import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initGA } from './utils/ga';

// GA4 Measurement ID (G-XXXXXXXXXX) — set via Vercel env var.
// Absent = analytics stays off, storefront unaffected.
initGA(import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined);

createRoot(document.getElementById('root')!).render(<App />);
