"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload,
  Download,
  LogOut,
  LogIn,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { exportAllData, importAllData } from "@/lib/data-portability";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function GoogleDriveSync() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Find the Card component in the return statement and update it

  const handleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: window.location.href });
    } catch (error) {
      toast({
        title: "Sign In Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: window.location.href });
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!session?.accessToken) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in with Google first.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Export data from IndexedDB
      setProgress(20);
      const data = await exportAllData();

      // Upload to Google Drive via API
      setProgress(50);
      const response = await fetch("/api/sync/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      setProgress(80);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to upload to Google Drive");
      }

      setProgress(100);

      toast({
        title: "Upload Successful",
        description: "Your data has been successfully synced to Google Drive.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload data to Google Drive.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDownload = async () => {
    if (!session?.accessToken) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in with Google first.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    setProgress(0);

    try {
      setProgress(20);

      // Download from Google Drive via API
      const response = await fetch("/api/sync/download");
      setProgress(50);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to download from Google Drive");
      }

      if (!result.data) {
        throw new Error("No data received from Google Drive");
      }

      setProgress(70);

      // Import data into IndexedDB
      await importAllData(result.data);

      setProgress(100);

      toast({
        title: "Download Successful",
        description:
          "Your data has been successfully synced from Google Drive. Please refresh the page.",
      });

      // Reload page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description:
          error.message || "Failed to download data from Google Drive.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  if (status === "loading") {
    return (
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="h-5 w-5">☁️</span>
            Google Drive Sync
          </CardTitle>
          <CardDescription>Connecting...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="h-5 w-5">☁️</span>
            Google Drive Sync
          </CardTitle>
          <CardDescription>
            Sign in with Google to sync your POS data to Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Connected</AlertTitle>
              <AlertDescription>
                You need to sign in with Google to enable cloud sync
                functionality.
              </AlertDescription>
            </Alert>
            <Button onClick={handleSignIn} className="w-full gap-2 shadow-sm">
              <LogIn className="h-4 w-4" />
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="h-5 w-5">☁️</span>
          Google Drive Sync
        </CardTitle>
        <CardDescription>
          Sync your POS data to and from Google Drive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-muted/50">
          <div className="flex items-center space-x-3">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-12 w-12 rounded-full border-2 border-primary/20"
              />
            )}
            <div>
              <p className="font-semibold">{session.user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {(isUploading || isDownloading) && (
          <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center font-medium">
              {isUploading
                ? "Uploading to Google Drive..."
                : "Downloading from Google Drive..."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleUpload}
            disabled={isUploading || isDownloading}
            variant="outline"
            className="w-full gap-2 shadow-sm"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload to Drive
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isUploading || isDownloading}
            variant="outline"
            className="w-full gap-2 shadow-sm"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download from Drive
          </Button>
        </div>

        <Alert className="border-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Connected</AlertTitle>
          <AlertDescription>
            Your data will be stored in a folder named "Kroma POS Backups" in
            your Google Drive.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
