
import React, { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  avatarUrl: string;
}

interface ProfileSectionProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  userId?: string;
}

export function ProfileSection({ profileData, setProfileData, userId }: ProfileSectionProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update both profile tables
      await Promise.all([
        // Update profiles table (legacy)
        supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', userId),
          
        // Update new profile_data table
        supabase
          .from('profile_data')
          .upsert({ 
            user_id: userId,
            avatar_url: avatarUrl,
          }, { onConflict: 'user_id' })
      ]);

      setProfileData({
        ...profileData,
        avatarUrl
      });

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    
    try {
      setSaving(true);
      
      // Update data in both the legacy profiles table and the new profile_data table
      await Promise.all([
        // Update profiles table (legacy)
        supabase
          .from('profiles')
          .update({
            full_name: profileData.fullName,
            company_name: profileData.companyName
          })
          .eq('id', userId),
          
        // Update or insert into profile_data table
        supabase
          .from('profile_data')
          .upsert({
            user_id: userId,
            full_name: profileData.fullName,
            email: profileData.email,
            phone: profileData.phone,
            avatar_url: profileData.avatarUrl
          }, { onConflict: 'user_id' })
      ]);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          {profileData.avatarUrl ? (
            <AvatarImage src={profileData.avatarUrl} alt={profileData.fullName} />
          ) : (
            <AvatarFallback>{getInitials(profileData.fullName)}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={uploadAvatar}
            accept="image/*"
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="mb-2"
            onClick={triggerFileInput}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Change Avatar"}
            {!uploading && <Upload className="ml-2 h-4 w-4" />}
          </Button>
          <p className="text-sm text-muted-foreground">
            JPG, GIF or PNG. Max size of 800K
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="Your name" 
              value={profileData.fullName}
              onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Your email" 
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              disabled
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            placeholder="Your phone number" 
            value={profileData.phone}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
          />
        </div>
      </div>

      <Button onClick={handleSaveProfile} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
