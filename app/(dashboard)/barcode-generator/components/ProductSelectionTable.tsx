"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Package, Printer, Pencil, Check, X } from "lucide-react";
import { type Product } from "@/components/pos-data-provider";
import { useToast } from "@/components/ui/use-toast";
import { BarcodePreview } from "./BarcodePreview";
import { type BarcodeTemplate } from "../utils/barcodeUtils";

interface ProductSelectionTableProps {
  products: Product[];
  selectedProducts: string[];
  onProductSelect: (productId: string) => void;
  onSelectAll: () => void;
  showPreview: boolean;
  template: BarcodeTemplate;
  barcodeType: string;
  onPrint: () => void;
}

export function ProductSelectionTable({
  products,
  selectedProducts,
  onProductSelect,
  onSelectAll,
  showPreview,
  template,
  barcodeType,
  onPrint,
}: ProductSelectionTableProps) {
  const { toast } = useToast();

  return (
    <Card className="h-full flex flex-col overflow-hidden min-w-0">
      <CardHeader>
        <CardTitle>Select Products</CardTitle>
        <CardDescription>
          Choose products to generate barcodes for.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col min-w-0">
        <div className="flex justify-between mb-4 min-w-0">
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            {selectedProducts.length === products.length ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Select All
              </>
            )}
          </Button>
          <div className="text-sm text-muted-foreground">
            {selectedProducts.length} of {products.length} products selected
          </div>
        </div>

        <div className="overflow-auto flex-grow border rounded-md min-w-0">
          <Table>
            <TableHeader className="sticky top-0 bg-muted z-10">
              <TableRow>
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => onProductSelect(product.id)}
                          disabled={!product.barcode}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.sku && (
                            <div className="text-xs text-muted-foreground">
                              SKU: {product.sku}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.barcode ? (
                        <div className="font-mono text-xs">
                          {product.barcode}
                        </div>
                      ) : (
                        <div className="text-xs text-destructive">
                          No barcode
                        </div>
                      )}
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!product.barcode}
                          onClick={() => {
                            if (!selectedProducts.includes(product.id)) {
                              onProductSelect(product.id);
                            }
                            onPrint();
                          }}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toast({
                              title: "Edit Product",
                              description:
                                "Navigate to product edit page to add or edit barcode",
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Package className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>No products found</EmptyTitle>
                        <EmptyDescription>
                          Add products with barcodes to get started.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {showPreview && selectedProducts.length > 0 && (
          <div className="mt-6 min-w-0">
            <h3 className="text-lg font-medium mb-2">Preview</h3>
            <div className="border rounded-md p-4 bg-muted/30 overflow-auto min-w-0">
              <div
                className="flex flex-wrap justify-start min-w-0"
                style={{
                  maxWidth: `${
                    template.width * template.labelsPerRow +
                    template.margin * 2 * template.labelsPerRow
                  }px`,
                }}
              >
                <BarcodePreview
                  selectedProducts={selectedProducts}
                  products={products}
                  template={template}
                  barcodeType={barcodeType}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
