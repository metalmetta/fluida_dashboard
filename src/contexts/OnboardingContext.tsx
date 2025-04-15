
import { createContext, useContext, useState } from "react";

// Define types for the onboarding data
export type CompanyInformation = {
  legalName: string;
  tradingName: string;
  registrationNumber: string;
  registrationDate: string;
  taxIdentificationType: string;
  taxIdentificationValue: string;
  countryOfIncorporation: string;
  legalStructure: string;
  businessSector: string;
  businessIndustry: string;
  website: string;
  status: string;
};

export type Address = {
  streetLine1: string;
  city: string;
  stateProvinceRegion: string;
  postalCode: string;
  country: string;
};

export type UltimateBeneficialOwner = {
  uboType: string;
  ownershipPercentage: number;
  hasOwnership: boolean;
  hasControl: boolean;
  title: string;
  email: string;
  phone: string;
  taxIdentificationType: string;
  taxIdentificationValue: string;
  govIdCountry: string;
  relationshipEstablishedAt: string;
  isSigner: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string[];
  countryOfResidence: string;
  documentType: string;
  documentNumber: string;
  issuingCountry: string;
  pepStatus: boolean;
  sanctionScreeningPassed: boolean;
  // We won't collect file uploads in this implementation
};

export type ContactInformation = {
  email: string;
  phoneNumber: string;
};

export type OnboardingData = {
  type: string;
  countryCode: string;
  companyInformation: CompanyInformation;
  registeredAddress: Address;
  operationalAddress: {
    sameAsRegisteredAddress: boolean;
    address?: Address;
  };
  ultimateBeneficialOwners: UltimateBeneficialOwner[];
  contactInformation: ContactInformation;
};

type OnboardingContextType = {
  currentStep: number;
  totalSteps: number;
  onboardingData: OnboardingData;
  setCurrentStep: (step: number) => void;
  updateCompanyInformation: (data: Partial<CompanyInformation>) => void;
  updateRegisteredAddress: (data: Partial<Address>) => void;
  updateOperationalAddress: (data: { sameAsRegisteredAddress: boolean; address?: Partial<Address> }) => void;
  updateUltimateBeneficialOwner: (index: number, data: Partial<UltimateBeneficialOwner>) => void;
  addUltimateBeneficialOwner: () => void;
  removeUltimateBeneficialOwner: (index: number) => void;
  updateContactInformation: (data: Partial<ContactInformation>) => void;
  isStepComplete: (step: number) => boolean;
  submitOnboardingData: () => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
};

