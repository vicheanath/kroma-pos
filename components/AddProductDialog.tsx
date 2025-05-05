"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { Category } from "@/lib/db";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().min(0, "Stock must be a positive number"),
  categoryId: z.string().min(1, "Category is required"),
  barcode: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  sku: z.string().optional(),
  cost: z.number().min(0, "Cost must be a positive number").optional(),
  taxable: z.boolean().optional(),
  taxRate: z.number().min(0, "Tax rate must be a positive number").optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.string()).optional(),
  variations: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Variation name is required"),
        price: z.number().min(0, "Price must be a positive number"),
        stock: z.number().min(0, "Stock must be a positive number"),
      })
    )
    .optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  handleAddProduct: (data: ProductFormValues) => void;
}

export default function AddProductDialog({
  isOpen,
  onOpenChange,
  categories,
  handleAddProduct,
}: AddProductDialogProps) {
  const [generatedBarcode, setGeneratedBarcode] = useState("");

  const generateBarcode = () => {
    const barcode = Math.random().toString(36).substring(2, 12).toUpperCase();
    setGeneratedBarcode(barcode);
  };

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      categoryId: "",
      barcode: "",
      description: "",
      image: "",
      sku: "",
      cost: 0,
      taxable: false,
      taxRate: 0,
      tags: [],
      attributes: {},
      variations: [],
    },
  });

  const {
    fields: variationFields,
    append: addVariation,
    remove: removeVariation,
  } = useFieldArray({
    control,
    name: "variations",
  });

  const [attributes, setAttributes] = useState<Record<string, string>>({});

  const addAttribute = () => {
    setAttributes((prev) => ({ ...prev, [`key-${Date.now()}`]: "" }));
  };

  const removeAttribute = (key: string) => {
    setAttributes((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const updateAttribute = (key: string, value: string) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (data: ProductFormValues) => {
    handleAddProduct({ ...data, attributes });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details for the new product.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Product name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-red-500 text-sm">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="barcode">Barcode (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                placeholder="Barcode"
                {...register("barcode")}
                value={generatedBarcode || undefined}
                onChange={(e) => setGeneratedBarcode(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  generateBarcode();
                  setValue("barcode", generatedBarcode);
                }}
              >
                Generate
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Product description"
              {...register("description")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU (Optional)</Label>
            <Input id="sku" placeholder="SKU" {...register("sku")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cost">Cost (Optional)</Label>
            <Input
              id="cost"
              type="number"
              placeholder="0.00"
              {...register("cost", { valueAsNumber: true })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="taxable">Taxable</Label>
            <Controller
              name="taxable"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) => field.onChange(value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select taxable status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="taxRate">Tax Rate (Optional)</Label>
            <Input
              id="taxRate"
              type="number"
              placeholder="0.00"
              {...register("taxRate", { valueAsNumber: true })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              placeholder="Comma-separated tags"
              {...register("tags", {
                // setValueAs: (value) => {
                //   return value.split(",").map((tag:string) => tag.trim());
                // }
              })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Variations (Optional)</Label>
            <Table className="table-fixed w-full">
              <TableHead>
                <TableRow>
                  <TableCell className="w-1/4 font-bold">Name</TableCell>
                  <TableCell className="w-1/4 font-bold">Price</TableCell>
                  <TableCell className="w-1/4 font-bold">Stock</TableCell>
                  <TableCell className="w-1/4 font-bold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variationFields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell className="w-1/4">
                      <Input
                        placeholder="Variation Name"
                        {...register(`variations.${index}.name`)}
                      />
                    </TableCell>
                    <TableCell className="w-1/4">
                      <Input
                        type="number"
                        placeholder="Price"
                        {...register(`variations.${index}.price`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell className="w-1/4">
                      <Input
                        type="number"
                        placeholder="Stock"
                        {...register(`variations.${index}.stock`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell className="w-1/4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeVariation(index)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                addVariation({
                  id: Date.now().toString(),
                  name: "",
                  price: 0,
                  stock: 0,
                })
              }
            >
              Add Variation
            </Button>
          </div>

          <div className="grid gap-2">
            <Label>Attributes (Optional)</Label>
            <Table className="table-fixed w-full">
              <TableHead>
                <TableRow>
                  <TableCell className="w-1/3 font-bold">Key</TableCell>
                  <TableCell className="w-1/3 font-bold">Value</TableCell>
                  <TableCell className="w-1/3 font-bold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(attributes).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="w-1/3">
                      <Input placeholder="Attribute Key" value={key} readOnly />
                    </TableCell>
                    <TableCell className="w-1/3">
                      <Input
                        placeholder="Attribute Value"
                        value={value}
                        onChange={(e) => updateAttribute(key, e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="w-1/3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeAttribute(key)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button type="button" variant="outline" onClick={addAttribute}>
              Add Attribute
            </Button>
          </div>

          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>
            Add Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
