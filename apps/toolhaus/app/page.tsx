import Link from "next/link";
import { tools } from "@/lib/tools-registry";
import { CATEGORY_LABELS } from "@portfolio/tool-sdk";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

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

export default function HomePage() {
  const featured = tools.slice(0, 8);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main id="main-content">
        <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-48 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center">
            <div className="w-full lg:w-2/3 lg:pr-12 text-left">
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8">
                The dev tools hub that <br className="hidden lg:block" />
                <span className="hero-gradient-text">actually gets</span>{" "}
                <br className="hidden lg:block" />
                the AI era
              </h1>
              <p className="text-xl text-slate-500 max-w-xl leading-relaxed mb-12">
                25+ privacy-first developer tools. JSON formatter, Base64, UUID
                generator, LLM token counter, and more. All processing happens in
                your browser.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/tools"
                  className="px-8 py-4 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-[#4f46e5] to-[#9333ea] hover:opacity-90 transition-all shadow-xl shadow-[#4f46e5]/20 flex items-center gap-2"
                >
                  Browse Tools{" "}
                  <span className="material-symbols-outlined text-[18px]">
                    east
                  </span>
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 text-base font-bold rounded-2xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                >
                  View Pricing
                </Link>
              </div>
            </div>
            <div className="hidden lg:block w-1/3 relative">
              <div className="absolute -top-24 -left-12 w-96 h-96 bg-[#4f46e5]/10 rounded-full blur-3xl" />
              <div className="absolute top-12 left-12 w-64 h-64 bg-[#9333ea]/10 rounded-full blur-3xl" />
              <div className="relative z-10 p-8 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 shadow-2xl rotate-3">
                <div className="space-y-4">
                  <div className="h-3 w-1/2 bg-[#4f46e5]/20 rounded-full" />
                  <div className="h-3 w-3/4 bg-[#9333ea]/20 rounded-full" />
                  <div className="h-3 w-2/3 bg-slate-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-48">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Featured Tools
            </h2>
            <p className="text-slate-500 font-medium hidden md:block">
              Hand-picked essentials
            </p>
          </div>
          <div className="stagger-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((tool) => {
              const badgeClass =
                CATEGORY_BADGE_COLORS[tool.category] ??
                "text-slate-600 bg-slate-50";
              return (
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
              );
            })}
          </div>
          <div className="mt-24 text-center">
            <Link
              href="/tools"
              className="inline-flex items-center px-10 py-4 bg-white border border-slate-200 shadow-sm text-sm font-bold rounded-2xl text-slate-900 hover:border-[#9333ea] hover:text-[#9333ea] transition-all"
            >
              View all {tools.length} tools
            </Link>
          </div>
        </section>

        <section className="mx-6 mb-32">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#4f46e5]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#9333ea]/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[#9333ea] text-5xl mb-6">
                verified_user
              </span>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
                Privacy-first by design
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-slate-300 leading-relaxed">
                No tool logic runs on our servers. Your data never leaves your
                browser. Share results via URL—no sign-in required for free
                tools.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
