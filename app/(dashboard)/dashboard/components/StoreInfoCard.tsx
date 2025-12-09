"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Store {
  name: string;
  address: string;
}

interface StoreInfoCardProps {
  activeStore: Store | null;
  canUseEnterpriseFeatures: boolean;
}

export function StoreInfoCard({
  activeStore,
  canUseEnterpriseFeatures,
}: StoreInfoCardProps) {
  if (!activeStore) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{activeStore.name}</h3>
              <p className="text-muted-foreground">{activeStore.address}</p>
            </div>
            {canUseEnterpriseFeatures && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/stores">Manage Stores</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
