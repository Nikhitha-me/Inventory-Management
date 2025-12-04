/// App.jsx - Updated routing
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import UserDashboard from "./pages/UserDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UnauthorizedPage from "./pages/Unauthorized";

// Component to redirect users based on their role
const RoleBasedRedirect = () => {
  const { auth } = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (auth.userType) {
    case "ADMIN":
      return <Navigate to="/admin/dashboard" replace />;
    case "STAFF":
      return <Navigate to="/staff/dashboard" replace />;
    case "USER":
      return <Navigate to="/user/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Staff routes */}
          <Route
            path="/staff/*"
            element={
              <ProtectedRoute requiredRole="STAFF">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          {/* User routes */}
          <Route
            path="/user/*"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Dashboard redirect */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;