
import { Euro } from "lucide-react";
import { BankDetailsSection } from "./BankDetailsSection";

interface EURDepositDetailsProps {
  bankDetails: {
    accountName: string;
    iban: string;
    bic: string;
    bankName: string;
    address: string;
    reference: string;
  };
  onCopy: (text: string, label: string) => void;
}

export function EURDepositDetails({ bankDetails, onCopy }: EURDepositDetailsProps) {
  return (
    <div className="space-y-4">
      <BankDetailsSection
        title="SEPA Instructions"
        icon={Euro}
        details={[
          { label: "Account Name", value: bankDetails.accountName },
          { label: "IBAN", value: bankDetails.iban },
          { label: "BIC/SWIFT", value: bankDetails.bic },
          { label: "Bank Name", value: bankDetails.bankName },
          { label: "Bank Address", value: bankDetails.address },
          { label: "Reference", value: bankDetails.reference }
        ]}
        onCopy={onCopy}
      />
    </div>
  );
}
