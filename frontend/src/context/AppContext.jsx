import React, { createContext, useContext, useReducer } from "react";

const AppContext = createContext();

const initialState = {
  pages: [],           // List of CMS pages
  menuTypes: [],       // List of available menu types
  loading: false,
  error: null,         // Holds error messages or objects
  selectedPage: null,  // Currently viewed or edited page
  filters: {
    search: "",
    menuType: "",
    enabled: null,     // or true/false
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

//The reducer must return a brand‑new state object every time something changes (immutability). That’s why you see lots of spread syntax ({ …state, … })
const appReducer = (state, action) => {              //state – the current global state held in a React Context, action – an object with at least a type key and usually a payload
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };  //	Turn the (loading)spinner on/off. payload is a boolean.

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false }; //	Store an error message (and stop the spinner).

    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };              //Remove any error currently shown.

    case actionTypes.SET_PAGES:
      return { ...state, pages: action.payload, loading: false }; //Bulk‑replace the pages list with new data (e.g. after a fetch). Also stops loading.

    case actionTypes.SET_MENU_TYPES:
      return { ...state, menuTypes: action.payload }; //Replace the menuTypes array (used in dropdowns, etc.).

    case actionTypes.SET_SELECTED_PAGE:
      return { ...state, selectedPage: action.payload }; //Store the page object the user is currently viewing/editing.

    case actionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } }; //Merge new filter values into the existing filters object (does not overwrite unspecified keys).

    case actionTypes.SET_PAGINATION:
      return { ...state, pagination: action.payload };  //Replace the entire pagination object (page #, page count, etc.).

    case actionTypes.ADD_PAGE:
      return { ...state, pages: [action.payload, ...state.pages] }; //Add a newly created page to the top of the list.

    case actionTypes.UPDATE_PAGE:
      return {
        ...state,                                                   //Keeps all the other state properties as they are (nothing else changes).
        pages: state.pages.map((page) =>                            //Replace one page in the list and set it as selectedPage.
          page._id === action.payload._id ? action.payload : page   //Goes through every page in the pages array. If the page._id matches the action.payload._id (the updated page), it replaces it. If not, it keeps the page unchanged.
        ),
        selectedPage: action.payload,                               //Sets the updated page as the currently selected one (selectedPage).
      };

    case actionTypes.DELETE_PAGE:
      return {                                               //Remove a page from the list and clear selectedPage if it was deleted.
        ...state,                                            //Keeps the rest of the state unchanged (preserves things like loading, filters, etc.).
        pages: state.pages.filter((page) => page._id !== action.payload),  //Goes through every page in the list. Keeps only the pages whose _id is not equal to the one being deleted (action.payload). This effectively removes the deleted page from the list.
        selectedPage: null,                                  //Resets the currently selected page. It's common to clear selectedPage after deletion because the deleted page no longer exists.
      };

    default:
      return state;                                //If an unknown action.type arrives, the default branch simply returns the unchanged state.
  }
};

export const AppProvider = ({ children }) => {     //A React component that: Holds global app state (pages, loading, error, etc.), Provides a set of dispatchable actions, Uses useReducer() to manage complex state transitions, Wraps your app with <AppContext.Provider>
  const [state, dispatch] = useReducer(appReducer, initialState); //appReducer is your reducer function. initialState is your default app state (e.g., { pages: [], loading: false, ... }). dispatch is how you update state (via action objects).

  const actions = {                                //Calls dispatch() with a type and payload. Triggers a matching case in appReducer
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

  return (                    //Makes state and actions available to any component that uses useContext(AppContext). children means anything nested inside this provider in your app.
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