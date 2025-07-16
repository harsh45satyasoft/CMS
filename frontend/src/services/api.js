import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor, This code sets up an Axios request interceptor, which allows you to modify or log every outgoing HTTP request before it is sent.
api.interceptors.request.use(         //Intercepts every request made using your api instance (typically created with axios.create()).
  (config) => {                       //In the first function (config => config), you can: Add headers (like Authorization), Log or transform request data, Modify base URLs or query params
    // Add auth token here if needed
    return config;
  },
  (error) => {                        //In the second function (error => Promise.reject(error)), you can: Handle errors
    return Promise.reject(error);
  }
);

// Response interceptor, This snippet sets up an Axios response interceptor that: Simplifies response handling, Standardizes error messages across your app.
api.interceptors.response.use(
  (response) => {                          //This interceptor strips out everything except data, so when you use await api.get(...), you'll directly get the data: const users = await api.get("/users"); => No need to do `.data`
    return response.data;
  },
  (error) => {                             //Tries to extract the most helpful error message: From error.response.data.message (common with APIs), From error.message (fallback), Uses "Something went wrong!" as a last resort
    const message =
      error.response?.data?.message || error.message || "Something went wrong!";
    return Promise.reject(new Error(message));    //Then it wraps that message in a new Error object and rejects the promise.
  }
);

// Menu Types API
export const menuTypeAPI = {
  getAll: () => api.get("/menu-types"),
  getById: (id) => api.get(`/menu-types/${id}`),
  create: (data) => api.post("/menu-types", data),
  update: (id, data) => api.put(`/menu-types/${id}`, data),
  delete: (id) => api.delete(`/menu-types/${id}`),
};

// CMS Pages API
export const cmsPageAPI = {
  getAll: (params = {}) => api.get("/cms-pages", { params }),     //getAll is a method, It accepts an optional parameter params, which defaults to an empty object {}. It makes a GET request to the /cms-pages endpoint. If params are provided, they will be sent as query parameters in the URL(getAll({ page: 2, limit: 10 }); ).
  getById: (id) => api.get(`/cms-pages/${id}`),
  create: (data) => api.post("/cms-pages", data),
  // New method for creating with file upload
  createWithFile: (formData) => {
    return api.post("/cms-pages", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  update: (id, data) => api.put(`/cms-pages/${id}`, data),
  // New method for updating with file upload
  updateWithFile: (id, formData) => {
    return api.put(`/cms-pages/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  delete: (id) => api.delete(`/cms-pages/${id}`),
  toggleStatus: (id) => api.patch(`/cms-pages/${id}/toggle-status`),
  getForDropdown: () => api.get("/cms-pages/dropdown"),
  // New method for downloading files
  downloadFile: (id) => {
    return api.get(`/cms-pages/file/${id}`, {
      responseType: "blob",                    //responseType: "blob" tells Axios to treat the response as binary data (Blob), essential for files.
    });                                        //Return: A Promise resolving to the raw file blob (you’ll need to handle saving/displaying it on the client).
  },
};

export default api;