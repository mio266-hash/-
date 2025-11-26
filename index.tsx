import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Runtime Polyfill ---
// This prevents "ReferenceError: process is not defined" crashes in the browser
// which often happen when using libraries like @google/genai or accessing process.env
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}
// ------------------------

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);