
import { Navigate } from "react-router-dom";

export default function AuthIndex() {
  return <Navigate to="/auth/login" replace />;
}
