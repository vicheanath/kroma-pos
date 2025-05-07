"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";
import { fileToBase64 } from "@/lib/db";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Product Image",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement> | File
  ) => {
    const file = e instanceof File ? e : e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const base64 = await fileToBase64(file);
      onChange(base64);
    } catch (error) {
      console.error("Error converting file to base64:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const fileItem = Array.from(items).find(
        (item) => item.kind === "file" && item.type.startsWith("image/")
      );
      if (fileItem) {
        const file = fileItem.getAsFile();
        if (file) {
          handleFileChange(file); // Automatically upload the dropped file
        }
      }
    } else {
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileChange(file); // Fallback for older browsers
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">{label}</Label>
      <div
        className={`flex flex-col items-center gap-4 ${
          isDragging ? "border-blue-500 bg-blue-100" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {value ? (
          <div className="relative w-full max-w-[200px] aspect-square">
            <img
              src={value || "/placeholder.svg"}
              alt="Uploaded"
              className="w-full h-full object-cover rounded-md border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center w-full max-w-[200px] aspect-square border border-dashed rounded-md bg-muted/50 ${
              isDragging ? "border-blue-500 bg-blue-100" : ""
            }`}
          >
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {isDragging ? "Drop the image here" : "No image uploaded"}
            </p>
          </div>
        )}

        <div className="flex gap-2 w-full">
          <Input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {value ? "Change Image" : "Upload Image"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
