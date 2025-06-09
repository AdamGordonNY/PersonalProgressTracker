"use client";

import { Suspense, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FeatureToggle } from "@/components/onboarding/feature-toggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { UserCircle, ToggleLeft, Sliders } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [googleToken, setGoogleToken] = useState("");
  const [microsoftToken, setMicrosoftToken] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const handleSaveTokens = async () => {
    try {
      const response = await fetch("/api/user/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          google: googleToken,
          microsoft: microsoftToken,
        }),
      });

      if (!response.ok) throw new Error("Failed to save tokens");

      toast({
        title: "Success",
        description: "Access tokens have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update access tokens",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4" />
            <span>Features</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Personal Information</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  defaultValue={user?.fullName || ""}
                  className="mt-1"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                  className="mt-1"
                  disabled
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Suspense fallback={<Skeleton className="h-[500px] rounded-md" />}>
            <FeatureToggle />
          </Suspense>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Access Tokens</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="google">Google Drive Token</Label>
                <Input
                  id="google"
                  value={googleToken}
                  onChange={(e) => setGoogleToken(e.target.value)}
                  className="mt-1"
                  placeholder="Enter Google Drive access token"
                />
              </div>
              <div>
                <Label htmlFor="microsoft">Microsoft OneDrive Token</Label>
                <Input
                  id="microsoft"
                  value={microsoftToken}
                  onChange={(e) => setMicrosoftToken(e.target.value)}
                  className="mt-1"
                  placeholder="Enter OneDrive access token"
                />
              </div>
              <Button onClick={handleSaveTokens} className="mt-2">
                Save Tokens
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