// Create default values for the onboarding data
const defaultOnboardingData: OnboardingData = {
  type: "BUSINESS",
  countryCode: "US",
  companyInformation: {
    legalName: "",
    tradingName: "",
    registrationNumber: "",
    registrationDate: "",
    taxIdentificationType: "ein",
    taxIdentificationValue: "",
    countryOfIncorporation: "US",
    legalStructure: "corporation",
    businessSector: "",
    businessIndustry: "",
    website: "",
    status: "active",
  },
  registeredAddress: {
    streetLine1: "",
    city: "",
    stateProvinceRegion: "",
    postalCode: "",
    country: "US",
  },
  operationalAddress: {
    sameAsRegisteredAddress: true,
  },
  ultimateBeneficialOwners: [
    {
      uboType: "individual",
      ownershipPercentage: 100,
      hasOwnership: true,
      hasControl: true,
      title: "",
      email: "",
      phone: "",
      taxIdentificationType: "ssn",
      taxIdentificationValue: "",
      govIdCountry: "US",
      relationshipEstablishedAt: new Date().toISOString(),
      isSigner: true,
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: ["US"],
      countryOfResidence: "US",
      documentType: "passport",
      documentNumber: "",
      issuingCountry: "US",
      pepStatus: false,
      sanctionScreeningPassed: true,
    },
  ],
  contactInformation: {
    email: "",
    phoneNumber: "",
  },
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const totalSteps = 5; // Company, Registered Address, UBO, Contact, Review

  const updateCompanyInformation = (data: Partial<CompanyInformation>) => {
    setOnboardingData(prev => ({
      ...prev,
      companyInformation: {
        ...prev.companyInformation,
        ...data,
      },
    }));
  };

  const updateRegisteredAddress = (data: Partial<Address>) => {
    setOnboardingData(prev => ({
      ...prev,
      registeredAddress: {
        ...prev.registeredAddress,
        ...data,
      },
    }));
  };

  const updateOperationalAddress = (data: { sameAsRegisteredAddress: boolean; address?: Partial<Address> }) => {
    setOnboardingData(prev => ({
      ...prev,
      operationalAddress: {
        ...prev.operationalAddress,
        ...data,
        address: data.sameAsRegisteredAddress 
          ? undefined 
          : { ...prev.operationalAddress.address, ...data.address },
      },
    }));
  };

  const updateUltimateBeneficialOwner = (index: number, data: Partial<UltimateBeneficialOwner>) => {
    setOnboardingData(prev => {
      const updatedOwners = [...prev.ultimateBeneficialOwners];
      updatedOwners[index] = {
        ...updatedOwners[index],
        ...data,
      };
      return {
        ...prev,
        ultimateBeneficialOwners: updatedOwners,
      };
    });
  };

  const addUltimateBeneficialOwner = () => {
    setOnboardingData(prev => ({
      ...prev,
      ultimateBeneficialOwners: [
        ...prev.ultimateBeneficialOwners,
        {
          ...defaultOnboardingData.ultimateBeneficialOwners[0],
          ownershipPercentage: 0,
          email: "",
          phone: "",
          firstName: "",
          lastName: "",
        },
      ],
    }));
  };

  const removeUltimateBeneficialOwner = (index: number) => {
    setOnboardingData(prev => ({
      ...prev,
      ultimateBeneficialOwners: prev.ultimateBeneficialOwners.filter((_, i) => i !== index),
    }));
  };

  const updateContactInformation = (data: Partial<ContactInformation>) => {
    setOnboardingData(prev => ({
      ...prev,
      contactInformation: {
        ...prev.contactInformation,
        ...data,
      },
    }));
  };

  // Check if a step is complete
  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: // Company Information
        const company = onboardingData.companyInformation;
        return Boolean(
          company.legalName && 
          company.registrationNumber && 
          company.registrationDate && 
          company.taxIdentificationValue && 
          company.businessSector && 
          company.businessIndustry
        );
      case 2: // Registered Address
        const address = onboardingData.registeredAddress;
        return Boolean(
          address.streetLine1 && 
          address.city && 
          address.stateProvinceRegion && 
          address.postalCode
        );
      case 3: // UBO
        const ubo = onboardingData.ultimateBeneficialOwners[0];
        return Boolean(
          ubo.firstName && 
          ubo.lastName && 
          ubo.email && 
          ubo.phone && 
          ubo.taxIdentificationValue && 
          ubo.dateOfBirth && 
          ubo.documentNumber
        );
      case 4: // Contact Information
        const contact = onboardingData.contactInformation;
        return Boolean(contact.email && contact.phoneNumber);
      default:
        return false;
    }
  };

  // Submit the onboarding data
  const submitOnboardingData = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format the data according to the API requirements
      const formattedData = {
        type: onboardingData.type,
        countryCode: onboardingData.countryCode,
        data: {
          companyInformation: {
            legalName: onboardingData.companyInformation.legalName,
            tradingName: onboardingData.companyInformation.tradingName || onboardingData.companyInformation.legalName,
            registrationNumber: onboardingData.companyInformation.registrationNumber,
            registrationDate: onboardingData.companyInformation.registrationDate,
            taxIdentificationNumber: {
              type: onboardingData.companyInformation.taxIdentificationType,
              value: onboardingData.companyInformation.taxIdentificationValue,
            },
            countryOfIncorporation: onboardingData.companyInformation.countryOfIncorporation,
            legalStructure: onboardingData.companyInformation.legalStructure,
            businessSector: onboardingData.companyInformation.businessSector,
            businessIndustry: onboardingData.companyInformation.businessIndustry,
            website: onboardingData.companyInformation.website,
            status: onboardingData.companyInformation.status,
          },
          registeredAddress: onboardingData.registeredAddress,
          operationalAddress: onboardingData.operationalAddress,
          ultimateBeneficialOwners: onboardingData.ultimateBeneficialOwners.map(ubo => ({
            uboType: ubo.uboType,
            ownershipPercentage: ubo.ownershipPercentage,
            hasOwnership: ubo.hasOwnership,
            hasControl: ubo.hasControl,
            title: ubo.title,
            email: ubo.email,
            phone: ubo.phone,
            taxIdentificationNumber: {
              type: ubo.taxIdentificationType,
              value: ubo.taxIdentificationValue,
            },
            govIdCountry: ubo.govIdCountry,
            relationshipEstablishedAt: ubo.relationshipEstablishedAt,
            isSigner: ubo.isSigner,
            firstName: ubo.firstName,
            lastName: ubo.lastName,
            individualDetails: {
              firstName: ubo.firstName,
              lastName: ubo.lastName,
              dateOfBirth: ubo.dateOfBirth,
              nationality: ubo.nationality,
              countryOfResidence: ubo.countryOfResidence,
              identification: {
                documentType: ubo.documentType,
                documentNumber: ubo.documentNumber,
                issuingCountry: ubo.issuingCountry,
              },
              address: onboardingData.registeredAddress, // We're using registered address for simplicity
              pepStatus: ubo.pepStatus,
              sanctionScreeningPassed: ubo.sanctionScreeningPassed,
              identityProof: {
                govFrontId: {
                  contentType: "image/jpeg"
                }
              }
            }
          })),
          documents: {
            registrationCertificate: {
              contentType: "application/pdf"
            },
            articlesOfAssociation: {
              contentType: "application/pdf"
            },
            proofOfAddress: {
              contentType: "application/pdf"
            },
            shareholderList: {
              contentType: "application/pdf"
            }
          },
          contactInformation: onboardingData.contactInformation,
          metadata: {
            consentProvided: true,
            consentDate: new Date().toISOString(),
            submissionTimestamp: new Date().toISOString(),
            countrySpecific: {
              stateOfIncorporation: onboardingData.registeredAddress.stateProvinceRegion
            }
          }
        }
      };

      // Make API call
      const response = await fetch("https://sandbox.infinite.dev/customers", {
        method: "POST",
        headers: {
          "x-api-key": "ia_UZPCx-629EOUM4cv-6o7XQ",
          "x-organization-id": "b89dfab6-8ebd-41cf-87e0-10db9f2826f1",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit onboarding data");
      }

      // Reset the state
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      throw err;
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        totalSteps,
        onboardingData,
        setCurrentStep,
        updateCompanyInformation,
        updateRegisteredAddress,
        updateOperationalAddress,
        updateUltimateBeneficialOwner,
        addUltimateBeneficialOwner,
        removeUltimateBeneficialOwner,
        updateContactInformation,
        isStepComplete,
        submitOnboardingData,
        isSubmitting,
        error,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
