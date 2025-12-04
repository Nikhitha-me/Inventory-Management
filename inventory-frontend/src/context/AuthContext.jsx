// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    userType: null,
    rights: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    console.log("🔄 AuthProvider mounted - checking localStorage");
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        const userType = localStorage.getItem("userType");
        const rights = localStorage.getItem("rights");

        console.log("📦 LocalStorage contents:", {
          token: token ? "exists" : "null",
          user: user ? "exists" : "null",
          userType,
          rights,
        });

        if (token && user && userType) {
          console.log("✅ User found in localStorage, setting auth");
          setAuth({
            user: JSON.parse(user),
            userType: userType,
            rights: rights,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          console.log("❌ No valid user data in localStorage");
          setAuth({
            user: null,
            userType: null,
            rights: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
        setAuth({
          user: null,
          userType: null,
          rights: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (token, userData, userType, rights) => {
    console.log("🔐 AuthContext.login called with:", { userType, userData });
    try {
      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("userType", userType);
      localStorage.setItem("rights", rights);

      // Update state
      setAuth({
        user: userData,
        userType: userType,
        rights: rights,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log("✅ Auth state updated successfully");
    } catch (error) {
      console.error("❌ Login error in AuthContext:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("🚪 Logging out - clearing all data");
    
    // Clear all localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("rights");
    
    // Clear any other potential stored data
    localStorage.removeItem("lastLogin");
    localStorage.removeItem("userPreferences");
    localStorage.removeItem("dashboardState");
    
    // Clear sessionStorage as well
    sessionStorage.clear();
    
    // Reset auth state completely
    setAuth({
      user: null,
      userType: null,
      rights: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    // Force a hard reload to clear any cached state
    window.location.href = "/login";
  };

  const value = {
    auth,
    login,
    logout,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    userType: auth.userType,
  };

  console.log("🎯 Current Auth State:", auth);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};