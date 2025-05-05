"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { usePosData, type Category } from "@/components/pos-data-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, MoreVertical, Edit, Trash2, Tags } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the schema for Category using zod
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const colorOptions = [
  "bg-red-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-purple-500",
];

export default function CategoriesPage() {
  const {
    categories,
    products,
    addNewCategory,
    updateExistingCategory,
    removeCategory,
  } = usePosData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const {toast} = useToast();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  // Filter categories
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Count products per category
  const getProductCount = (categoryId: string) => {
    return products.filter((product) => product.categoryId === categoryId)
      .length;
  };

  // Handle adding a new category
  const handleAddCategory = async (data: CategoryFormValues) => {
    addNewCategory({
      ...data
    });
    console.log("Category added:", data);
    reset();
    setIsAddDialogOpen(false);
  };

  // Handle editing a category
  const handleEditCategory = (data: CategoryFormValues) => {
    if (!currentCategory) return;

    updateExistingCategory({ ...currentCategory, ...data });
    reset();
    setIsEditDialogOpen(false);
    setCurrentCategory(null);
  };

  // Handle deleting a category
  const handleDeleteCategory = () => {
    if (!currentCategory) return;

    removeCategory(currentCategory.id);
    setIsDeleteDialogOpen(false);
    setCurrentCategory(null);
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredCategories.map((category) => (
                  <motion.tr
                    key={category.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <Tags className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="font-medium">{category.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{category.description || "-"}</TableCell>
                    <TableCell>{getProductCount(category.id)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentCategory(category);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setCurrentCategory(category);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Tags className="h-12 w-12 mb-2" />
                      <p>No categories found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Enter the details for the new category.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleAddCategory)}
            className="grid gap-4 py-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Category name"
                {...register("name")}
              />
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
              <Input
                id="icon"
                placeholder="Category icon"
                {...register("icon")}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details.</DialogDescription>
          </DialogHeader>

          {currentCategory && (
            <form
              onSubmit={handleSubmit(handleEditCategory)}
              className="grid gap-4 py-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Category name"
                  defaultValue={currentCategory.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Category description"
                  defaultValue={currentCategory.description}
                  {...register("description")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-color">Color (Optional)</Label>
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
                <Label htmlFor="edit-icon">Icon (Optional)</Label>
                <Input
                  id="edit-icon"
                  placeholder="Category icon"
                  defaultValue={currentCategory.icon}
                  {...register("icon")}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {currentCategory && (
            <div className="py-4">
              <p className="font-medium">{currentCategory.name}</p>
              {currentCategory.description && (
                <p className="text-sm text-muted-foreground">
                  {currentCategory.description}
                </p>
              )}
              <p className="mt-2 text-sm">
                This category contains{" "}
                <span className="font-medium">
                  {getProductCount(currentCategory.id)}
                </span>{" "}
                products.
              </p>
              {getProductCount(currentCategory.id) > 0 && (
                <p className="mt-2 text-sm text-destructive">
                  You must reassign or delete these products before deleting
                  this category.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={
                currentCategory
                  ? getProductCount(currentCategory.id) > 0
                  : false
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
