/**
 * hooks/useApi.js
 * 
 * Placeholder custom hook for data fetching.
 * Expand this when you start building features.
 */
import { useState, useEffect } from 'react';
import client from '../api/client';

const useApi = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) return;
    setLoading(true);
    client
      .get(path)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [path]);

  return { data, loading, error };
};

export default useApi;
