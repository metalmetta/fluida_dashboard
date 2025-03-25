
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Invoices from "@/pages/invoices";
import Payments from "@/pages/payments";
import Bills from "@/pages/bills";
import Contacts from "@/pages/contacts";
import Settings from "@/pages/settings";
import Support from "@/pages/support";
import NotFound from "@/pages/NotFound";
import AuthIndex from "@/pages/auth/index";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/logout" element={<Navigate to="/auth/login" />} />
          <Route path="/auth" element={<AuthIndex />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}
