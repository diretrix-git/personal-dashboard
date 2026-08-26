/**
 * api/client.js
 * 
 * Central Axios (or fetch) client for talking to the Express backend.
 * Replace this stub with a real configured instance when you start
 * building features.
 * 
 * Example upgrade:
 *   import axios from 'axios';
 *   const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
 *   export default api;
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Minimal fetch wrapper — swap for axios later if preferred
const client = {
  get: (path) => fetch(`${BASE_URL}${path}`).then((r) => r.json()),
  post: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
};

export default client;
