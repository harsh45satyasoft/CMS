import React, { createContext, useContext, useReducer } from "react";

const AppContext = createContext();

const initialState = {
  pages: [],
  menuTypes: [],
  loading: false,
  error: null,
  selectedPage: null,
  filters: {
    search: "",
    menuType: "",
    enabled: "",
  },
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
};

const actionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_PAGES: "SET_PAGES",
  SET_MENU_TYPES: "SET_MENU_TYPES",
  SET_SELECTED_PAGE: "SET_SELECTED_PAGE",
  SET_FILTERS: "SET_FILTERS",
  SET_PAGINATION: "SET_PAGINATION",
  ADD_PAGE: "ADD_PAGE",
  UPDATE_PAGE: "UPDATE_PAGE",
  DELETE_PAGE: "DELETE_PAGE",
  CLEAR_ERROR: "CLEAR_ERROR",
};

const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    case actionTypes.SET_PAGES:
      return { ...state, pages: action.payload, loading: false };

    case actionTypes.SET_MENU_TYPES:
      return { ...state, menuTypes: action.payload };

    case actionTypes.SET_SELECTED_PAGE:
      return { ...state, selectedPage: action.payload };

    case actionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case actionTypes.SET_PAGINATION:
      return { ...state, pagination: action.payload };

    case actionTypes.ADD_PAGE:
      return { ...state, pages: [action.payload, ...state.pages] };

    case actionTypes.UPDATE_PAGE:
      return {
        ...state,
        pages: state.pages.map((page) =>
          page._id === action.payload._id ? action.payload : page
        ),
        selectedPage: action.payload,
      };

    case actionTypes.DELETE_PAGE:
      return {
        ...state,
        pages: state.pages.filter((page) => page._id !== action.payload),
        selectedPage: null,
      };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setLoading: (loading) =>
      dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setError: (error) =>
      dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),
    setPages: (pages) =>
      dispatch({ type: actionTypes.SET_PAGES, payload: pages }),
    setMenuTypes: (menuTypes) =>
      dispatch({ type: actionTypes.SET_MENU_TYPES, payload: menuTypes }),
    setSelectedPage: (page) =>
      dispatch({ type: actionTypes.SET_SELECTED_PAGE, payload: page }),
    setFilters: (filters) =>
      dispatch({ type: actionTypes.SET_FILTERS, payload: filters }),
    setPagination: (pagination) =>
      dispatch({ type: actionTypes.SET_PAGINATION, payload: pagination }),
    addPage: (page) => dispatch({ type: actionTypes.ADD_PAGE, payload: page }),
    updatePage: (page) =>
      dispatch({ type: actionTypes.UPDATE_PAGE, payload: page }),
    deletePage: (pageId) =>
      dispatch({ type: actionTypes.DELETE_PAGE, payload: pageId }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export default AppContext;