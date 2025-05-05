"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSubscription } from "@/components/subscription-provider"
import { useLicense } from "@/components/license-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Crown, X, AlertTriangle, Shield, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SubscriptionPage() {
  const { tier, upgradeTier, lastSynced, syncHistory } = useSubscription()
  const {
    licenseInfo,
    licenseStatus,
    licenseKey,
    setLicenseKey,
    isLoading,
    checkLicense,
    activateLicense,
    deactivateLicense,
  } = useLicense()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [newLicenseKey, setNewLicenseKey] = useState("")
  const [isLicenseDialogOpen, setIsLicenseDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleUpgrade = async (newTier: "free" | "pro" | "enterprise") => {
    setIsUpgrading(true)
    await upgradeTier(newTier)
    setIsUpgrading(false)
  }

  const handleCheckLicense = async () => {
    await checkLicense()
  }

  const handleActivateLicense = async () => {
    if (!newLicenseKey) {
      toast({
        title: "License Key Required",
        description: "Please enter a valid license key",
        variant: "destructive",
      })
      return
    }

    setIsActivating(true)
    const success = await activateLicense(newLicenseKey)
    setIsActivating(false)

    if (success) {
      setIsLicenseDialogOpen(false)
      setNewLicenseKey("")
    }
  }

  const handleDeactivateLicense = async () => {
    const success = await deactivateLicense()
    if (success) {
      toast({
        title: "License Deactivated",
        description: "Your license has been deactivated and reverted to Free plan.",
      })
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  const getLicenseStatusColor = () => {
    switch (licenseStatus) {
      case "valid":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "trial":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "expired":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      case "invalid":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      case "checking":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getLicenseStatusIcon = () => {
    switch (licenseStatus) {
      case "valid":
        return <ShieldCheck className="h-4 w-4 mr-2" />
      case "trial":
        return <Shield className="h-4 w-4 mr-2" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 mr-2" />
      case "invalid":
        return <ShieldAlert className="h-4 w-4 mr-2" />
      case "checking":
        return <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      default:
        return <Shield className="h-4 w-4 mr-2" />
    }
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic POS functionality for small businesses",
      features: ["Unlimited products", "Basic sales tracking", "Single store management", "Local data storage only"],
      limitations: ["No cloud sync", "No multi-store support", "Limited reporting"],
      tier: "free" as const,
    },
    {
      name: "Pro",
      price: "$29",
      description: "Advanced features for growing businesses",
      features: [
        "Everything in Free",
        "Advanced reporting",
        "Customer management",
        "Barcode generation",
        "Export data to CSV",
      ],
      limitations: ["No cloud sync", "No multi-store support"],
      tier: "pro" as const,
    },
    {
      name: "Enterprise",
      price: "$99",
      description: "Complete solution for multi-location businesses",
      features: [
        "Everything in Pro",
        "Cloud sync and backup",
        "Multi-store management",
        "User role management",
        "Advanced analytics",
        "Priority support",
      ],
      limitations: [],
      tier: "enterprise" as const,
    },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan and features.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>License Information</CardTitle>
            <CardDescription>Your license details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={tier === "enterprise" ? "default" : "outline"} className="uppercase">
                    {tier}
                  </Badge>
                  {tier === "enterprise" && (
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500">
                      <Crown className="mr-1 h-3 w-3" />
                      PREMIUM
                    </Badge>
                  )}
                </div>

                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Status:</span>
                  <span className={`flex items-center text-sm px-2 py-1 rounded-full ${getLicenseStatusColor()}`}>
                    {getLicenseStatusIcon()}
                    {licenseStatus === "valid" && "Valid"}
                    {licenseStatus === "trial" && `Trial (${licenseInfo?.trialDaysLeft} days left)`}
                    {licenseStatus === "expired" && "Expired"}
                    {licenseStatus === "invalid" && "Invalid"}
                    {licenseStatus === "checking" && "Checking..."}
                    {licenseStatus === "unknown" && "Unknown"}
                  </span>
                </div>

                <p className="text-sm">
                  <span className="font-medium">License Key:</span>{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">{licenseKey || "No license key"}</code>
                </p>

                {licenseInfo?.expiresAt && (
                  <p className="text-sm">
                    <span className="font-medium">Expires:</span> {new Date(licenseInfo.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleCheckLicense} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check License
                    </>
                  )}
                </Button>

                <Button variant="outline" size="sm" onClick={() => setIsLicenseDialogOpen(true)}>
                  Activate License
                </Button>

                {licenseKey !== "FREE-0000-0000-0000" && (
                  <Button variant="outline" size="sm" onClick={handleDeactivateLicense} disabled={isLoading}>
                    Deactivate License
                  </Button>
                )}
              </div>
            </div>

            {tier === "enterprise" && lastSynced && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Last synced: {lastSynced.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={tier === plan.tier ? "border-primary shadow-md" : ""}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {plan.name}
                  {plan.tier === "enterprise" && <Crown className="h-5 w-5 text-primary" />}
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> /month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{plan.description}</p>

                <div>
                  <p className="font-medium mb-2">Features:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Limitations:</p>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation) => (
                        <li key={limitation} className="flex items-start">
                          <X className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                          <span className="text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {tier === plan.tier ? (
                  <Button className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.tier === "enterprise" ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.tier)}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? "Processing..." : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </motion.div>

      {tier === "enterprise" && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Recent cloud synchronization activity</CardDescription>
            </CardHeader>
            <CardContent>
              {syncHistory.length > 0 ? (
                <div className="space-y-4">
                  {syncHistory.slice(0, 5).map((record, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">
                          {record.status === "success" ? (
                            <span className="text-green-500">Sync successful</span>
                          ) : (
                            <span className="text-red-500">Sync failed</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{record.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{record.date.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sync history available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* License Activation Dialog */}
      <Dialog open={isLicenseDialogOpen} onOpenChange={setIsLicenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate License</DialogTitle>
            <DialogDescription>Enter your license key to activate premium features</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="license-key">License Key</Label>
              <Input
                id="license-key"
                placeholder="Enter your license key"
                value={newLicenseKey}
                onChange={(e) => setNewLicenseKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For testing, use: FREE-0000-0000-0000, PRO-1234-5678-9012, ENT-9876-5432-1098, or TRIAL-2022-3344-5566
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLicenseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleActivateLicense} disabled={isActivating}>
              {isActivating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                "Activate License"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
