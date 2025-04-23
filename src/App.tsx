import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Auth from "@/pages/auth";
import Onboarding from "@/pages/onboarding";
import Invoices from "@/pages/invoices";
import Payments from "@/pages/payments";
import Bills from "@/pages/bills";
import Contacts from "@/pages/contacts";
import Settings from "@/pages/settings";
import Support from "@/pages/support";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import InternalTransfer from "@/pages/internal-transfer";
import InvoicePayment from "@/pages/invoice-payment/[id]";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <AuthProvider>
        <OnboardingProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
              <Route path="/internal-transfer" element={<ProtectedRoute><InternalTransfer /></ProtectedRoute>} />
              <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              <Route path="/logout" element={<Navigate to="/auth" />} />
              <Route path="/invoice-payment/:id" element={<InvoicePayment />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
