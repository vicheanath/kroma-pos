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
    const finalData = { ...data, attributes };
    handleAddProduct(finalData);
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
                setValueAs: (value) => {
                  if (typeof value === "string") {
                    return value.split(",").map((tag) => tag.trim());
                  }
                  return []; // Return an empty array if the value is not a string
                },
              })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Variations (Optional)</Label>
            <div className="overflow-x-auto">
              <table className="table-fixed w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-1/4 px-4 py-2 text-left font-bold border border-gray-300">
                      Name
                    </th>
                    <th className="w-1/4 px-4 py-2 text-left font-bold border border-gray-300">
                      Price
                    </th>
                    <th className="w-1/4 px-4 py-2 text-left font-bold border border-gray-300">
                      Stock
                    </th>
                    <th className="w-1/4 px-4 py-2 text-left font-bold border border-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variationFields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border border-gray-300">
                        <input
                          type="text"
                          placeholder="Variation Name"
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          {...register(`variations.${index}.name`)}
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        <input
                          type="number"
                          placeholder="Price"
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          {...register(`variations.${index}.price`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        <input
                          type="number"
                          placeholder="Stock"
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          {...register(`variations.${index}.stock`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        <button
                          type="button"
                          className="px-2 py-1 text-red-500 border border-red-500 rounded hover:bg-red-100"
                          onClick={() => removeVariation(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
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
            </button>
          </div>

          <div className="grid gap-2">
            <Label>Attributes (Optional)</Label>
            <div className="overflow-x-auto">
              <table className="table-fixed w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-1/3 px-4 py-2 text-left font-bold border border-gray-300">
                      Key
                    </th>
                    <th className="w-1/3 px-4 py-2 text-left font-bold border border-gray-300">
                      Value
                    </th>
                    <th className="w-1/3 px-4 py-2 text-left font-bold border border-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(attributes).map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border border-gray-300">
                        <input
                          type="text"
                          value={key}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateAttribute(key, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        <button
                          type="button"
                          className="px-2 py-1 text-red-500 border border-red-500 rounded hover:bg-red-100"
                          onClick={() => removeAttribute(key)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              onClick={addAttribute}
            >
              Add Attribute
            </button>
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
