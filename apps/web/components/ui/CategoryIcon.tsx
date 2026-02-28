"use client";

import type { ToolCategory } from "@toolhaus/tool-sdk";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, { icon: string; colorClass: string }> = {
  "data-formats": { icon: "data_object", colorClass: "bg-blue-50 text-[#4f46e5]" },
  encoding: { icon: "password", colorClass: "bg-purple-50 text-[#9333ea]" },
  generators: { icon: "fingerprint", colorClass: "bg-indigo-50 text-indigo-600" },
  "date-time": { icon: "schedule", colorClass: "bg-pink-50 text-[#ec4899]" },
  web: { icon: "link", colorClass: "bg-blue-50 text-[#4f46e5]" },
  security: { icon: "shield", colorClass: "bg-purple-50 text-[#9333ea]" },
  text: { icon: "difference", colorClass: "bg-indigo-50 text-indigo-600" },
  devops: { icon: "settings", colorClass: "bg-blue-50 text-[#4f46e5]" },
  design: { icon: "palette", colorClass: "bg-pink-50 text-[#ec4899]" },
  "ai-era": { icon: "psychology", colorClass: "bg-purple-50 text-[#9333ea]" },
  code: { icon: "code", colorClass: "bg-pink-50 text-[#ec4899]" },
  math: { icon: "calculate", colorClass: "bg-indigo-50 text-indigo-600" },
};

interface CategoryIconProps {
  category: ToolCategory | string;
  className?: string;
  iconClassName?: string;
}

export function CategoryIcon({ category, className, iconClassName }: CategoryIconProps) {
  const { icon, colorClass } = CATEGORY_ICONS[category] ?? {
    icon: "handyman",
    colorClass: "bg-slate-50 text-slate-600",
  };

  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
        colorClass,
        className
      )}
    >
      <span
        className={cn("material-symbols-outlined", iconClassName)}
        style={{ fontSize: 24 }}
      >
        {icon}
      </span>
    </div>
  );
}
