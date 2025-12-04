// pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  Star,
  TrendingUp,
  CheckCircle,
  Globe,
  Zap,
  Heart,
  ShoppingCart,
  Plus,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  Eye,
  AlertTriangle,
  Crown,
  Briefcase,
  User,
  Bell,
  Menu,
  LogOut,
  Home,
  ShoppingBag,
  Filter
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import { staffService, userService, productService } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const HomePage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  // If user is authenticated, redirect to their dashboard
  useEffect(() => {
    if (auth.isAuthenticated) {
      switch (auth.userType) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'STAFF':
          navigate('/staff/dashboard');
          break;
        case 'USER':
          navigate('/user/dashboard');
          break;
        default:
          navigate('/');
      }
    }
  }, [auth.isAuthenticated, auth.userType, navigate]);

  // If user is authenticated, show nothing (will redirect)
  if (auth.isAuthenticated) {
    return <LoadingSpinner />;
  }

  // Default landing page for non-authenticated users
  return <LandingPage />;
};

const LandingPage = () => {
  const features = [
    {
      icon: Package,
      title: "Smart Inventory Management",
      description: "Track your inventory in real-time with automated stock alerts and intelligent forecasting.",
      color: "bg-blue-500",
      iconColor: "text-blue-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get deep insights into your sales, stock levels, and business performance with beautiful dashboards.",
      color: "bg-purple-500",
      iconColor: "text-purple-600"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Secure multi-user access with different permission levels for admins, staff, and customers.",
      color: "bg-green-500",
      iconColor: "text-green-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with encrypted data, secure authentication, and compliance standards.",
      color: "bg-red-500",
      iconColor: "text-red-600"
    },
    {
      icon: TrendingUp,
      title: "Sales Optimization",
      description: "Boost your sales with intelligent recommendations and automated reordering systems.",
      color: "bg-orange-500",
      iconColor: "text-orange-600"
    },
    {
      icon: Globe,
      title: "Cloud Powered",
      description: "Access your inventory from anywhere with our reliable cloud infrastructure.",
      color: "bg-indigo-500",
      iconColor: "text-indigo-600"
    },
  ];

  const stats = [
    { number: "10K+", label: "Products Managed" },
    { number: "500+", label: "Businesses Trust Us" },
    { number: "99.9%", label: "Uptime Reliability" },
    { number: "24/7", label: "Customer Support" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">StockMaster</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-medium shadow-sm"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
            >
              Revolutionize Your
              <span className="text-blue-600">
                {" "}
                Inventory Management
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              The all-in-one platform that transforms how you manage inventory,
              track sales, and grow your business with AI-powered insights and
              real-time analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/signup"
                className="group bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg flex items-center space-x-2 shadow-lg"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-gray-400 hover:text-gray-900 transition-all font-semibold text-lg bg-white"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-40"></div>
            <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-40"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 -mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your inventory management
              and boost your business growth
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <div
                    className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="py-20 bg-gradient-to-r from-blue-50 to-indigo-100"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            className="bg-white rounded-3xl p-12 border border-gray-200 shadow-lg"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of businesses that trust StockMaster for their
              inventory management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-sm"
              >
                Start Your Journey
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-gray-400 hover:text-gray-900 transition-all font-semibold text-lg bg-white"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockMaster</span>
            </div>
            <div className="text-gray-600 text-sm">
              © 2024 StockMaster. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Role-Based Home Page Component
const RoleBasedHomePage = ({ userType, userData, rights }) => {
  const homePages = {
    ADMIN: <AdminHomePage userData={userData} rights={rights} />,
    STAFF: <StaffHomePage userData={userData} rights={rights} />,
    USER: <UserHomePage userData={userData} rights={rights} />
  };

  return homePages[userType] || <DefaultHomePage userData={userData} />;
};

// Default Home Page (fallback)
const DefaultHomePage = ({ userData }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Package className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to StockMaster
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Your inventory management solution
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;