export const getToken = (): string | null => {
  return localStorage.getItem('cloudStorage_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('cloudStorage_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('cloudStorage_token');
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Check if token is expired (basic check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};