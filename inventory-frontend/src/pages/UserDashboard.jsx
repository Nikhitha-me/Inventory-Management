// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Heart,
  User,
  Search,
  ShoppingBag,
  Eye,
  Mail,
  CheckCircle,
  X,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { productService, orderService } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
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

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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
    // Load cart and wishlist from localStorage on component mount
    const savedCart = localStorage.getItem("userCart");
    const savedWishlist = localStorage.getItem("userWishlist");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  // Save cart and wishlist to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("userWishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
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

  const addToWishlist = (product) => {
    if (!wishlist.find((item) => item.id === product.id)) {
      const updatedWishlist = [
        ...wishlist,
        { ...product, wishlistDate: new Date().toISOString() },
      ];
      setWishlist(updatedWishlist);
      toast.success("Added to wishlist!");
    } else {
      toast.info("Already in wishlist");
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(wishlist.filter((item) => item.id !== productId));
    toast.success("Removed from wishlist");
  };

  const addToCart = (product) => {
    // Check if product is in stock
    if (product.unitStockQuantity === 0) {
      toast.error("This product is out of stock!");
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    let updatedCart;

    if (existingItem) {
      // Check if adding more than available stock
      if (existingItem.quantity + 1 > product.unitStockQuantity) {
        toast.error(
          `Only ${product.unitStockQuantity} units available in stock!`
        );
        return;
      }
      updatedCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      toast.success("Item quantity updated in cart!");
    } else {
      updatedCart = [
        ...cart,
        { ...product, quantity: 1, addedDate: new Date().toISOString() },
      ];
      toast.success("Added to cart!");
    }
    setCart(updatedCart);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
    toast.success("Removed from cart");
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    // Check stock availability
    const product = products.find((p) => p.id === productId);
    if (product && newQuantity > product.unitStockQuantity) {
      toast.error(
        `Only ${product.unitStockQuantity} units available in stock!`
      );
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    showConfirmation(
      "Clear Cart",
      "Are you sure you want to clear your entire cart?",
      () => {
        setCart([]);
        toast.success("Cart cleared successfully!");
      }
    );
  };

  // In your UserDashboard.jsx, update the handleCheckout function:

const handleCheckout = async () => {
  if (cart.length === 0) {
    toast.error("Your cart is empty!");
    return;
  }

  setOrderProcessing(true);

  try {
    // Prepare order data in the format backend expects
    const orderData = {
      items: cart.map(item => ({
        productName: item.productName,
        model: item.model || item.productName, // Use productName as fallback for model
        quantity: item.quantity
      }))
    };

    console.log("Sending order data:", orderData);

    const response = await orderService.placeOrder(orderData);
    
    if (response.data.success) {
      setOrderSuccess(true);
      // Clear cart after successful order
      setCart([]);
      // Refresh products to get updated stock
      await fetchProducts();
      toast.success("Order placed successfully! Check your email for confirmation.");
    } else {
      throw new Error(response.data.message || "Order failed");
    }
    
  } catch (error) {
    console.error("Checkout error:", error);
    toast.error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to process order. Please try again."
    );
  } finally {
    setOrderProcessing(false);
  }
};

  const handleLogout = () => {
    showConfirmation("Logout", "Are you sure you want to logout?", () =>
      logout()
    );
  };

  // Safe array access
  const safeProducts = Array.isArray(products) ? products : [];

  // Get unique categories from products
  const categories = [
    ...new Set(safeProducts.map((product) => product.category).filter(Boolean)),
  ];

  // Filter products based on search and category
  const filteredProducts = safeProducts.filter((product) => {
    const matchesSearch = product.productName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory && product.status === "ACTIVE";
  });

  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.pricePerQuantity * item.quantity,
    0
  );
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const stats = [
    {
      title: "Products Available",
      value: safeProducts.filter((p) => p.status === "ACTIVE").length,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "In Wishlist",
      value: wishlist.length,
      icon: Heart,
      color: "bg-red-500",
    },
    {
      title: "In Cart",
      value: totalItems,
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Cart Total",
      value: `₹${cartTotal.toFixed(2)}`,
      icon: ShoppingBag,
      color: "bg-purple-500",
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back,{" "}
              <span className="text-blue-600">{user?.name || "User"}</span>!
            </h1>
            <p className="text-gray-600">
              Discover amazing products and great deals
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <User className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-500">User Access</span>
            </div>
          </div>

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
          {["products", "wishlist", "cart"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center justify-center flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "wishlist" && wishlist.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {wishlist.length}
                </span>
              )}
              {tab === "cart" && cart.length > 0 && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
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
                </div>
                <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Products Tab */}
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <h2 className="text-xl font-bold text-gray-900">
                    Product Catalog
                  </h2>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none min-w-[250px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
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
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <button
                          onClick={() =>
                            wishlist.find((item) => item.id === product.id)
                              ? removeFromWishlist(product.id)
                              : addToWishlist(product)
                          }
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              wishlist.find((item) => item.id === product.id)
                                ? "text-red-500 fill-current"
                                : ""
                            }`}
                          />
                        </button>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
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
                              (product.unitStockQuantity || 0) > 0
                                ? (product.unitStockQuantity || 0) < 10
                                  ? "text-orange-600"
                                  : "text-green-600"
                                : "text-red-600"
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

                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(product)}
                          disabled={(product.unitStockQuantity || 0) === 0}
                          className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all font-medium ${
                            (product.unitStockQuantity || 0) > 0
                              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Add to Cart
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                      </div>
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
              </div>
            </motion.div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Your Wishlist
                </h2>
                <p className="text-gray-600 mt-1">{wishlist.length} items</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <Heart className="h-6 w-6 text-red-600" />
                        </div>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Heart className="h-5 w-5 text-red-500 fill-current" />
                        </button>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {item.description || "No description available"}
                      </p>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-green-600 font-semibold">
                          ₹{item.pricePerQuantity}
                        </span>
                        <span
                          className={`text-sm ${
                            (item.unitStockQuantity || 0) > 0
                              ? (item.unitStockQuantity || 0) < 10
                                ? "text-orange-600"
                                : "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {(item.unitStockQuantity || 0) > 0
                            ? `${item.unitStockQuantity} in stock`
                            : "Out of Stock"}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(item)}
                        disabled={(item.unitStockQuantity || 0) === 0}
                        className={`w-full py-2 rounded-lg transition-all font-medium ${
                          (item.unitStockQuantity || 0) > 0
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Move to Cart
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                {wishlist.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      Your wishlist is empty
                    </p>
                    <p className="text-gray-500 text-sm">
                      Start adding products you love!
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Cart Tab */}
          {activeTab === "cart" && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Shopping Cart
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {totalItems} items • Total: ₹{cartTotal.toFixed(2)}
                    </p>
                  </div>
                  {cart.length > 0 && (
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearCart}
                        className="px-4 py-2 bg-red-100 border border-red-200 text-red-700 rounded-lg hover:bg-red-200 transition-all font-medium"
                      >
                        Clear Cart
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCheckoutModal(true)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm"
                      >
                        Checkout
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.productName}
                          </h3>
                          <p className="text-green-600">
                            ₹{item.pricePerQuantity} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            -
                          </button>
                          <span className="text-gray-900 font-semibold min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="text-gray-900 font-semibold">
                            ₹
                            {(item.pricePerQuantity * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {cart.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Your cart is empty</p>
                    <p className="text-gray-500 text-sm">
                      Add some products to get started!
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Order
                </h3>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!orderSuccess ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items:</span>
                      <span className="text-gray-900">{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-green-600 font-semibold">
                        ₹{cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      A confirmation email will be sent to your registered email
                      address.
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowCheckoutModal(false)}
                      className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                      disabled={orderProcessing}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={orderProcessing}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {orderProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          <span>Confirm Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Order Successful!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your order has been placed successfully. A confirmation
                    email has been sent to your registered email address.
                  </p>
                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setOrderSuccess(false);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
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

export default UserDashboard;