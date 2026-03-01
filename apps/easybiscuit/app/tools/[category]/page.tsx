import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToolGrid } from "@/components/tools/ToolGrid";
import {
  getToolsByCategory,
  categories,
} from "@/lib/tools/registry";
import {
  EASYBISCUIT_CATEGORY_LABELS,
  type EasyBiscuitToolCategory,
} from "@portfolio/tool-sdk";
import type { Metadata } from "next";

export const dynamicParams = false;

export async function generateStaticParams() {
  return categories.map((cat) => ({ category: cat }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const label = EASYBISCUIT_CATEGORY_LABELS[category] ?? category;
  return {
    title: `${label} Tools — EasyBiscuit`,
    description: `Browse ${label} tools for small business. All processed in your browser.`,
  };
}

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  business: "text-amber-700 bg-amber-100",
  calculators: "text-amber-600 bg-amber-50",
  pdf: "text-orange-700 bg-orange-100",
  image: "text-amber-600 bg-amber-50",
  writing: "text-slate-700 bg-slate-100",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!categories.includes(category as EasyBiscuitToolCategory)) notFound();

  const catTools = getToolsByCategory(category as EasyBiscuitToolCategory).map(
    (t) => ({ slug: t.slug, name: t.name, description: t.description, category: t.category })
  );
  const label = EASYBISCUIT_CATEGORY_LABELS[category] ?? category;
  const badgeClass =
    CATEGORY_BADGE_COLORS[category] ?? "text-slate-600 bg-slate-50";

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-16">
          <Link
            href="/tools"
            className="text-sm font-medium text-slate-500 hover:text-amber-600 hover:underline transition-colors"
          >
            ← All tools
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            {label} Tools
          </h1>
          <p className="mt-1 text-slate-500 font-medium">
            {catTools.length} tools in this category
          </p>
        </div>
        <ToolGrid tools={catTools} badgeClass={badgeClass} />
      </main>
      <Footer />
    </div>
  );
}
