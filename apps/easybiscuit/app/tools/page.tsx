import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { toolRegistry, categories } from "@/lib/tools/registry";
import { EASYBISCUIT_CATEGORY_LABELS } from "@portfolio/tool-sdk";

const toolMetaList = toolRegistry.map((t) => ({
  slug: t.slug,
  name: t.name,
  description: t.description,
  category: t.category,
}));

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  business: "text-amber-700 bg-amber-100",
  calculators: "text-amber-600 bg-amber-50",
  pdf: "text-orange-700 bg-orange-100",
  image: "text-amber-600 bg-amber-50",
  writing: "text-slate-700 bg-slate-100",
};

export default function ToolsDirectoryPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto flex gap-8 px-6 lg:px-8 py-8">
        <main id="main-content" className="min-w-0 flex-1">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                All Tools
              </h1>
              <p className="mt-2 text-slate-500 font-medium">
                {toolRegistry.length} small business tools. All processed in
                your browser.
              </p>
            </div>
          </div>

          <nav
            className="lg:mb-8 mb-8 -mx-6 lg:mx-0 overflow-x-auto scrollbar-hide"
            aria-label="Jump to category"
          >
            <div className="flex gap-2 px-6 lg:px-0 min-w-max">
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={`#category-${cat}`}
                  className="shrink-0 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 transition-colors"
                >
                  {EASYBISCUIT_CATEGORY_LABELS[cat] ?? cat}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-12">
            {categories.map((cat) => {
              const catTools = toolMetaList.filter((t) => t.category === cat);
              const badgeClass =
                CATEGORY_BADGE_COLORS[cat] ?? "text-slate-600 bg-slate-50";
              return (
                <section
                  key={cat}
                  id={`category-${cat}`}
                  className="scroll-mt-24"
                >
                  <h2 className="mb-6 text-lg font-bold text-slate-900">
                    {EASYBISCUIT_CATEGORY_LABELS[cat] ?? cat}
                  </h2>
                  <ToolGrid tools={catTools} badgeClass={badgeClass} />
                </section>
              );
            })}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
