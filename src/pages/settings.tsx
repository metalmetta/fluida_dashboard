
import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { useSettingsData } from "@/components/settings/SettingsData";

export default function Settings() {
  const { loading } = useSettingsData();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <p>Loading settings...</p>
          </div>
        ) : (
          <SettingsTabs />
        )}
      </div>
    </DashboardLayout>
  );
}
