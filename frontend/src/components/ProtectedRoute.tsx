import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      // If no token, redirect to login
      window.location.href = "/login";
    }
  }, [token]);

  if (!token) {
    // Show a loading state or return null while checking
    return <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;