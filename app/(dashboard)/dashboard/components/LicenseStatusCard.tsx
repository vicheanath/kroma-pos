"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";
import { ElectronReadyIndicator } from "@/components/electron-ready-indicator";
import Link from "next/link";

interface LicenseStatusCardProps {
  tier: string;
  licenseStatus: string;
  licenseInfo?: { trialDaysLeft?: number } | null;
}

export function LicenseStatusCard({
  tier,
  licenseStatus,
  licenseInfo,
}: LicenseStatusCardProps) {
  const getStatusMessage = () => {
    if (licenseStatus === "valid") return "Your license is active and valid.";
    if (licenseStatus === "trial")
      return `Trial mode: ${licenseInfo?.trialDaysLeft} days remaining.`;
    if (licenseStatus === "expired")
      return "Your license has expired. Please renew.";
    if (licenseStatus === "invalid")
      return "Invalid license. Please activate a valid license.";
    return "Checking license status...";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <Crown className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                  </h3>
                  <ElectronReadyIndicator />
                </div>
                <p className="text-muted-foreground">{getStatusMessage()}</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/settings/subscription">
                {tier !== "enterprise" ? "Upgrade Now" : "Manage Subscription"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
