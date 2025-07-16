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

//This groupBy function is a utility function that takes an array of objects and groups them based on a specific key
export const groupBy = (array, key) => {     //Each key is a unique value from the specified key field in the array.Each value is an array of objects that share that key.(array: an array of objects, key: the field name you want to group by)
  return array.reduce((groups, item) => {    //Uses .reduce() to build up a new object (groups).
    const group = item[key];                 //Grabs the value from the current item using the provided key.
    groups[group] = groups[group] || [];     //If this group doesn't exist yet, initialize it as an empty array.
    groups[group].push(item);                //Push the current item into its appropriate group.
    return groups;                           //Return the built-up groups object.
  }, {}); 
};

// Object utilities, To exclude certain fields from an object — especially useful before sending data to a client or saving to a database.
export const omit = (obj, keys) => {         //Takes two parameters: obj: the original object &b keys: an array of keys to remove (e.g., ["password", "token"])
  const result = { ...obj };                 //Creates a shallow copy of the original object so we don't mutate it.
  keys.forEach((key) => delete result[key]); //Loops through all keys you want to remove. Uses delete to remove each from the copied object.
  return result;                             //Returns the cleaned object.
}; 

//To extract a subset of fields from an object. The pick function is the opposite of omit. It creates a new object containing only the specified keys from the original object.
export const pick = (obj, keys) => {        // Takes an object and an array of keys, returning a new object with only those keys.
  const result = {};                        //Initialize an empty result object.
  keys.forEach((key) => {
    if (key in obj) {                       //Loop through each key in the keys array.
      result[key] = obj[key];               //If the key exists in the original object (obj), copy it to result.
    }
  });
  return result;
};

