
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element
const rootElement = document.getElementById('root');

// Check if rootElement exists to prevent null errors
if (!rootElement) {
  console.error('Root element not found. Make sure there is a div with id="root" in your HTML.');
} else {
  // Create root and render the app
  const root = createRoot(rootElement);
  root.render(<App />);
}
