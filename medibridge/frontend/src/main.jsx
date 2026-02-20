import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Simple logger
const log = (msg, type = 'log') => {
  const ts = new Date().toLocaleTimeString();
  console[type](`[MediBridge ${ts}] ${msg}`);
};

log('Starting app initialization...');

// Global error handler
window.addEventListener('error', (event) => {
  log(`Global error: ${event.message}`, 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  log(`Unhandled rejection: ${event.reason}`, 'error');
});

const root = document.getElementById('root');
log(`Root element status: ${root ? 'found' : 'NOT FOUND'}`);

if (!root) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: Root element not found</div>';
} else {
  try {
    log('Mounting React app...');
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>,
    );
    log('App mounted successfully');
  } catch (error) {
    log(`Mount error: ${error.message}`, 'error');
    root.innerHTML = `<div style="color: white; padding: 20px; background: #0a0a0f;">ERROR: ${error.message}</div>`;
  }
}
