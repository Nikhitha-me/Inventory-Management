import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Users,
  BarChart3,
  Plus,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  Crown,
  LogOut,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Download,
  Settings,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  staffService,
  userService,
  productService,
  adminService,
  sheetsService,
  exportService,
} from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";

// Custom Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "confirm",
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
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-red-600" />
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
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
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

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [staffMembers, setStaffMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

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

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    designation: "",
    department: "",
    rightsPrivileges: "STAFF",
    status: "ACTIVE",
  });

  const [productForm, setProductForm] = useState({
    productName: "",
    model: "",
    pricePerQuantity: "",
    unitStockQuantity: "",
    description: "",
    category: "",
    status: "ACTIVE",
  });

  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    rightsPrivileges: "ADMIN",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [staffRes, usersRes, productsRes, adminsRes] = await Promise.all([
        staffService.getAll(),
        userService.getAll(),
        productService.getAll(),
        adminService.getAll(),
      ]);

      setStaffMembers(staffRes?.data?.data || staffRes?.data || []);
      setUsers(usersRes?.data?.data || usersRes?.data || []);
      setProducts(productsRes?.data?.data || productsRes?.data || []);
      setAdmins(adminsRes?.data?.data || adminsRes?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
      setStaffMembers([]);
      setUsers([]);
      setProducts([]);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const getSafeArray = (array) => {
    return Array.isArray(array) ? array : [];
  };

  const handleStaffInputChange = (e) => {
    const { name, value } = e.target;
    setStaffForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]:
        name === "pricePerQuantity" || name === "unitStockQuantity"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await staffService.create(staffForm);
      setShowStaffModal(false);
      setStaffForm({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        designation: "",
        department: "",
        rightsPrivileges: "STAFF",
        status: "ACTIVE",
      });
      fetchAllData();
      showSuccess("Success", "Staff member added successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add staff member"
      );
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productService.create(productForm);
      setShowProductModal(false);
      setProductForm({
        productName: "",
        model: "",
        pricePerQuantity: "",
        unitStockQuantity: "",
        description: "",
        category: "",
        status: "ACTIVE",
      });
      fetchAllData();
      showSuccess("Success", "Product added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await adminService.create(adminForm);
      setShowAdminModal(false);
      setAdminForm({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        rightsPrivileges: "ADMIN",
        status: "ACTIVE",
      });
      fetchAllData();
      showSuccess("Success", "Admin added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add admin");
    }
  };

  const handleEditItem = (item, type) => {
    setEditingItem({ ...item, type });
    if (type === "product") {
      setProductForm({
        productName: item.productName,
        model: item.model || "",
        pricePerQuantity: item.pricePerQuantity,
        unitStockQuantity: item.unitStockQuantity,
        description: item.description || "",
        category: item.category || "",
        status: item.status,
      });
    } else if (type === "staff") {
      setStaffForm({
        name: item.name,
        email: item.email,
        password: "",
        phoneNumber: item.phoneNumber || "",
        designation: item.designation || "",
        department: item.department || "",
        rightsPrivileges: item.rightsPrivileges || "STAFF",
        status: item.status,
      });
    } else if (type === "user") {
      setStaffForm({
        name: item.name,
        email: item.email,
        password: "",
        phoneNumber: item.phoneNumber || "",
        designation: "",
        department: "",
        rightsPrivileges: item.rightsPrivileges || "USER",
        status: item.status,
      });
    } else if (type === "admin") {
      setAdminForm({
        name: item.name,
        email: item.email,
        password: "",
        phoneNumber: item.phoneNumber || "",
        rightsPrivileges: item.rightsPrivileges || "ADMIN",
        status: item.status,
      });
    }
    setShowEditModal(true);
  };

  // Replace the entire handleUpdateItem function (lines 334-367) with:
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      let response;
      let updateData;

      if (editingItem.type === "product") {
        updateData = { ...productForm };
        // Ensure numeric fields are numbers
        updateData.pricePerQuantity =
          parseFloat(updateData.pricePerQuantity) || 0;
        updateData.unitStockQuantity =
          parseInt(updateData.unitStockQuantity) || 0;
        response = await productService.update(editingItem.id, updateData);
      } else if (editingItem.type === "staff") {
        updateData = { ...staffForm };
        if (!updateData.password || updateData.password === "") {
          delete updateData.password;
        }
        response = await staffService.update(editingItem.id, updateData);
      } else if (editingItem.type === "user") {
        updateData = { ...staffForm }; // Using staffForm for user updates
        if (!updateData.password || updateData.password === "") {
          delete updateData.password;
        }
        // Remove staff-specific fields for user updates
        delete updateData.designation;
        delete updateData.department;
        response = await userService.update(editingItem.id, updateData);
      } else if (editingItem.type === "admin") {
        updateData = { ...adminForm };
        if (!updateData.password || updateData.password === "") {
          delete updateData.password;
        }
        response = await adminService.update(editingItem.id, updateData);
      }

      console.log("Update response:", response);

      setShowEditModal(false);
      setEditingItem(null);
      fetchAllData();
      showSuccess(
        "Success",
        `${
          editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)
        } updated successfully!`
      );
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update item");
    }
  };

  const handleDeleteStaff = async (id, name) => {
    showConfirmation(
      "Delete Staff Member",
      `Are you sure you want to delete staff member: ${name}? This action cannot be undone.`,
      async () => {
        try {
          await staffService.delete(id);
          fetchAllData();
          showSuccess("Success", "Staff member deleted successfully!");
        } catch (error) {
          toast.error("Failed to delete staff member");
        }
      }
    );
  };

  const handleDeleteProduct = async (id, name) => {
    showConfirmation(
      "Delete Product",
      `Are you sure you want to delete product: ${name}? This action cannot be undone.`,
      async () => {
        try {
          await productService.delete(id);
          fetchAllData();
          showSuccess("Success", "Product deleted successfully!");
        } catch (error) {
          toast.error("Failed to delete product");
        }
      }
    );
  };

  const handleDeleteUser = async (id, name) => {
    showConfirmation(
      "Delete User",
      `Are you sure you want to delete user: ${name}? This action cannot be undone.`,
      async () => {
        try {
          await userService.delete(id);
          fetchAllData();
          showSuccess("Success", "User deleted successfully!");
        } catch (error) {
          toast.error("Failed to delete user");
        }
      }
    );
  };

  const handleDeleteAdmin = async (id, name) => {
    showConfirmation(
      "Delete Admin",
      `Are you sure you want to delete admin: ${name}? This action cannot be undone.`,
      async () => {
        try {
          await adminService.delete(id);
          fetchAllData();
          showSuccess("Success", "Admin deleted successfully!");
        } catch (error) {
          toast.error("Failed to delete admin");
        }
      }
    );
  };

  const handleUpdateProductStatus = async (id, currentStatus, productName) => {
    showConfirmation(
      "Update Product Status",
      `Are you sure you want to ${
        currentStatus === "ACTIVE" ? "deactivate" : "activate"
      } product: ${productName}?`,
      async () => {
        try {
          const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
          await productService.update(id, { status: newStatus });
          fetchAllData();
          showSuccess("Success", "Product status updated successfully!");
        } catch (error) {
          toast.error("Failed to update product status");
        }
      }
    );
  };

  const handleUpdateStaffStatus = async (id, currentStatus, staffName) => {
    showConfirmation(
      "Update Staff Status",
      `Are you sure you want to ${
        currentStatus === "ACTIVE" ? "deactivate" : "activate"
      } staff member: ${staffName}?`,
      async () => {
        try {
          const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
          await staffService.update(id, { status: newStatus });
          fetchAllData();
          showSuccess("Success", "Staff status updated successfully!");
        } catch (error) {
          toast.error("Failed to update staff status");
        }
      }
    );
  };

  const handleUpdateUserStatus = async (id, currentStatus, userName) => {
    showConfirmation(
      "Update User Status",
      `Are you sure you want to ${
        currentStatus === "ACTIVE" ? "deactivate" : "activate"
      } user: ${userName}?`,
      async () => {
        try {
          const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
          await userService.update(id, { status: newStatus });
          fetchAllData();
          showSuccess("Success", "User status updated successfully!");
        } catch (error) {
          toast.error("Failed to update user status");
        }
      }
    );
  };

  // In your AdminDashboard component - Update the export function
  const handleExportToCSV = async () => {
    try {
      setExportLoading(true);

      // Check if user is still authenticated
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please login again.");
        logout();
        return;
      }

      console.log(
        "📤 Starting CSV export with token:",
        token ? "exists" : "missing"
      );

      const response = await exportService.exportToCSV();

      // Create blob and download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess("Export Successful", "CSV file downloaded successfully!");
    } catch (error) {
      console.error("Export error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else if (error.response?.status === 403) {
        toast.error("You do not have permission to export data.");
      } else {
        toast.error("Failed to export CSV file. Please try again.");
      }
    } finally {
      setExportLoading(false);
    }
  };

  // Also update the Google Sheets export function
  const handleExportToSheets = async () => {
    try {
      setExportLoading(true);

      // Check authentication
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please login again.");
        logout();
        return;
      }

      const response = await sheetsService.exportAll();

      if (response.data.csvLink) {
        // Open in new tab instead of downloading
        window.open(response.data.csvLink, "_blank");
        showSuccess(
          "Export Successful",
          "Data exported to Google Sheets successfully!"
        );
      } else {
        toast.error("Failed to generate download link");
      }
    } catch (error) {
      console.error("Google Sheets export error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else {
        toast.error("Failed to export report to Google Sheets");
      }
    } finally {
      setExportLoading(false);
    }
  };

  
 const handleLogout = () => {
    showConfirmation("Logout", "Are you sure you want to logout?", () => {
      console.log("🚪 AdminDashboard: Logging out...");
      
      // Clear all component state
      setStaffMembers([]);
      setUsers([]);
      setProducts([]);
      setAdmins([]);
      setActiveTab("overview");
      setSearchTerm("");
      setFilterCategory("");
      
      // Clear all forms
      setStaffForm({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        designation: "",
        department: "",
        rightsPrivileges: "STAFF",
        status: "ACTIVE",
      });
      
      setProductForm({
        productName: "",
        model: "",
        pricePerQuantity: "",
        unitStockQuantity: "",
        description: "",
        category: "",
        status: "ACTIVE",
      });
      
      setAdminForm({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        rightsPrivileges: "ADMIN",
        status: "ACTIVE",
      });
      
      // Close all modals
      setShowStaffModal(false);
      setShowProductModal(false);
      setShowAdminModal(false);
      setShowEditModal(false);
      setEditingItem(null);
      
      // Clear confirmation modals
      setConfirmModal({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
      });
      
      setSuccessModal({
        isOpen: false,
        title: "",
        message: "",
      });
      
      // Call the actual logout function
      logout();
    });
  };

  // Stats calculations with safe array access
  const safeStaffMembers = getSafeArray(staffMembers);
  const safeProducts = getSafeArray(products);
  const safeUsers = getSafeArray(users);
  const safeAdmins = getSafeArray(admins);

  const totalProducts = safeProducts.length;
  const activeProducts = safeProducts.filter(
    (p) => p.status === "ACTIVE"
  ).length;
  const lowStockProducts = safeProducts.filter(
    (p) => p.unitStockQuantity < 10
  ).length;
  const outOfStockProducts = safeProducts.filter(
    (p) => p.unitStockQuantity === 0
  ).length;
  const activeStaff = safeStaffMembers.filter(
    (s) => s.status === "ACTIVE"
  ).length;
  const totalUsers = safeUsers.length;
  const totalAdmins = safeAdmins.length;
  const totalRevenue = safeProducts.reduce(
    (sum, product) =>
      sum + product.pricePerQuantity * (product.unitStockQuantity || 0),
    0
  );

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "bg-blue-500",
      description: `${activeProducts} active`,
    },
    {
      title: "Total Staff",
      value: safeStaffMembers.length,
      icon: Users,
      color: "bg-purple-500",
      description: `${activeStaff} active`,
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "bg-green-500",
      description: "Registered customers",
    },

    {
      title: "Low Stock",
      value: lowStockProducts,
      icon: AlertTriangle,
      color: "bg-yellow-500",
      description: "Needs attention",
    },
    {
      title: "Total Admins",
      value: totalAdmins,
      icon: Crown,
      color: "bg-red-500",
      description: "System administrators",
    },
  ];

  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "staff", label: "Staff Management", icon: Users },
    { id: "users", label: "User Management", icon: Users },
    { id: "products", label: "Product Management", icon: Package },
    { id: "admins", label: "Admin Management", icon: Crown },
  ];

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
        <span className="text-blue-600">
          {/* Get the current admin's name from admins list or use auth context */}
          {(() => {
            // Try to find the current admin in the admins list by email
            const currentAdmin = safeAdmins.find(admin => 
              admin.email === user?.email || admin.id === user?.id
            );
            return currentAdmin?.name || user?.name || "Admin";
          })()}
        </span>!
      </h1>
      <p className="text-gray-600">
        Complete system administration and management
      </p>
      <div className="flex items-center space-x-2 mt-2">
        <Crown className="h-5 w-5 text-yellow-500" />
        <span className="text-sm text-gray-500">
          Administrator Access
        </span>
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
          {menuItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
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
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
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
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowStaffModal(true)}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                      <UserPlus className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Add Staff Member
                      </h3>
                      <p className="text-sm text-gray-600">
                        Create new staff account
                      </p>
                    </div>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProductModal(true)}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Add Product
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add new product to inventory
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAdminModal(true)}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                      <Crown className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Add Admin</h3>
                      <p className="text-sm text-gray-600">
                        Create new admin account
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportToCSV} // Changed to CSV export
                  disabled={exportLoading}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                      {exportLoading ? (
                        <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {exportLoading ? "Exporting..." : "Export CSV"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Download inventory as CSV file
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Recent Activity & Low Stock Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            product.unitStockQuantity < 10
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.unitStockQuantity} in stock
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                {lowStockProducts > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                      Low Stock Alerts
                    </h3>
                    <div className="space-y-3">
                      {safeProducts
                        .filter((p) => p.unitStockQuantity < 10)
                        .slice(0, 5)
                        .map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                          >
                            <div className="flex items-center space-x-3">
                              <Package className="h-4 w-4 text-orange-500" />
                              <span className="text-gray-900 text-sm">
                                {product.productName}
                              </span>
                            </div>
                            <span className="text-orange-700 text-sm font-semibold">
                              {product.unitStockQuantity} left
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Staff Management Tab */}
          {activeTab === "staff" && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Staff Management
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowStaffModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Staff</span>
                </motion.button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rights
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {safeStaffMembers.map((staff) => (
                        <tr
                          key={staff.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {staff.name || staff.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {staff.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {staff.phoneNumber || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {staff.department || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {staff.designation || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {staff.rightsPrivileges || "STAFF"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() =>
                                handleUpdateStaffStatus(
                                  staff.id,
                                  staff.status,
                                  staff.name || staff.email
                                )
                              }
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                                staff.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                            >
                              {staff.status || "ACTIVE"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditItem(staff, "staff")}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteStaff(
                                  staff.id,
                                  staff.name || staff.email
                                )
                              }
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Product Management Tab */}
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h2 className="text-2xl font-bold text-gray-900">
                  Product Management
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProductModal(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleUpdateProductStatus(
                              product.id,
                              product.status,
                              product.productName
                            )
                          }
                          className={`px-2 py-1 text-xs font-semibold rounded-full transition-all ${
                            product.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {product.status}
                        </button>
                      </div>
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
                            product.unitStockQuantity < 10
                              ? "text-red-600"
                              : product.unitStockQuantity < 20
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {product.unitStockQuantity} units
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
                      <button
                        onClick={() => handleEditItem(product, "product")}
                        className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteProduct(product.id, product.productName)
                        }
                        className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        Delete
                      </button>
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
            </motion.div>
          )}

          {/* User Management Tab */}
          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                User Management
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {safeUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.phoneNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() =>
                                handleUpdateUserStatus(
                                  user.id,
                                  user.status,
                                  user.name || user.email
                                )
                              }
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                                user.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                            >
                              {user.status || "ACTIVE"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditItem(user, "user")}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteUser(
                                  user.id,
                                  user.name || user.email
                                )
                              }
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Admin Management Tab */}
          {activeTab === "admins" && (
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Admin Management
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdminModal(true)}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <Crown className="h-4 w-4" />
                  <span>Add Admin</span>
                </motion.button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {safeAdmins.map((admin) => (
                        <tr
                          key={admin.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {admin.name || admin.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {admin.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.phoneNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                admin.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {admin.status || "ACTIVE"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditItem(admin, "admin")}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteAdmin(
                                  admin.id,
                                  admin.name || admin.email
                                )
                              }
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showStaffModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Staff Member
                </h3>
                <button
                  onClick={() => setShowStaffModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={staffForm.name}
                    onChange={handleStaffInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={staffForm.email}
                    onChange={handleStaffInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={staffForm.password}
                    onChange={handleStaffInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={staffForm.phoneNumber}
                    onChange={handleStaffInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={staffForm.designation}
                    onChange={handleStaffInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={staffForm.department}
                    onChange={handleStaffInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowStaffModal(false)}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Add Staff
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Product
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={productForm.productName}
                    onChange={handleProductInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={productForm.model}
                    onChange={handleProductInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerQuantity"
                    value={productForm.pricePerQuantity}
                    onChange={handleProductInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="unitStockQuantity"
                    value={productForm.unitStockQuantity}
                    onChange={handleProductInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={productForm.category}
                    onChange={handleProductInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Admin
                </h3>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={adminForm.name}
                    onChange={handleAdminInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={adminForm.email}
                    onChange={handleAdminInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={adminForm.password}
                    onChange={handleAdminInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={adminForm.phoneNumber}
                    onChange={handleAdminInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                  >
                    Add Admin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit{" "}
                  {editingItem.type.charAt(0).toUpperCase() +
                    editingItem.type.slice(1)}
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateItem} className="space-y-4">
                {editingItem.type === "product" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={productForm.productName}
                        onChange={handleProductInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={productForm.model}
                        onChange={handleProductInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="pricePerQuantity"
                        value={productForm.pricePerQuantity}
                        onChange={handleProductInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        name="unitStockQuantity"
                        value={productForm.unitStockQuantity}
                        onChange={handleProductInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={productForm.category}
                        onChange={handleProductInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={productForm.description}
                        onChange={handleProductInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={productForm.status}
                        onChange={handleProductInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  </>
                )}

                {(editingItem.type === "staff" ||
                  editingItem.type === "user") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={staffForm.name}
                        onChange={handleStaffInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={staffForm.email}
                        onChange={handleStaffInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password (leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={staffForm.password}
                        onChange={handleStaffInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={staffForm.phoneNumber}
                        onChange={handleStaffInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {editingItem.type === "staff" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Designation
                          </label>
                          <input
                            type="text"
                            name="designation"
                            value={staffForm.designation}
                            onChange={handleStaffInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department
                          </label>
                          <input
                            type="text"
                            name="department"
                            value={staffForm.department}
                            onChange={handleStaffInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={staffForm.status}
                        onChange={handleStaffInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  </>
                )}

                {editingItem.type === "admin" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={adminForm.name}
                        onChange={handleAdminInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={adminForm.email}
                        onChange={handleAdminInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password (leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={adminForm.password}
                        onChange={handleAdminInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={adminForm.phoneNumber}
                        onChange={handleAdminInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={adminForm.status}
                        onChange={handleAdminInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingItem(null);
                    }}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Update
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

export default AdminDashboard;