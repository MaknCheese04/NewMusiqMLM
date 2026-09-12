import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Global handler to suppress unhandled rejections from sandboxed storage restrictions & browser extensions
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason || '');
    if (
      msg.includes('Access to storage is not allowed') ||
      msg.includes('Invalid frameId') ||
      msg.includes('storage')
    ) {
      event.preventDefault();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
