// Função para decodificar JWT (não valida assinatura, apenas lê o payload)
export function decodeJWT(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Função para checar se o token está expirado
export function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  // exp é em segundos
  return Date.now() >= payload.exp * 1000;
}
