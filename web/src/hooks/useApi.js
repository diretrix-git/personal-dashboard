import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import client from '../api/client';

export const useApi = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchData = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      const token = await getToken();
      const result = await client.get(path, token);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [path, getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useMutation = () => {
  const { getToken } = useAuth();
  
  const mutate = async (method, path, body = null) => {
    const token = await getToken();
    if (method === 'delete') {
      return client.delete(path, token);
    }
    return client[method](path, body, token);
  };
  
  return {
    post: (path, body) => mutate('post', path, body),
    put: (path, body) => mutate('put', path, body),
    del: (path) => mutate('delete', path),
  };
};

export default useApi;
