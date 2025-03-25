
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Enter your information to get started"
    >
      <SignupForm />
    </AuthLayout>
  );
}
