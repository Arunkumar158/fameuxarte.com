import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Shield, Bell, Lock, AlertTriangle, Settings as SettingsIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhoneNumber(profile.phone_number || "");
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "account", label: "Account", icon: SettingsIcon },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle, className: "text-destructive hover:text-destructive hover:bg-destructive/10 mt-8" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-[32px] font-medium text-linen">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 items-start">
        {/* Navigation Sidebar */}
        <div className="flex flex-col space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors ${
                  isActive 
                    ? "bg-surface-3 text-linen" 
                    : tab.className || "text-stone hover:bg-surface-2 hover:text-linen"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-surface-1 border border-border-subtle rounded-[16px] p-8">
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-[20px] font-medium text-linen mb-1">Public Profile</h2>
                <p className="text-[13px] text-stone">Manage how you appear to others on the platform.</p>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-gold animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[12px] text-stone">Email (Non-editable)</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ""} 
                      disabled 
                      className="border-border-subtle bg-surface-2 text-stone opacity-70" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[12px] text-stone">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Thomas Crown"
                      className="border-border-subtle bg-obsidian text-linen focus:border-gold" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-[12px] text-stone">Phone Number</Label>
                    <Input 
                      id="phoneNumber" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="border-border-subtle bg-obsidian text-linen focus:border-gold" 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-gold text-obsidian hover:bg-linen rounded-full px-8"
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              )}
            </div>
          )}

          {activeTab !== "profile" && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in">
              <SettingsIcon className="w-12 h-12 text-stone opacity-20 mb-4" />
              <h2 className="text-[20px] font-medium text-linen mb-2">Coming Soon</h2>
              <p className="text-stone max-w-sm">
                The {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} settings module is currently under development.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
