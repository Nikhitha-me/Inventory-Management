// src/components/AuthDebugger.jsx (temporary)
import { useAuth } from "../context/AuthContext";

export const AuthDebugger = () => {
  const { auth } = useAuth();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        background: "red",
        color: "white",
        padding: "10px",
        zIndex: 9999,
      }}
    >
      <div>UserType: {auth.userType}</div>
      <div>Rights: {auth.rights}</div>
      <div>Authenticated: {auth.isAuthenticated ? "Yes" : "No"}</div>
    </div>
  );
};
