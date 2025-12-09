"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Category } from "@/components/pos-data-provider";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const colorOptions = [
  "bg-red-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-purple-500",
];

interface CategoryFormProps {
  onSubmit: (data: CategoryFormValues) => void;
  defaultValues?: Category;
  onCancel: () => void;
  submitLabel?: string;
}

export function CategoryForm({
  onSubmit,
  defaultValues,
  onCancel,
  submitLabel = "Save",
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description || "",
          color: defaultValues.color || "",
          icon: defaultValues.icon || "",
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Category name" {...register("name")} />
        {errors.name && (
          <p className="text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Category description"
          {...register("description")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="color">Color (Optional)</Label>
        <div className="flex gap-2">
          {colorOptions.map((color) => (
            <div
              key={color}
              className={`w-8 h-8 rounded cursor-pointer border ${
                getValues().color === color
                  ? "border-black"
                  : "border-transparent"
              } ${color}`}
              onClick={() => reset({ ...getValues(), color })}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="icon">Icon (Optional)</Label>
        <Input id="icon" placeholder="Category icon" {...register("icon")} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
