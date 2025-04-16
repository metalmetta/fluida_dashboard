
import { Building, CreditCard } from "lucide-react";
import { BankDetailsSection } from "./BankDetailsSection";

interface USDDepositDetailsProps {
  bankDetails: {
    accountName: string;
    routingNumber: string;
    accountNumber: string;
    bankName: string;
    address: string;
    swiftCode: string;
  };
  onCopy: (text: string, label: string) => void;
}

export function USDDepositDetails({ bankDetails, onCopy }: USDDepositDetailsProps) {
  return (
    <div className="space-y-4">
      <BankDetailsSection
        title="ACH Instructions"
        icon={Building}
        details={[
          { label: "Account Name", value: bankDetails.accountName },
          { label: "Routing Number", value: bankDetails.routingNumber },
          { label: "Account Number", value: bankDetails.accountNumber },
          { label: "Bank Name", value: bankDetails.bankName }
        ]}
        onCopy={onCopy}
      />

      <BankDetailsSection
        title="WIRE Instructions"
        icon={CreditCard}
        details={[
          { label: "SWIFT Code", value: bankDetails.swiftCode },
          { label: "Bank Address", value: bankDetails.address },
          { label: "Account Number", value: bankDetails.accountNumber }
        ]}
        onCopy={onCopy}
      />
    </div>
  );
}
