"use client";

import Link from "next/link";
import { getToolsByCategory } from "@/lib/tools/registry";
import type { EasyBiscuitToolCategory } from "@portfolio/tool-sdk";

interface RelatedToolsProps {
  category: EasyBiscuitToolCategory;
  currentSlug: string;
  count?: number;
  variant?: "card" | "grid";
}

export function RelatedTools({
  category,
  currentSlug,
  count = 5,
  variant = "card",
}: RelatedToolsProps) {
  const tools = getToolsByCategory(category)
    .filter((t) => t.slug !== currentSlug)
    .slice(0, count);

  if (tools.length === 0) return null;

  const links = (
    <div
      className={
        variant === "grid"
          ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
          : "space-y-1"
      }
    >
      {tools.map((tool) => (
        <Link
          key={tool.slug}
          href={`/tools/${tool.category}/${tool.slug}`}
          className="block text-sm text-slate-500 hover:text-amber-600 hover:underline transition-colors"
        >
          {tool.name}
        </Link>
      ))}
    </div>
  );

  if (variant === "grid") return links;

  return (
    <div className="tool-card">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Related Tools</h3>
      {links}
    </div>
  );
}
