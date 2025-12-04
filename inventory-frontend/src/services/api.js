import axios from "axios";
 
const API_BASE_URL = "http://localhost:8080/api";
 
// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// services/api.js - Updated export service
export const exportService = {
  exportToSheets: () => api.post("/products/staff/export-to-sheets"),
 
  exportToCSV: () =>
    api.get("/products/staff/export-csv", {
      responseType: "blob", // Important for file download
      timeout: 30000, // 30 second timeout for large files
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Explicitly include token
      },
    }),
 
  clearSheetsTokens: () => api.post("/admin/clear-sheets-tokens"),
};
 
// Add response interceptor to handle blob responses and token issues
api.interceptors.response.use(
  (response) => {
    // Handle blob responses (file downloads)
    if (response.config.responseType === "blob") {
      return response;
    }
    return response;
  },
  (error) => {
    console.error("API Error:", error);
 
    if (error.response?.status === 401) {
      console.log("🔄 Token expired or invalid");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("userType");
      localStorage.removeItem("privileges");
 
      // Use window.location instead of navigate for better reliability
      setTimeout(() => {
        window.location.href =
          "/login?redirect=" + encodeURIComponent(window.location.pathname);
      }, 1000);
    }
 
    return Promise.reject(error);
  }
);
// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
 
// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("userType");
      localStorage.removeItem("privileges");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
 
export const authService = {
  login: async (email, password) => {
    try {
      console.log("📤 Sending login request to backend...");
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      console.log("📥 Login response received:", response);
      return response;
    } catch (error) {
      console.error("❌ Auth service login error:", error);
      throw error;
    }
  },
 
  registerUser: (userData) => api.post("/auth/register/user", userData),
  registerStaff: (staffData) => api.post("/auth/register/staff", staffData),
 
  setAuth: (token, userData, userType, privileges) => {
    console.log("💾 Setting auth data:", { userType, userData });
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("userType", userType);
    localStorage.setItem("privileges", privileges);
  },
 
  isAuthenticated: () => {
    return localStorage.getItem("token") !== null;
  },
 
  getCurrentUser: () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },
 
  getUserType: () => {
    return localStorage.getItem("userType");
  },
 
  getToken: () => {
    return localStorage.getItem("token");
  },
 
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userType");
    localStorage.removeItem("privileges");
  },
};
 
// Staff Service
export const staffService = {
  getAll: () => api.get("/staff"),
  getById: (id) => api.get(`/staff/${id}`),
  create: (staffData) => api.post("/staff", staffData),
  update: (id, staffData) => api.put(`/staff/${id}`, staffData),
  delete: (id) => api.delete(`/staff/${id}`),
  getByStatus: (status) => api.get(`/staff/status/${status}`),
  checkEmail: (email) => api.get(`/staff/check-email?email=${email}`),
};
 
// User Service
export const userService = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  checkEmail: (email) => api.get(`/users/check-email?email=${email}`),
};
 
// Product Service
export const productService = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post("/products/staff/create", productData),
  update: (id, productData) =>
    api.put(`/products/staff/update/${id}`, productData),
  delete: (id) => api.delete(`/products/admin/delete/${id}`),
  processOrder: (orderData) => api.put("/products/order", orderData),
  getLowStock: () => api.get("/products/staff/low-stock"),
  checkStock: () => api.post("/products/staff/check-stock"),
  exportToSheets: () => api.post("/products/staff/export-to-sheets"),
  exportSingleToSheets: (id) => api.post(`/products/staff/export-single/${id}`),
  checkSheetsConfig: () => api.get("/products/public/sheets-config"),
};
 
// Public Product Service (no authentication required)
export const publicProductService = {
  getAll: () => api.get("/products/public/all"),
  getById: (id) => api.get(`/products/public/${id}`),
  test: (testData) => api.post("/products/public/test", testData),
  debug: (rawData) => api.post("/products/public/debug", rawData),
};
 
// Admin Service (admin-only endpoints)
export const adminService = {
  getAll: () => api.get('/admin'),
  getById: (id) => api.get(`/admin/${id}`),
  create: (data) => api.post('/admin', data), // or api.post('/admin/create', data)
  update: (id, data) => api.put(`/admin/${id}`, data), // Make sure this endpoint exists
  delete: (id) => api.delete(`/admin/${id}`),
};
 
// Sheets Service
export const sheetsService = {
  exportAll: () => api.post("/products/staff/export-to-sheets"),
  exportSingle: (id) => api.post(`/products/staff/export-single/${id}`),
};
 
// Export Service
 
// Order Service
export const orderService = {
  placeOrder: (orderData) => api.post("/orders/checkout", orderData),
  getUserOrders: () => api.get("/products/user/my-products"),
};
 
export default api;
 
 