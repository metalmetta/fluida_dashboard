
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function InvoicesRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/invoices");
  }, [navigate]);

  return null;
}
