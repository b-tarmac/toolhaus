import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { getToolsByCategory, categories } from "@/lib/tools-registry";
import { CATEGORY_LABELS, type ToolCategory } from "@portfolio/tool-sdk";
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
  const label = CATEGORY_LABELS[category] ?? category;
  return {
    title: `${label} Tools — Toolhaus`,
    description: `Browse ${label} developer tools. All processed in your browser.`,
  };
}

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  "data-formats": "text-[#4f46e5] bg-blue-50",
  encoding: "text-[#9333ea] bg-purple-50",
  generators: "text-indigo-600 bg-indigo-50",
  "date-time": "text-[#ec4899] bg-pink-50",
  web: "text-[#4f46e5] bg-blue-50",
  security: "text-[#9333ea] bg-purple-50",
  text: "text-indigo-600 bg-indigo-50",
  devops: "text-indigo-600 bg-indigo-50",
  design: "text-[#ec4899] bg-pink-50",
  "ai-era": "text-[#9333ea] bg-purple-50",
  code: "text-[#ec4899] bg-pink-50",
  math: "text-indigo-600 bg-indigo-50",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!categories.includes(category as ToolCategory)) notFound();

  const catTools = getToolsByCategory(category as ToolCategory);
  const label = CATEGORY_LABELS[category] ?? category;
  const badgeClass =
    CATEGORY_BADGE_COLORS[category] ?? "text-slate-600 bg-slate-50";

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-16">
          <Link
            href="/tools"
            className="text-sm font-medium text-slate-500 hover:text-[#4f46e5] hover:underline transition-colors"
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
        <div className="stagger-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {catTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="tool-card group"
            >
              <CategoryIcon
                category={tool.category}
                className="mb-6 group-hover:scale-110 transition-transform"
              />
              <h2 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-[#4f46e5] transition-colors">
                {tool.name}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">
                {tool.description}
              </p>
              <span
                className={`inline-flex text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${badgeClass}`}
              >
                {CATEGORY_LABELS[tool.category] ?? tool.category}
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
