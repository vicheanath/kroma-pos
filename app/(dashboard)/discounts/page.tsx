"use client";

import { useState } from "react";
import { useDiscount } from "@/components/discount-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type Discount } from "@/lib/db";
import { DiscountTable } from "./components/DiscountTable";
import { AddDiscountDialog } from "./components/AddDiscountDialog";
import { EditDiscountDialog } from "./components/EditDiscountDialog";
export default function DiscountsPage() {
  const { discounts, addDiscount, updateDiscount, removeDiscount } =
    useDiscount();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);
  const [newDiscount, setNewDiscount] = useState<
    Omit<Discount, "id" | "usageCount">
  >({
    name: "",
    code: "",
    type: "percentage",
    value: 0,
    isActive: true,
    appliesTo: "all",
  });

  const handleAddDiscount = () => {
    addDiscount(newDiscount);
    setNewDiscount({
      name: "",
      code: "",
      type: "percentage",
      value: 0,
      isActive: true,
      appliesTo: "all",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditDiscount = () => {
    if (!currentDiscount) return;
    updateDiscount(currentDiscount);
    setIsEditDialogOpen(false);
    setCurrentDiscount(null);
  };

  const handleRemoveDiscount = (id: string) => {
    removeDiscount(id);
  };

  return (
    <div className="space-y-6 overflow-hidden min-w-0">
      <div className="flex justify-between items-center min-w-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
          <p className="text-muted-foreground">
            Manage discounts and promotions for your store
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Discount
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Active Discounts</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden min-w-0">
          <DiscountTable
            discounts={discounts}
            onEdit={(discount) => {
              setCurrentDiscount(discount);
              setIsEditDialogOpen(true);
            }}
            onDelete={handleRemoveDiscount}
          />
        </CardContent>
      </Card>

      <AddDiscountDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        discount={newDiscount}
        onDiscountChange={setNewDiscount}
        onSubmit={handleAddDiscount}
      />

      <EditDiscountDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setCurrentDiscount(null);
        }}
        discount={currentDiscount}
        onDiscountChange={setCurrentDiscount}
        onSubmit={handleEditDiscount}
      />
    </div>
  );
}
