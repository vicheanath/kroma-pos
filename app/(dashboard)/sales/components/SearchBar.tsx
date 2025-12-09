"use client";

import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isTablet?: boolean;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  isTablet = false,
}: SearchBarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when pressing '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex-1 w-full min-w-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={searchInputRef}
        placeholder="Search products by name, SKU, barcode... (Press '/' to focus)"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`pl-9 pr-10 ${
          isTablet ? "h-12 text-base" : "h-11"
        } border-2 focus:border-primary transition-colors`}
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-1 top-1/2 -translate-y-1/2 ${
            isTablet ? "h-9 w-9" : "h-8 w-8"
          } hover:bg-muted rounded-full`}
          onClick={() => onSearchChange("")}
        >
          <X className={`${isTablet ? "h-4 w-4" : "h-4 w-4"}`} />
        </Button>
      )}
    </div>
  );
}
