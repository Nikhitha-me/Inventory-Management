// components/layout/AppLayout.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Home,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Crown,
  Briefcase,
  User,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AppLayout = ({ children }) => {
  const { auth, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getRoleIcon = () => {
    switch (auth.userType) {
      case "ADMIN":
        return <Crown className="h-5 w-5" />;
      case "STAFF":
        return <Briefcase className="h-5 w-5" />;
      case "USER":
        return <User className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleColor = () => {
    switch (auth.userType) {
      case "ADMIN":
        return "from-purple-500 to-pink-600";
      case "STAFF":
        return "from-blue-500 to-cyan-600";
      case "USER":
        return "from-green-500 to-emerald-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getDashboardTitle = () => {
    switch (auth.userType) {
      case "ADMIN":
        return "Admin Dashboard";
      case "STAFF":
        return "Staff Dashboard";
      case "USER":
        return "My Dashboard";
      default:
        return "Dashboard";
    }
  };

  const getNavigationItems = () => {
    const baseItems = [{ path: "/", label: "Dashboard", icon: Home }];

    const roleItems = {
      ADMIN: [
        { path: "/admin/staff", label: "Staff Management", icon: Users },
        { path: "/admin/users", label: "User Management", icon: Users },
        { path: "/admin/products", label: "Products", icon: Package },
        { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { path: "/admin/settings", label: "Settings", icon: Settings },
      ],
      STAFF: [
        { path: "/staff/inventory", label: "Inventory", icon: Package },
        { path: "/staff/reports", label: "Reports", icon: BarChart3 },
        { path: "/staff/settings", label: "Settings", icon: Settings },
      ],
      USER: [
        { path: "/user/products", label: "Products", icon: Package },
        { path: "/user/wishlist", label: "Wishlist", icon: Heart },
        { path: "/user/cart", label: "Cart", icon: ShoppingCart },
        { path: "/user/orders", label: "Orders", icon: Package },
        { path: "/user/settings", label: "Settings", icon: Settings },
      ],
    };

    return [...baseItems, ...(roleItems[auth.userType] || [])];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-800/90 backdrop-blur-xl border-r border-white/10"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-white">
                        StockMaster
                      </h1>
                      <p className="text-xs text-gray-400 capitalize">
                        {auth.userType} Panel
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-white/10 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* User Section */}
                <div className="p-6 border-t border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${getRoleColor()} rounded-full flex items-center justify-center`}
                    >
                      {getRoleIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {auth.user?.name || auth.user?.firstName}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {auth.userType}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-0">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-800/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-gray-300 hover:text-white transition-colors lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-bold text-white">
                      {getDashboardTitle()}
                    </h1>
                    <p className="text-xs text-gray-400">
                      Welcome back, {auth.user?.name || auth.user?.firstName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search inventory, products, users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Badge */}
                <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  <div
                    className={`w-6 h-6 bg-gradient-to-r ${getRoleColor()} rounded-full flex items-center justify-center`}
                  >
                    {getRoleIcon()}
                  </div>
                  <span className="text-xs font-medium text-white capitalize">
                    {auth.userType}
                  </span>
                </div>

                {/* Desktop Logout */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
