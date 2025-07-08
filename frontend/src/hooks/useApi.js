import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

// Generic API hook for data fetching
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction();

        if (isMounted) {
          setData(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction();
      setData(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// Hook for paginated data
export const usePaginatedApi = (apiFunction, initialParams = {}) => {
  const { state, actions } = useAppContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFunction({
        ...initialParams,
        ...params,
        page: state.pagination.current,
        limit: state.pagination.limit,
        ...state.filters,
      });

      if (response.success) {
        setData(response.data);
        actions.setPagination(response.pagination);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    state.pagination.current,
    state.pagination.limit,
    state.filters.search,
    state.filters.menuType,
    state.filters.enabled,
  ]);

  const refetch = () => fetchData();

  return { data, loading, error, refetch, fetchData };
};

// Hook for managing form submissions
export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (apiFunction, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(data);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};

// Hook for delete operations with confirmation
export const useDelete = (apiFunction, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteItem = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(id);

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteItem, loading, error };
};

// Hook for toggle operations (like enable/disable)
export const useToggle = (apiFunction, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(id);

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { toggle, loading, error };
};
