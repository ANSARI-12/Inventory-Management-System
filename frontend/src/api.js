// // frontend/src/api.js
// import axios from "axios";

// // Change this URL to your Render URL later when deploying
// const API_BASE = "http://localhost:5000/api";

// export const api = axios.create({
//   baseURL: API_BASE,
// });

// // --- API FUNCTIONS ---

// export const getProducts = (name, category) =>
//   api.get(`/products/search?name=${name || ""}&category=${category || ""}`);

// export const createProduct = (data) => api.post("/products", data);

// export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

// export const deleteProduct = (id) => api.delete(`/products/${id}`);

// export const getHistory = (id) => api.get(`/products/${id}/history`);

// export const importProducts = (formData) =>
//   api.post("/products/import", formData);

// export const exportProducts = () => `${API_BASE}/products/export`; // Direct link

// frontend/src/api.js (Update the axios create section)
import axios from "axios";

// Change this URL to your Render URL later when deploying
const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
export const api = axios.create({
  baseURL: API_BASE,
});

// --- INTERCEPTORS (This handles the Token) ---

// 1. Add Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Handle Invalid Token (Auto Logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("token");
      window.location.reload(); // Refresh to show Login screen
    }
    return Promise.reject(error);
  }
);

// --- API FUNCTIONS ---

// Auth
export const loginUser = (data) => api.post("/login", data);
export const registerUser = (data) => api.post("/register", data);

// Products
export const getProducts = (name, category) =>
  api.get(`/products/search?name=${name || ""}&category=${category || ""}`);

export const createProduct = (data) => api.post("/products", data);

export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const deleteAllProducts = () => api.delete("/products");

export const getHistory = (id) => api.get(`/products/${id}/history`);

export const importProducts = (formData) =>
  api.post("/products/import", formData);

export const exportProducts = () => `${API_BASE}/products/export`;
