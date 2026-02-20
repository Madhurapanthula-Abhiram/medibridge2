// Diagnostic utilities
export const logAppStatus = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = '[MediBridge]';
  const color = {
    'info': 'color: #00d4aa',
    'warn': 'color: #f59e0b',
    'error': 'color: #ec4899',
    'success': 'color: #00d4aa'
  }[type] || 'color: #a0a0b0';

  console.log(`%c${prefix} [${timestamp}] ${message}`, color);
};

export const checkRequiredEnvVars = () => {
  const required = ['VITE_API_URL'];
  const missing = required.filter(v => !import.meta.env[v]);
  
  if (missing.length > 0) {
    logAppStatus(`Missing env vars: ${missing.join(', ')}`, 'warn');
    return false;
  }
  
  logAppStatus(`Environment variables loaded successfully`, 'success');
  return true;
};

export const checkDOMReady = () => {
  const root = document.getElementById('root');
  if (!root) {
    logAppStatus('Root element not found!', 'error');
    return false;
  }
  logAppStatus('Root element is ready', 'success');
  return true;
};

export const performHealthCheck = () => {
  logAppStatus('=== MediBridge Health Check ===', 'info');
  
  // Check React root
  checkDOMReady();
  
  // Check environment
  checkRequiredEnvVars();
  
  // Check API connectivity (non-blocking)
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    fetch(`${apiUrl}/health`, { method: 'GET', timeout: 3000 })
      .then(res => res.ok ? logAppStatus('API is reachable', 'success') : logAppStatus('API returned non-OK status', 'warn'))
      .catch(err => logAppStatus(`API unreachable: ${err.message}`, 'warn'));
  }
  
  logAppStatus('=== Health Check Complete ===', 'info');
};
