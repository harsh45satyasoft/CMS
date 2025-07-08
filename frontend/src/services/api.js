import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong!";
    return Promise.reject(new Error(message));
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
  getAll: (params = {}) => api.get("/cms-pages", { params }),
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
      responseType: "blob",
    });
  },
};

export default api;