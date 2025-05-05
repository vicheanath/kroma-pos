"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { productsApi, categoriesApi } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/image-upload";
import { useEffect, useState } from "react";

// Define Zod schema for product validation
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  categoryId: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock must be a positive number"),
  barcode: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    async function fetchCategories() {
      const fetchedCategories = await categoriesApi.getAll();
      setCategories(fetchedCategories);
    }
    fetchCategories();
  }, []);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await productsApi.add({
        ...data,
        id: crypto.randomUUID(),
        price: Number(data.price),
        stock: Number(data.stock),
        category:
          categories.find((c) => c.id === data.categoryId)?.name ||
          "Uncategorized",
      });
      router.push("/app/(dashboard)/products");
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
          <Select onValueChange={(value) => setValue("categoryId", value)}>
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
          {errors.categoryId && (
            <p className="text-red-500 text-sm">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="barcode">Barcode (Optional)</Label>
          <Input id="barcode" placeholder="Barcode" {...register("barcode")} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Product description"
            {...register("description")}
          />
        </div>

        <ImageUpload onChange={(value) => setValue("image", value)} />

        <div className="flex gap-2">
          <Button type="submit">Create Product</Button>
          <Button
            variant="outline"
            onClick={() => router.push("/app/(dashboard)/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
