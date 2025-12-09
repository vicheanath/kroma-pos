"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { type Category } from "@/components/pos-data-provider";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  isTablet?: boolean;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  isTablet = false,
}: CategoryFilterProps) {
  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap overflow-x-auto min-w-0">
        <div className="flex space-x-2 pb-1">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size={isTablet ? "default" : "sm"}
            onClick={() => onCategoryChange("all")}
            className={`rounded-full ${
              isTablet ? "h-10 px-5" : "h-9 px-4"
            } font-medium transition-all shadow-sm hover:shadow-md ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
          >
            All Products
          </Button>

          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size={isTablet ? "default" : "sm"}
              onClick={() => onCategoryChange(category.id)}
              className={`rounded-full ${
                isTablet ? "h-10 px-5" : "h-9 px-4"
              } font-medium transition-all shadow-sm hover:shadow-md ${
                activeCategory === category.id ? "scale-105" : ""
              }`}
              style={
                category.color
                  ? {
                      backgroundColor:
                        activeCategory === category.id
                          ? category.color
                          : "transparent",
                      color:
                        activeCategory === category.id
                          ? "white"
                          : category.color,
                      borderColor: category.color,
                      borderWidth:
                        activeCategory === category.id ? "2px" : "1px",
                    }
                  : {}
              }
            >
              {category.icon && <span className="mr-1.5">{category.icon}</span>}
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
