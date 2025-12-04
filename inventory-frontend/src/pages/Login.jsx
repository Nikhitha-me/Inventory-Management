import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Shield, Mail, Lock } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { auth, login, isAuthenticated } = useAuth();

  // Check for success message from registration
  const successMessage = location.state?.message;

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [successMessage]);

  useEffect(() => {
    console.log("🔍 Login component - Auth state:", auth);

    if (auth.isAuthenticated && !auth.isLoading) {
      console.log("🎯 User authenticated, redirecting based on:", auth.userType);
      
      const from = location.state?.from?.pathname;
      
      if (from) {
        console.log("🎯 Redirecting to intended destination:", from);
        navigate(from, { replace: true });
        return;
      }

      switch (auth.userType) {
        case "ADMIN":
          console.log("👑 Redirecting to admin dashboard");
          navigate("/admin/dashboard", { replace: true });
          break;
        case "STAFF":
          console.log("👨‍💼 Redirecting to staff dashboard");
          navigate("/staff/dashboard", { replace: true });
          break;
        case "USER":
          console.log("👤 Redirecting to user dashboard");
          navigate("/user/dashboard", { replace: true });
          break;
        default:
          console.error("❌ Unknown user type for redirect:", auth.userType);
          navigate("/dashboard", { replace: true });
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.userType, navigate, location]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Login form submitted");

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting", {
        position: "top-right",
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log("🔐 Attempting login with:", { email: formData.email });

      const response = await authService.login(
        formData.email,
        formData.password
      );

      console.log("✅ Login API response:", response.data);

      const { success, message, token, user, staff, admin } = response.data;

      if (success && token) {
        console.log("🎯 Login successful, processing user data...");

        let userData, userType, rights;

        if (admin) {
          console.log("👑 Admin user detected");
          userData = admin;
          userType = "ADMIN";
          rights = admin.rightsPrivileges || "ADMIN";
          toast.success(`Welcome back, ${admin.name || 'Admin'}!`, {
            position: "top-right",
          });
        } else if (staff) {
          console.log("👨‍💼 Staff user detected");
          userData = staff;
          userType = "STAFF";
          rights = staff.rightsPrivileges || "BASIC_STAFF";
          toast.success(`Welcome back, ${staff.name || 'Staff'}!`, {
            position: "top-right",
          });
        } else if (user) {
          console.log("👤 Regular user detected");
          userData = user;
          userType = "USER";
          rights = user.rightsPrivileges || "BASIC_USER";
          toast.success (`Welcome back, ${user.name || 'User'}!`, {
            position: "top-right",
          });
        } else {
          console.error("❌ No user data in response");
          toast.error("Login successful but no user data received. Please contact support.", {
            position: "top-right",
          });
          setIsLoading(false);
          return;
        }

        console.log("🔄 Calling AuthContext login with:", {
          userType,
          userData,
        });

        await login(token, userData, userType, rights);

        console.log("✅ AuthContext login completed");
        
      } else {
        console.error("❌ Login failed in API:", message);
        const errorMsg = message || "Login failed. Please check your credentials.";
        toast.error(errorMsg, {
          position: "top-right",
        });
        setErrors({ general: errorMsg });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        switch (status) {
          case 401:
            errorMessage = serverMessage || "Invalid email or password";
            break;
          case 403:
            errorMessage = serverMessage || "Account is inactive. Please contact administrator.";
            break;
          case 404:
            errorMessage = serverMessage || "Account not found. Please check your email.";
            break;
          case 422:
            errorMessage = serverMessage || "Invalid input data. Please check your entries.";
            break;
          case 429:
            errorMessage = "Too many login attempts. Please try again later.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = serverMessage || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else {
        errorMessage = error.message || "An unexpected error occurred.";
      }

      toast.error(errorMessage, {
        position: "top-right",
      });
      setErrors({ general: errorMessage });
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    
    // Clear general error on any input change
    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: "",
      }));
    }
  };

  const handleInputFocus = (fieldName) => {
    // Clear field-specific error on focus
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  // Don't show login form if already authenticated (while redirecting)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          >
            <Shield className="h-7 w-7 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Form */}
          <motion.form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center"
              >
                <div className="flex-shrink-0">
                  <Shield className="h-4 w-4 mr-2" />
                </div>
                <span>{errors.general}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus('email')}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <span className="ml-1">{errors.email}</span>
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus('password')}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <span className="ml-1">{errors.password}</span>
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </motion.button>

            {/* Signup Link */}
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          </motion.form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">
              💡 The system automatically detects your account type (Admin, Staff, or User)
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;