import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

// Generic API hook for data fetching
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {                               //This runs when the component mounts or when any dependency changes (you pass them in the dependencies array).
    let isMounted = true;                         //Local flag to track if the component is still on the screen. Helps avoid updating state after the component is gone (unmounted).

    const fetchData = async () => {               //You define an async function that: Calls the API, Updates the UI with data, Handles loading and error states
      try {
        setLoading(true);                         // 🔄 Start loader/spinner
        setError(null);                           // Reset errors
        const response = await apiFunction();     // Wait for API call

        if (isMounted) {
          setData(response);                      // ✅ Only update state if still mounted
        }
      } catch (err) {
        if (isMounted) {
          setError(err);                         // Show error only if mounted
        }
      } finally {
        if (isMounted) {
          setLoading(false);                    // Stop loading spinner
        }
      }
    };

    fetchData();                               // Call it immediately after effect starts

    return () => {
      isMounted = false;                       //This is the cleanup function. It runs when the component unmounts, or before the next effect runs again. This sets isMounted = false, which tells fetchData() not to update state anymore.
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction();
      setData(response);   // 🔁 No isMounted check here because this is manual and user-initiated
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

      //You're making an API call using an apiFunction, and you're passing in a set of merged parameters for filtering, pagination, and defaults.
      const response = await apiFunction({        //You're calling an async API function, and await waits for the response before continuing.
        ...initialParams,                         //This spreads default parameters first. Example: { sort: "createdAt", order: "desc" }
        ...params,                                //Then it overrides or adds more specific parameters passed at the time of function call. Example: If someone called refetch({ sort: "title" }), this will override sort.
        page: state.pagination.current,           //It includes the current page number from your app state.
        limit: state.pagination.limit,            //It includes the limit from your app state.
        ...state.filters,                         //Appends search/filter values, like: menuType, isEnabled, keyword, etc.
      });

      if (response.success) {
        setData(response.data);                   //Saves the response data into a local state (setData)
        actions.setPagination(response.pagination); //Updates the pagination details like current page, total pages, total records, etc.
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
export const useApiMutation = () => {            //Your custom hook useApiMutation is a clean and reusable abstraction for handling asynchronous API calls in a React component. It manages loading and error states internally, which helps reduce boilerplate in components.
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
