// Script para limpar auth data do localStorage no console do navegador
// Execute no console: clearAuth()

function clearAuth() {
  localStorage.removeItem('auth');
  console.log('Auth data cleared from localStorage');
  window.location.reload();
}

// Função para debugar dados atuais
function debugAuth() {
  const authData = localStorage.getItem('auth');
  if (authData) {
    const parsed = JSON.parse(authData);
    console.log('Current auth data:', parsed);

    if (parsed.token) {
      // Decodificar JWT
      const parts = parsed.token.split('.');
      if (parts.length === 3) {
        const payload = parts[1];
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
        const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
        const tokenData = JSON.parse(decodedPayload);
        console.log('Token data:', tokenData);
        console.log('Token expires:', new Date(tokenData.exp * 1000));
      }
    }
  } else {
    console.log('No auth data found');
  }
}

if (typeof window !== 'undefined') {
  window.clearAuth = clearAuth;
  window.debugAuth = debugAuth;
}