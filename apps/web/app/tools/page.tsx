import Link from "next/link";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { Sidebar } from "@/components/shell/Sidebar";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { tools, categories } from "@/lib/tools-registry";
import { CATEGORY_LABELS } from "@toolhaus/tool-sdk";

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

export default function ToolsDirectoryPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto flex gap-8 px-6 lg:px-8 py-8">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                All Tools
              </h1>
              <p className="mt-2 text-slate-500 font-medium">
                {tools.length} developer utility tools. All processed in your
                browser.
              </p>
            </div>
            <p className="text-slate-500 font-medium hidden md:block">
              Hand-picked essentials
            </p>
          </div>

          <div className="space-y-12">
            {categories.map((cat) => {
              const catTools = tools.filter((t) => t.category === cat);
              const badgeClass =
                CATEGORY_BADGE_COLORS[cat] ?? "text-slate-600 bg-slate-50";
              return (
                <section key={cat}>
                  <h2 className="mb-6 text-lg font-bold text-slate-900">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </h2>
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
                        <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-[#4f46e5] transition-colors">
                          {tool.name}
                        </h3>
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
