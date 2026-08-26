const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const fetchWithToken = async (path, options = {}, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'API Error';
    try {
      const err = await response.json();
      message = err.message || message;
    } catch (e) {}
    throw new Error(message);
  }

  return response.json();
};

const client = {
  get: (path, token) => fetchWithToken(path, { method: 'GET' }, token),
  post: (path, body, token) => fetchWithToken(path, { method: 'POST', body: JSON.stringify(body) }, token),
  put: (path, body, token) => fetchWithToken(path, { method: 'PUT', body: JSON.stringify(body) }, token),
  delete: (path, token) => fetchWithToken(path, { method: 'DELETE' }, token),
};

export default client;
