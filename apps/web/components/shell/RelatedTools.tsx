"use client";

import Link from "next/link";
import { getToolBySlug } from "@/lib/tools-registry";

interface RelatedToolsProps {
  slugs: string[];
  variant?: "card" | "grid";
}

export function RelatedTools({ slugs, variant = "card" }: RelatedToolsProps) {
  const tools = slugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is NonNullable<typeof t> => t != null)
    .slice(0, 5);

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
          href={`/tools/${tool.slug}`}
          className="block text-sm text-slate-500 hover:text-[#4f46e5] hover:underline transition-colors"
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
