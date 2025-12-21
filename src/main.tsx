import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Changed defaultTheme to "dark" for the classic dark look */}
    <ThemeProvider defaultTheme="dark" storageKey="documorph-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
);
