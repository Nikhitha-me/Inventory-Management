// src/pages/StaffDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Package,
  BarChart3,
  Search,
  AlertTriangle,
  TrendingUp,
  LogOut,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Custom Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            OK
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const StaffDashboard = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockUpdate, setStockUpdate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [updating, setUpdating] = useState(false);

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      // Handle API response structure
      const productsData = response?.data?.data || response?.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    showConfirmation("Logout", "Are you sure you want to logout?", () => {
      console.log("🚪 AdminDashboard: Logging out...");
      
      // Clear all component state
      
         
      // Call the actual logout function
      logout();
    });
  };

  const showConfirmation = (title, message, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const showSuccess = (title, message) => {
    setSuccessModal({
      isOpen: true,
      title,
      message,
    });
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedProduct = {
        ...selectedProduct,
        unitStockQuantity: parseInt(stockUpdate),
      };
      await productService.update(selectedProduct.id, updatedProduct);
      setShowStockModal(false);
      setSelectedProduct(null);
      setStockUpdate("");
      fetchProducts();
      showSuccess("Success", "Stock updated successfully!");
    }  catch (error) {
      console.error("Stock update error:", error);
      
      // More detailed error handling
      if (error.response) {
        console.error("Error response:", error.response.data);
        
        // Try alternative data structure if first attempt fails
        if (error.response.status === 400) {
          toast.error("Invalid data format. Please check the stock quantity.");
        } else if (error.response.status === 404) {
          toast.error("Product not found");
        } else if (error.response.status === 403) {
          toast.error("You don't have permission to update this product");
        } else {
          toast.error(error.response.data?.message || "Failed to update stock");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("Network error - please check your connection");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setUpdating(false);
    }
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockUpdate(product.unitStockQuantity?.toString() || "0");
    setShowStockModal(true);
  };

  // Safe array access
  const safeProducts = Array.isArray(products) ? products : [];

  const stats = [
    {
      title: "Total Products",
      value: safeProducts.length,
      icon: Package,
      color: "bg-blue-500",
      description: "In inventory",
    },
    {
      title: "Low Stock",
      value: safeProducts.filter((p) => (p.unitStockQuantity || 0) < 10).length,
      icon: AlertTriangle,
      color: "bg-red-500",
      description: "Need restocking",
    },
    {
      title: "Out of Stock",
      value: safeProducts.filter((p) => (p.unitStockQuantity || 0) === 0)
        .length,
      icon: Package,
      color: "bg-orange-500",
      description: "Zero inventory",
    },
    {
      title: "High Stock",
      value: safeProducts.filter((p) => (p.unitStockQuantity || 0) > 50).length,
      icon: TrendingUp,
      color: "bg-green-500",
      description: "Well stocked",
    },
  ];

  const lowStockProducts = safeProducts.filter(
    (p) => (p.unitStockQuantity || 0) < 10
  );
  const categories = [
    ...new Set(safeProducts.map((product) => product.category).filter(Boolean)),
  ];
  const filteredProducts = safeProducts.filter((product) => {
    const matchesSearch = product.productName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome,{" "}
              <span className="text-blue-600">
                {auth.user?.name || "Staff"}
              </span>
              !
            </h1>
            <p className="text-gray-600">
              Manage inventory and track products efficiently
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-500">
                {auth.rights} • {auth.user?.designation || "Staff Member"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </motion.button>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 bg-white rounded-xl p-2 mb-8 shadow-sm border border-gray-200"
        >
          {menuItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              {stat.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              {stat.value}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {stat.description}
                            </p>
                          </div>
                          <div
                            className={`p-3 rounded-xl ${stat.color} text-white`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-orange-50 border border-orange-200 rounded-xl p-6"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-6 w-6 text-orange-500" />
                      <div>
                        <h3 className="font-semibold text-orange-800">
                          Low Stock Alert
                        </h3>
                        <p className="text-orange-700 text-sm">
                          {lowStockProducts.length} products need immediate
                          restocking
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab("inventory")}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Manage Inventory
                        </h3>
                        <p className="text-sm text-gray-600">
                          Update stock levels and product info
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab("reports")}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          View Reports
                        </h3>
                        <p className="text-sm text-gray-600">
                          Access inventory analytics
                        </p>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Recent Products */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Products
                  </h3>
                  <div className="space-y-3">
                    {safeProducts.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 text-sm">
                            {product.productName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-700 text-sm">
                            ₹{product.pricePerQuantity}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              (product.unitStockQuantity || 0) < 10
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {product.unitStockQuantity || 0} in stock
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "inventory" && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Inventory Management
                  </h2>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            product.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.status || "ACTIVE"}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">
                        {product.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.description || "No description available"}
                      </p>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-semibold text-green-600">
                            ₹{product.pricePerQuantity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stock:</span>
                          <span
                            className={`font-semibold ${
                              (product.unitStockQuantity || 0) < 10
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {product.unitStockQuantity || 0} units
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span className="font-semibold text-gray-900">
                            {product.category || "Uncategorized"}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openStockModal(product)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                      >
                        Update Stock
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No products found</p>
                    <p className="text-gray-500 text-sm">
                      Try adjusting your search or filters
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">
                  Inventory Reports
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stock Summary */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Stock Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Products</span>
                        <span className="text-gray-900 font-semibold">
                          {safeProducts.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">In Stock</span>
                        <span className="text-green-600 font-semibold">
                          {
                            safeProducts.filter(
                              (p) => (p.unitStockQuantity || 0) > 0
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Out of Stock</span>
                        <span className="text-red-600 font-semibold">
                          {
                            safeProducts.filter(
                              (p) => (p.unitStockQuantity || 0) === 0
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Low Stock</span>
                        <span className="text-orange-600 font-semibold">
                          {
                            safeProducts.filter(
                              (p) =>
                                (p.unitStockQuantity || 0) < 10 &&
                                (p.unitStockQuantity || 0) > 0
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Distribution */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Categories
                    </h3>
                    <div className="space-y-2">
                      {categories.slice(0, 5).map((category) => (
                        <div
                          key={category}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">{category}</span>
                          <span className="text-gray-900 font-semibold">
                            {
                              safeProducts.filter(
                                (p) => p.category === category
                              ).length
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Low Stock Products */}
                {lowStockProducts.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Low Stock Products
                    </h3>
                    <div className="space-y-3">
                      {lowStockProducts.slice(0, 10).map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Package className="h-4 w-4 text-orange-500" />
                            <span className="text-gray-900 text-sm">
                              {product.productName}
                            </span>
                          </div>
                          <span className="text-orange-600 text-sm font-semibold">
                            {product.unitStockQuantity || 0} units left
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stock Update Modal */}
      <AnimatePresence>
        {showStockModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Update Stock - {selectedProduct.productName}
                </h3>
                <button
                  onClick={() => setShowStockModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stockUpdate}
                    onChange={(e) => setStockUpdate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Current stock: {selectedProduct.unitStockQuantity || 0}{" "}
                    units
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowStockModal(false)}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Updating..." : "Update Stock"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
};

export default StaffDashboard;
