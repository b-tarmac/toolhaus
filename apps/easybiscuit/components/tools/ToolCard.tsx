"use client";

import Link from "next/link";
import type { EasyBiscuitToolCategory } from "@portfolio/tool-sdk";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { EASYBISCUIT_CATEGORY_LABELS } from "@portfolio/tool-sdk";
import type { ToolGridToolMeta } from "./ToolGrid";

interface ToolCardProps {
  tool: ToolGridToolMeta;
  badgeClass?: string;
}

export function ToolCard({ tool, badgeClass }: ToolCardProps) {
  const defaultBadgeClass = "text-amber-700 bg-amber-100";
  const appliedBadgeClass = badgeClass ?? defaultBadgeClass;

  return (
    <Link
      href={`/tools/${tool.category}/${tool.slug}`}
      className="tool-card group"
    >
      <CategoryIcon
        category={tool.category as EasyBiscuitToolCategory}
        className="mb-6 group-hover:scale-110 transition-transform"
      />
      <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
        {tool.name}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">
        {tool.description}
      </p>
      <span
        className={`inline-flex text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${appliedBadgeClass}`}
      >
        {EASYBISCUIT_CATEGORY_LABELS[tool.category as EasyBiscuitToolCategory] ?? tool.category}
      </span>
    </Link>
  );
}