// Storage utilities, This getFromStorage function is a safe and reusable way to read data from localStorage, with automatic JSON parsing and error fallback.
export const getFromStorage = (key, defaultValue = null) => {  //key: the key to retrieve from localStorage, defaultValue: the fallback value if the key is missing or invalid (defaults to null)
  try {
    const item = localStorage.getItem(key);                    //Tries to retrieve the string value from localStorage.
    return item ? JSON.parse(item) : defaultValue;             //If item exists: Attempts to parse it as JSON (e.g., a saved object or array). If item is null, return defaultValue.
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
};

//To store any value (string, object, array, number, etc.) into localStorage under a specific key.
export const setToStorage = (key, value) => {                //key: the name under which the data will be stored in localStorage & value: the actual data to store (can be any JavaScript type)
  try {
    localStorage.setItem(key, JSON.stringify(value));        //Converts the value to a JSON string, because localStorage only stores strings. Then saves it under the given key.
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
};

//Your removeFromStorage function is perfect for safely deleting a specific key from localStorage. Here's a clear breakdown:
export const removeFromStorage = (key) => {                //Accepts a single argument: key — the identifier of the item to remove.
  try {
    localStorage.removeItem(key);                          //Removes the item associated with the key from localStorage. If the key doesn’t exist, nothing happens (no error is thrown).
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};

// Debounce utility,The debounce function is a performance optimization technique that delays executing a function until after a certain amount of time has passed since the last time it was called.
export const debounce = (func, wait) => {             //func: the actual function you want to delay & wait: time to wait (in ms) after the last call
  let timeout;                                        //Stores a timeout ID to track the scheduled function execution.
  return function executedFunction(...args) {         //Returns a new function that wraps your original one. Accepts any arguments ...args passed in.
    const later = () => {                             //later is what runs after the wait period. Clears any pending timeouts just before calling func.
      clearTimeout(timeout);                          //If the function was called again before the wait time is over, cancel the previous timer.
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);                //Start a new timer. If no calls come in before wait ms, func runs.
  };
};

// Throttle utility, Throttle ensures a function is only called once every limit milliseconds, no matter how many times it's triggered during that time.
export const throttle = (func, limit) => {         //func: the function to throttle & limit: the minimum time (in ms) between calls
  let inThrottle;                                  //A flag to keep track of whether the function is currently throttled.
  return function (...args) {                      //Returns a new function that wraps func and controls its execution. Uses rest parameters to accept any number of arguments.
    if (!inThrottle) {                             //If not in a throttled state, allow func to run.
      func.apply(this, args);                      //Call func with the provided context (this) and arguments (args).
      inThrottle = true;                           //Set the flag to true to indicate that the function is currently throttled.(Enter throttled state, preventing further calls for limit ms.)
      setTimeout(() => (inThrottle = false), limit);//After limit (in ms), allow the function to be called again.
    }
  };
};

// Form utilities, The generateFormData function is a utility that helps you convert a regular JavaScript object into a FormData object, which is especially useful when submitting forms — particularly when files are involved.
// To create a FormData instance from a plain object so it can be used in HTTP requests (like POST or PUT) to submit form data including:Text fields,Files,Other form inputs
export const generateFormData = (data) => {                //Takes a plain object data (key-value pairs).Example: { name: "John", age: 25, file: File }
  const formData = new FormData();                         //Creates a new FormData instance
  Object.keys(data).forEach((key) => {                     //Loops through each key in the data object
    if (data[key] !== null && data[key] !== undefined) {   //Skips any key that has a value of null or undefined.
      formData.append(key, data[key]);                     //Appends the key-value pair to the FormData instance(object)
    }
  });
  return formData;
};

//The serializeForm function is a utility to convert an HTML <form> element into a plain JavaScript object — making it easier to work with form data in JavaScript (especially for APIs).
export const serializeForm = (formElement) => {     //Accepts a DOM form element (<form> tag). Example usage: serializeForm(document.querySelector("form"))
  const formData = new FormData(formElement);       //Creates a FormData object from the form. Automatically collects all <input>, <select>, <textarea>, and file inputs that have a name attribute.
  const data = {};                                  //Initializes an empty object to store the results.
  for (let [key, value] of formData.entries()) {    //Iterates over each key/value pair from the form: formData.entries() gives you [name, value] pairs. Adds each to the data object.
    data[key] = value;
  }
  return data;                          //Returns the final object with all form values.
};

// Error handling utilities
//The getErrorMessage function is a utility designed to extract a human-readable error message from different types of error objects
export const getErrorMessage = (error) => {                              //Takes in an error (can be string, object, or anything).
  if (typeof error === "string") return error;                           //If the error is already a plain string (e.g., "Invalid input"), return it directly.
  if (error?.message) return error.message;                              //If it's an Error object (e.g., new Error("Something broke")), return its message.
  if (error?.response?.data?.message) return error.response.data.message;//This is common with Axios HTTP errors, where the backend sends an error message like:{"message": "Invalid credentials"}
  if (error?.response?.data?.error) return error.response.data.error;    //Some APIs use the key error instead of message, so this covers those cases.
  return "An unexpected error occurred";                                 //Fallback in case nothing matched above — gives a safe, default message.
};

//The handleApiError function is a simple and effective helper for dealing with errors from API calls — especially in frontend applications like React 
export const handleApiError = (error) => {    //The function takes in an error object — often returned by fetch, axios, etc.
  const message = getErrorMessage(error);     //Calls your previously defined getErrorMessage(error) function.This extracts the most relevant and human-readable error message
  console.error("API Error:", error);         //Logs the full error object to the browser console.Useful for debugging — especially when message isn't enough.
  return message;                             //Returns the clean error message so it can be shown in the UI or passed up the chain.
};

// Number utilities
//The formatNumber function is a simple utility for formatting a number to a fixed number of decimal places.
export const formatNumber = (num, decimals = 0) => {     //num: the number to format. decimals: how many digits to keep after the decimal point (default is 0).
  if (num === null || num === undefined) return "";      //If num is not provided (null or undefined), return an empty string instead of throwing an error.
  return Number(num).toFixed(decimals);                  //Converts num to a Number and uses .toFixed() to format it to the specified number of decimals. Returns a string (because .toFixed() always returns a string).
};

//The formatCurrency function is a great way to format numbers as localized currency strings using the built-in Intl.NumberFormat API.
//To convert a number (amount) into a properly formatted currency string like: $1,000.00
export const formatCurrency = (amount, currency = "USD") => {  //amount: the numeric value to format, currency: a 3-letter ISO currency code ("USD", "INR", "EUR", etc.)
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("en-US", {                      //Uses Intl.NumberFormat to format the number based on: "en-US" locale 
    style: "currency",                                         //style: "currency" tells it to include the currency symbol.
    currency: currency,                                        //currency sets which currency format to use.
  }).format(amount);                                           //.format(amount) returns the formatted string.
};

// Color utilities, The getStatusColor function maps a status string (like "active" or "pending") to a corresponding color name, typically for use in UI indicators (badges, labels, icons, etc.).
export const getStatusColor = (status) => {   //A utility function that takes a status string.
  const colors = {                            //Maps status strings to color names.
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
  return colors[status?.toLowerCase()] || "gray";  //Ensures: Case-insensitive match using status?.toLowerCase(), Safe access (?.) prevents crash if status is undefined or null, If status is not found, fallback color is "gray" (default/neutral).
};

// File utilities
//The getFileExtension function extracts the file extension (like pdf, jpg, docx) from a given filename.
export const getFileExtension = (filename) => {       //The function takes one argument: a filename as a string (e.g., "report.pdf").
  if (!filename) return "";                           //If the input is null, undefined, or empty, return an empty string (safe fallback).
  return filename.split(".").pop().toLowerCase();     //filename.split(".") splits the string at every . into an array. "report.final.pdf" → ["report", "final", "pdf"], .pop() gets the last item (the actual extension), .toLowerCase() ensures it's lowercase regardless of input ("JPG" → "jpg")
};

//The formatFileSize function converts a file size in bytes into a human-readable format (like 1.45 MB, 256 KB, etc.).
export const formatFileSize = (bytes) => {       //Accepts the file size in bytes (a number like 1234567).
  if (!bytes) return "0 Bytes";                  //If the input is null, undefined, or 0, return "0 Bytes".

  const k = 1024;                                //Sets the base unit: 1 KB = 1024 Bytes.
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]; //Sets the possible units of measurement.
  const i = Math.floor(Math.log(bytes) / Math.log(k));  //Uses logarithms to determine the appropriate size unit index: Math.log(bytes) gives log base e, Dividing by Math.log(1024) gives log base 1024, Math.floor(...) rounds down to nearest size category, For example, if bytes = 1048576 → i = 2 (which means MB)

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];//Converts bytes to the correct size (KB, MB, etc.), .toFixed(2) formats it to 2 decimal places, parseFloat(...) removes any trailing zeros ("1.00" → 1), Adds the appropriate size label from sizes(ex. formatFileSize(500)->"500 Bytes" & formatFileSize(2048)->"2 KB")
};

// Query string utilities
//The parseQueryString function converts a URL query string into a plain JavaScript object, making it easy to work with query parameters.(ex. "?page=2&limit=10&search=hello", turn it into js {page: "2",limit: "10",search: "hello"})
export const parseQueryString = (queryString) => {  //This function accepts a string, usually something like "?key=value&key2=value2".
  const params = new URLSearchParams(queryString);  //URLSearchParams is a built-in browser API that parses query strings.It handles decoding (%20 → space) and multiple parameters automatically.
  const result = {};                                //Initializes an empty object to store key-value pairs.
  for (let [key, value] of params.entries()) {      //Iterates through each entry in the query string and adds it to the result object. params.entries() gives you key-value pairs.
    result[key] = value;
  }
  return result;                                    //Returns the final parsed object.
};

//The buildQueryString function helps you turn a JavaScript object into a valid query string — the opposite of parseQueryString. (EX. To convert this js: { page: 2, limit: 10, search: "hello" } Into this: "page=2&limit=10&search=hello")
export const buildQueryString = (params) => {  //Accepts an object params where keys and values represent query parameters.
  const queryParams = new URLSearchParams();   //Creates a new instance of the browser-native URLSearchParams object.
  Object.keys(params).forEach((key) => {       //Loops through each key in the object.
    if (
      params[key] !== null &&                  //Skips parameters that are: null, undefined, empty strings (""). This avoids sending unnecessary or empty query parameters.
      params[key] !== undefined &&
      params[key] !== ""
    ) {
      queryParams.append(key, params[key]);   //Appends valid key-value pairs to the queryParams object.
    }
  });
  return queryParams.toString();             //Converts the parameters into a properly encoded query string (e.g., ?key1=value1&key2=value2 without the ?)
};

// Random utilities
//These two functions — generateId and generateRandomString — help generate random, unique-looking strings, often used for IDs, tokens, or filenames.
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);   //Math.random() generates a number like 0.123456789., .toString(36) converts it to base-36 (i.e. using 0–9 + a–z). Example: 0.123456 → "0.xtyz2wl9v", .substr(2, 9) skips the "0." and takes 9 characters from the result.
};

//Your function generateRandomString works perfectly for generating a random alphanumeric string. Here's a clear breakdown of what it does and how you can tweak it if needed:
export const generateRandomString = (length = 10) => {                //You can specify how long you want the output string to be. Default is 10 
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // Contains all uppercase letters, lowercase letters, and digits (A–Z, a–z, 0–9).
  let result = "";
  for (let i = 0; i < length; i++) {                                  //Loop – Runs length times.
    result += chars.charAt(Math.floor(Math.random() * chars.length)); //Math.random() and Math.floor() – Used to pick a random character index from chars.result += ... – Builds up the random string one character at a time.
  }
  return result;                                      //Return – Returns the final string.
};