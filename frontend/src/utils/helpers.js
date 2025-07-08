import { format } from "date-fns";

// Date formatting utilities
export const formatDate = (date, formatString = "MMM dd, yyyy") => {
  if (!date) return "";
  return format(new Date(date), formatString);
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return format(new Date(date), "MMM dd, yyyy 'at' hh:mm a");
};

// String utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";                                      // Handle null/undefined/empty
  if (text.length <= maxLength) return text;                 // No truncation needed
  return text.substring(0, maxLength) + "...";               // Truncate and add "..."
};

export const capitalizeFirst = (str) => {                    // Capitalize first letter(hello world => Hello World)
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);         // Capitalize 1st char, append rest
};

export const slugify = (text) => {                           //Converts any text (like "About Us Page!") into a URL-safe string (like "about-us-page").
  if (!text) return "";
  return text
    .toLowerCase()                        // Make everything lowercase
    .replace(/[^a-z0-9\s-]/g, "")         // Remove non-alphanumeric characters(special chars) except spaces and hyphens
    .replace(/\s+/g, " ")                 // Replace multiple spaces with a single space
    .replace(/\s+/g, "-")                 // Replace spaces with hyphens
    .replace(/-+/g, "-")                  // Replace multiple hyphens with a single hyphen
    .trim("-");                           // Trim hyphens from start and end
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url) => {         //new URL(url), Built-in browser/Node.js constructor, Throws an error if the string isn’t a proper URL.
  try {
    new URL(url);                            // Tries to parse the string as a URL
    return true;                             // If successful, it's a valid URL
  } catch {
    return false;                            // If it throws an error, it's invalid
  }                                          //isValidUrl("https://google.com"): true/ isValidUrl("hello world"): false/ isValidUrl("http://localhost:3000"): true
};

export const isValidSlug = (slug) => {      //To validate a slug (URL-friendly string) — making sure it only contains:Lowercase letters(a–z)/Numbers(0–9)/Hyphens(-)
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);              //It tests whether the input string (slug) matches the pattern defined in the regular expression slugRegex
};                                          //.test() method is used with regular expressions to check if a pattern matches a string.

// Array utilities
export const sortBy = (array, key, direction = "asc") => {  // Sorts an array of objects by a specific key in ascending or descending order
  return [...array].sort((a, b) => {             // Creates a shallow copy of the array to avoid mutating the original
    const aVal = a[key];                         // Get the value of the key in object a
    const bVal = b[key];                         // Get the value of the key in object b

    if (direction === "desc") {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;  //If aVal is less than bVal, return 1 → move a after b/If aVal is greater than bVal, return -1 → move a before b/If equal, return 0 → no change(desc)
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;    //If aVal is greater than bVal, return 1 → move a after b/If aVal is less than bVal, return -1 → move a before b/If equal, return 0(asc)
  });
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// Object utilities
export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

export const pick = (obj, keys) => {
  const result = {};
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Form utilities
export const generateFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

export const serializeForm = (formElement) => {
  const formData = new FormData(formElement);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
};

// Error handling utilities
export const getErrorMessage = (error) => {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  return "An unexpected error occurred";
};

export const handleApiError = (error) => {
  const message = getErrorMessage(error);
  console.error("API Error:", error);
  return message;
};

// Number utilities
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return "";
  return Number(num).toFixed(decimals);
};

export const formatCurrency = (amount, currency = "USD") => {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Color utilities
export const getStatusColor = (status) => {
  const colors = {
    active: "green",
    inactive: "red",
    enabled: "green",
    disabled: "red",
    published: "green",
    draft: "yellow",
    pending: "yellow",
    approved: "green",
    rejected: "red",
  };
  return colors[status?.toLowerCase()] || "gray";
};

// File utilities
export const getFileExtension = (filename) => {
  if (!filename) return "";
  return filename.split(".").pop().toLowerCase();
};

export const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Query string utilities
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (let [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
};

export const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (
      params[key] !== null &&
      params[key] !== undefined &&
      params[key] !== ""
    ) {
      queryParams.append(key, params[key]);
    }
  });
  return queryParams.toString();
};

// Random utilities
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateRandomString = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};