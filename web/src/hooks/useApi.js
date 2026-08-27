import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import client from '../api/client';

export const useApi = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  // Use a ref for getToken to avoid re-triggering the effect on every render
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      const token = await getTokenRef.current();
      const result = await client.get(path, token);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [path]); // BUG-13 fix: removed getToken from deps, use ref instead

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useMutation = () => {
  const { getToken } = useAuth();
  const [mutating, setMutating] = useState(false);
  
  const mutate = async (method, path, body = null) => {
    setMutating(true);
    try {
      const token = await getToken();
      let result;
      if (method === 'delete') {
        result = await client.delete(path, token);
      } else {
        result = await client[method](path, body, token);
      }
      return result;
    } finally {
      setMutating(false);
    }
  };
  
  return {
    mutating,
    post: (path, body) => mutate('post', path, body),
    put: (path, body) => mutate('put', path, body),
    del: (path) => mutate('delete', path),
  };
};

export default useApi;
