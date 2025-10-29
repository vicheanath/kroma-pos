"use client";

import { useState } from "react";
import { useDiscount } from "@/components/discount-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Percent, DollarSign, Plus, Edit, Trash2, Tag } from "lucide-react";
import { type Discount, type DiscountType } from "@/lib/db";
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

  const formatDiscountValue = (discount: Discount) => {
    return discount.type === "percentage"
      ? `${discount.value}%`
      : `$${discount.value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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

      <Card>
        <CardHeader>
          <CardTitle>Active Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.length > 0 ? (
                discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">
                      {discount.name}
                    </TableCell>
                    <TableCell>{discount.code || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {discount.type === "percentage" ? (
                          <Percent className="mr-1 h-4 w-4 text-muted-foreground" />
                        ) : (
                          <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                        )}
                        {formatDiscountValue(discount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {discount.appliesTo === "all"
                          ? "All Products"
                          : discount.appliesTo === "cart"
                          ? "Cart Total"
                          : discount.appliesTo === "category"
                          ? "Categories"
                          : "Specific Products"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={discount.isActive ? "default" : "secondary"}
                      >
                        {discount.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentDiscount(discount);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleRemoveDiscount(discount.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-8">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Tag className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>No discounts found</EmptyTitle>
                        <EmptyDescription>
                          Create your first discount to start offering promotions to customers.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Discount Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Discount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Discount Name</Label>
              <Input
                id="name"
                value={newDiscount.name}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, name: e.target.value })
                }
                placeholder="Summer Sale"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Discount Code (Optional)</Label>
              <Input
                id="code"
                value={newDiscount.code || ""}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, code: e.target.value })
                }
                placeholder="SUMMER25"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select
                  value={newDiscount.type}
                  onValueChange={(value: DiscountType) =>
                    setNewDiscount({ ...newDiscount, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  {newDiscount.type === "percentage"
                    ? "Percentage Value"
                    : "Fixed Amount"}
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {newDiscount.type === "percentage" ? (
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    id="value"
                    type="number"
                    value={newDiscount.value || ""}
                    onChange={(e) =>
                      setNewDiscount({
                        ...newDiscount,
                        value: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pl-9"
                    placeholder={
                      newDiscount.type === "percentage" ? "25" : "10.00"
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appliesTo">Applies To</Label>
              <Select
                value={newDiscount.appliesTo}
                onValueChange={(
                  value: "all" | "category" | "product" | "cart"
                ) => setNewDiscount({ ...newDiscount, appliesTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select where discount applies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="cart">Cart Total</SelectItem>
                  <SelectItem value="category">Specific Categories</SelectItem>
                  <SelectItem value="product">Specific Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={newDiscount.isActive}
                  onCheckedChange={(checked) =>
                    setNewDiscount({ ...newDiscount, isActive: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDiscount}>Add Discount</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Discount Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
          </DialogHeader>
          {currentDiscount && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Discount Name</Label>
                <Input
                  id="edit-name"
                  value={currentDiscount.name}
                  onChange={(e) =>
                    setCurrentDiscount({
                      ...currentDiscount,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-code">Discount Code (Optional)</Label>
                <Input
                  id="edit-code"
                  value={currentDiscount.code || ""}
                  onChange={(e) =>
                    setCurrentDiscount({
                      ...currentDiscount,
                      code: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Discount Type</Label>
                  <Select
                    value={currentDiscount.type}
                    onValueChange={(value: DiscountType) =>
                      setCurrentDiscount({
                        ...currentDiscount,
                        type: value as DiscountType,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-value">
                    {currentDiscount.type === "percentage"
                      ? "Percentage Value"
                      : "Fixed Amount"}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      {currentDiscount.type === "percentage" ? (
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <Input
                      id="edit-value"
                      type="number"
                      value={currentDiscount.value}
                      onChange={(e) =>
                        setCurrentDiscount({
                          ...currentDiscount,
                          value: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-appliesTo">Applies To</Label>
                <Select
                  value={currentDiscount.appliesTo}
                  onValueChange={(
                    value: "all" | "category" | "product" | "cart"
                  ) =>
                    setCurrentDiscount({ ...currentDiscount, appliesTo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select where discount applies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="cart">Cart Total</SelectItem>
                    <SelectItem value="category">
                      Specific Categories
                    </SelectItem>
                    <SelectItem value="product">Specific Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-isActive">Active</Label>
                  <Switch
                    id="edit-isActive"
                    checked={currentDiscount.isActive}
                    onCheckedChange={(checked) =>
                      setCurrentDiscount({
                        ...currentDiscount,
                        isActive: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Usage Count: {currentDiscount.usageCount}
                  {currentDiscount.usageLimit &&
                    ` / ${currentDiscount.usageLimit}`}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditDiscount}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
