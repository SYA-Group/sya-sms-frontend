// src/components/ProtectedRoute.tsx
import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const getToken = () => {
    const t =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      Cookies.get("token");
  
    if (!t) return null;
    if (t === "null" || t === "undefined") return null;
    return t;
  };
  
  const token = Boolean(getToken());

  if (!token) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
