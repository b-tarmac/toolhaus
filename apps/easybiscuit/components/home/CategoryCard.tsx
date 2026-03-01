import Link from "next/link";
import type { EasyBiscuitToolCategory } from "@portfolio/tool-sdk";
import { EASYBISCUIT_CATEGORY_LABELS } from "@portfolio/tool-sdk";
import { HOMEPAGE_CATEGORY_METADATA } from "@/lib/homepage";

interface CategoryCardProps {
  category: EasyBiscuitToolCategory;
  toolCount: number;
}

export function CategoryCard({ category, toolCount }: CategoryCardProps) {
  const { icon, subtitle } = HOMEPAGE_CATEGORY_METADATA[category];
  const label = EASYBISCUIT_CATEGORY_LABELS[category] ?? category;

  return (
    <Link
      href={`/tools/${category}`}
      className="group flex flex-col items-center rounded-2xl border border-amber-100 bg-white p-6 transition-all duration-300 hover:border-amber-300 hover:shadow-lg"
    >
      <span className="mb-4 text-4xl" aria-hidden>
        {icon}
      </span>
      <h3 className="text-lg font-bold text-slate-900">{label} Tools</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <span className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        {toolCount} tools
      </span>
    </Link>
  );
}
