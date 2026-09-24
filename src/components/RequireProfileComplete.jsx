import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireProfileComplete({ children }) {
  const { user, profileComplete, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07111f] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
      </div>
    );
  }

  if (user && !profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}
