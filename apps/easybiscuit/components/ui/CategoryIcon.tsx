"use client";

import {
  FileText,
  Calculator,
  FileDown,
  Image,
  Type,
  LucideIcon,
} from "lucide-react";
import type { EasyBiscuitToolCategory } from "@portfolio/tool-sdk";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<EasyBiscuitToolCategory, LucideIcon> = {
  business: FileText,
  calculators: Calculator,
  pdf: FileDown,
  image: Image,
  writing: Type,
};

interface CategoryIconProps {
  category: EasyBiscuitToolCategory;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category] ?? FileText;
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700",
        className
      )}
    >
      <Icon className="h-6 w-6" />
    </div>
  );
}
