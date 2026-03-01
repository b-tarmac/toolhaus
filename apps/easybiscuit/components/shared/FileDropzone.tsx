"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept: string[];
  maxSize: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  isPro?: boolean;
  className?: string;
}

export function FileDropzone({
  accept,
  maxSize,
  multiple = false,
  onFiles,
  isPro = false,
  className,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFiles(multiple ? files : [files[0]]);
      }
    },
    [multiple, onFiles]
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        onFiles(multiple ? files : [files[0]]);
      }
      e.target.value = "";
    },
    [multiple, onFiles]
  );

  const maxSizeMB = Math.round(maxSize / 1024 / 1024);

  return (
    <label
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 p-8 transition-colors hover:border-amber-300 hover:bg-amber-50/50",
        isDragging && "border-amber-400 bg-amber-50",
        className
      )}
    >
      <Upload className="mb-3 h-10 w-10 text-amber-600" />
      <p className="text-center text-sm font-medium text-slate-700">
        Drag and drop files here, or click to browse
      </p>
      <p className="mt-1 text-center text-xs text-slate-500">
        Max {maxSizeMB}MB per file
        {multiple && " • Multiple files supported"}
      </p>
      <input
        type="file"
        accept={accept.join(",")}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
    </label>
  );
}
