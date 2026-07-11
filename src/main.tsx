import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuroraDB } from './db/mockDb';

(async () => {
  try {
    await AuroraDB.init();
  } catch (e) {
    console.error("Initialization error:", e);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
})();
