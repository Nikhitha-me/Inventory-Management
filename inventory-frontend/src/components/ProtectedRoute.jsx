// src/components/ProtectedRoute.jsx - Fixed
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredRights,
  fallbackPath = "/unauthorized",
}) => {
  const { auth, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log("🛡️ ProtectedRoute check:", {
    isAuthenticated,
    isLoading,
    userRole: auth.userType,
    requiredRole,
    path: location.pathname,
    fullAuthState: auth, // Log full auth state
  });

  if (isLoading) {
    console.log("⏳ Loading auth state...");
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access - FIXED: Handle multiple roles
  if (requiredRole) {
    // If requiredRole is an array, check if user has any of the roles
    // If it's a string, check for exact match
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(auth.userType)
      : auth.userType === requiredRole;

    if (!hasRequiredRole) {
      console.log("🚫 Role access denied:", {
        required: requiredRole,
        userRole: auth.userType,
        hasRequiredRole,
      });
      return (
        <Navigate
          to={fallbackPath}
          state={{
            from: location,
            requiredRole,
            userRole: auth.userType,
          }}
          replace
        />
      );
    }
  }

  // Check rights-based access
  if (requiredRights) {
    const hasRequiredRights = Array.isArray(requiredRights)
      ? requiredRights.some((right) => auth.rights?.includes(right))
      : auth.rights?.includes(requiredRights);

    if (!hasRequiredRights) {
      console.log("🚫 Rights access denied:", {
        required: requiredRights,
        userRights: auth.rights,
        hasRequiredRights,
      });
      return (
        <Navigate
          to={fallbackPath}
          state={{
            from: location,
            requiredRights,
            userRights: auth.rights,
          }}
          replace
        />
      );
    }
  }

  console.log("✅ Access granted to:", location.pathname);
  return children;
};

export default ProtectedRoute;
