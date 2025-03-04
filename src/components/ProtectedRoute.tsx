
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading, businessStatus } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check KYB verification status
  if (businessStatus === "pending_kyb") {
    return <Navigate to="/onboarding" replace />;
  }

  if (businessStatus === "kyb_submitted") {
    return <Navigate to="/pending-approval" replace />;
  }

  // Allow access only to approved businesses
  if (businessStatus !== "approved" && location.pathname !== "/auth") {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
}
