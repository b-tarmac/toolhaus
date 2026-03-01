import Link from "next/link";
import {
  FileText,
  ScanText,
  Percent,
  FilePlus,
  ImageDown,
  QrCode,
  TrendingUp,
  PenLine,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { toolRegistry } from "@/lib/tools/registry";
import { FEATURED_TOOL_SLUGS } from "@/lib/homepage";
import { EASYBISCUIT_CATEGORY_LABELS } from "@portfolio/tool-sdk";
import type { EasyBiscuitToolCategory } from "@portfolio/tool-sdk";

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  ScanText,
  Percent,
  FilePlus,
  ImageDown,
  QrCode,
  TrendingUp,
  PenLine,
  Mail,
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  business: "text-amber-700 bg-amber-100",
  calculators: "text-amber-600 bg-amber-50",
  pdf: "text-orange-700 bg-orange-100",
  image: "text-amber-600 bg-amber-50",
  writing: "text-slate-700 bg-slate-100",
};

export function FeaturedToolsGrid() {
  const featuredTools = FEATURED_TOOL_SLUGS.map((slug) =>
    toolRegistry.find((t) => t.slug === slug)
  ).filter(Boolean) as typeof toolRegistry;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredTools.map((tool) => {
        const IconComponent = ICON_MAP[tool.icon] ?? FileText;
        const isMostPopular = tool.slug === "invoice-parser";
        const badgeClass =
          CATEGORY_BADGE_COLORS[tool.category] ?? "text-slate-600 bg-slate-50";

        return (
          <Link
            key={tool.slug}
            href={`/tools/${tool.category}/${tool.slug}`}
            className="tool-card group relative"
          >
            {isMostPopular && (
              <span className="absolute -top-2 right-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                Most Popular
              </span>
            )}
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
              <IconComponent className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">
              {tool.description}
            </p>
            <span
              className={`inline-flex text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${badgeClass}`}
            >
              {EASYBISCUIT_CATEGORY_LABELS[tool.category as EasyBiscuitToolCategory] ?? tool.category}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
