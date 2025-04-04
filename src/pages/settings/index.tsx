
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useLocation } from "react-router-dom";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { useProfileData } from "@/hooks/useProfileData";
import { SubtitleCard } from "@/components/ui/subtitle-card";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const location = useLocation();
  
  const { profileData, setProfileData, loading, user } = useProfileData(
    location.state?.promptProfileCompletion
  );

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <SubtitleCard 
          text="Configure your account details, company information, and payment preferences."
          tooltip="Complete your profile to unlock all features and improve your experience with Fluida."
        />

        <SettingsTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          profileData={profileData}
          setProfileData={setProfileData}
          loading={loading}
          userId={user?.id}
        />
      </div>
    </DashboardLayout>
  );
}
