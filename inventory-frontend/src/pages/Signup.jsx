import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  UserPlus,
  Shield,
  Mail,
  User,
  Phone,
  Briefcase,
  Building,
  Home,
  Users,
  ShoppingCart,
  LogIn,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { authService } from "../services/api";
import { toast } from "react-toastify";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    designation: "",
    department: "",
    password: "",
    confirmPassword: "",
    userType: "STAFF",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Use ref to track if we're currently processing submission
  const isProcessingRef = useRef(false);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    } else if (formData.phoneNumber.replace(/\s/g, '').length < 10) {
      newErrors.phoneNumber = "Phone number must be at least 10 digits";
    }

    // Staff-specific validation
    if (formData.userType === "STAFF") {
      if (!formData.designation.trim()) {
        newErrors.designation = "Designation is required";
      } else if (formData.designation.trim().length < 2) {
        newErrors.designation = "Designation must be at least 2 characters";
      }

      if (!formData.department) {
        newErrors.department = "Please select a department";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/(?=.[!@#$%^&()_+\-=[\]{};':"\\|,.<>/?])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one special character";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      if (!isProcessingRef.current) {
        toast.error("Please fix the form errors before submitting", {
          position: "bottom-right",
        });
      }
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isProcessingRef.current) {
      return;
    }

    if (!validateForm()) return;

    // Set processing flag to prevent multiple notifications
    isProcessingRef.current = true;
    setIsLoading(true);
    setErrors({});

    try {
      console.log("Submitting registration data:", formData);

      let response;

      if (formData.userType === "STAFF") {
        // Staff registration - goes to staff table
        const staffData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phoneNumber: formData.phoneNumber.trim(),
          designation: formData.designation.trim(),
          department: formData.department,
          status: "ACTIVE",
        };

        console.log("Sending staff data:", staffData);
        response = await authService.registerStaff(staffData);
      } else {
        // Customer registration - goes to users table
        const userData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phoneNumber: formData.phoneNumber.trim(),
          status: "ACTIVE",
        };

        console.log("Sending user data:", userData);
        response = await authService.registerUser(userData);
      }

      console.log("Registration response:", response.data);

      if (response.data.success) {
        const userTypeText = formData.userType === "STAFF" ? "Staff" : "Customer";
        
        // Show ONLY ONE success notification
        toast.success(
          `${userTypeText} account created successfully! Please login.`,
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );

        // Navigate after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 2000);

      } else {
        const errorMsg = response.data.message || "Registration failed";
        toast.error(errorMsg, {
          position: "bottom-right",
        });
        setErrors({ general: errorMsg });
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data?.details) {
        // Validation errors from backend
        const validationErrors = {};
        error.response.data.details.forEach((detail) => {
          const field = detail.split(":")[0].trim();
          const message = detail.split(":")[1]?.trim() || detail;
          validationErrors[field] = message;
        });
        setErrors(validationErrors);
        
        // Show only the first validation error
        const firstError = Object.values(validationErrors)[0];
        if (firstError) {
          toast.error(firstError, {
            position: "bottom-right",
          });
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        toast.error(errorMessage, {
          position: "bottom-right",
        });
        setErrors({ general: errorMessage });
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your internet connection and try again.";
        toast.error(errorMessage, {
          position: "bottom-right",
        });
        setErrors({ general: errorMessage });
      } else if (error.response?.status === 409) {
        errorMessage = "An account with this email already exists.";
        toast.error(errorMessage, {
          position: "bottom-right",
        });
        setErrors({ general: errorMessage });
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid input data. Please check your entries.";
        toast.error(errorMessage, {
          position: "bottom-right",
        });
        setErrors({ general: errorMessage });
      } else {
        toast.error(errorMessage, {
          position: "bottom-right",
        });
        setErrors({ general: errorMessage });
      }
    } finally {
      // Reset processing flag
      isProcessingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
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

  const handleUserTypeChange = (userType) => {
    setFormData((prev) => ({
      ...prev,
      userType,
      // Reset professional fields when switching to customer
      designation: userType === "CUSTOMER" ? "" : prev.designation,
      department: userType === "CUSTOMER" ? "" : prev.department,
    }));
    // Clear errors when user type changes
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to Home - Top Left */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors mb-6 text-sm"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </motion.button>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          >
            <UserPlus className="h-7 w-7 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join our platform in seconds</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* User Type Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
              I want to register as:
            </h3>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleUserTypeChange("STAFF")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 rounded-xl transition-all duration-200 ${
                  formData.userType === "STAFF"
                    ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                    : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Staff Member</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleUserTypeChange("CUSTOMER")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 rounded-xl transition-all duration-200 ${
                  formData.userType === "CUSTOMER"
                    ? "border-purple-500 bg-purple-50 text-purple-600 shadow-sm"
                    : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm font-medium">Customer</span>
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <motion.form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center"
              >
                <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{errors.general}</span>
              </motion.div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleInputFocus('name')}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.name
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <span className="ml-1">{errors.name}</span>
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onFocus={() => handleInputFocus('phoneNumber')}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.phoneNumber
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Enter your phone number"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <span className="ml-1">{errors.phoneNumber}</span>
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Fields - Only for Staff */}
            {formData.userType === "STAFF" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Designation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Designation *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        name="designation"
                        type="text"
                        value={formData.designation}
                        onChange={handleChange}
                        onFocus={() => handleInputFocus('designation')}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.designation
                            ? "border-red-300 focus:ring-red-500 bg-red-50"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                        placeholder="Your designation"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.designation && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-sm text-red-600 flex items-center"
                      >
                        <span className="ml-1">{errors.designation}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        onFocus={() => handleInputFocus('department')}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.department
                            ? "border-red-300 focus:ring-red-500 bg-red-50"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                        disabled={isLoading}
                      >
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Operations">Operations</option>
                        <option value="Customer Service">Customer Service</option>
                        <option value="Research & Development">Research & Development</option>
                      </select>
                    </div>
                    {errors.department && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-sm text-red-600 flex items-center"
                      >
                        <span className="ml-1">{errors.department}</span>
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Password Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                      placeholder="Enter password"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => handleInputFocus('confirmPassword')}
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.confirmPassword
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Confirm password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <span className="ml-1">{errors.confirmPassword}</span>
                    </motion.p>
                  )}
                </div>
              </div>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>
                    Create {formData.userType === "STAFF" ? "Staff" : "Customer"} Account
                  </span>
                </>
              )}
            </motion.button>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline flex items-center justify-center gap-1"
                >
                  <LogIn className="h-4 w-4" />
                  Login here
                </Link>
              </p>
            </div>
          </motion.form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">
              💡 Admin accounts can only be created by existing administrators
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;