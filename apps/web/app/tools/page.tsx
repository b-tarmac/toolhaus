import Link from "next/link";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { Sidebar } from "@/components/shell/Sidebar";
import { tools, categories } from "@/lib/tools-registry";
import { CATEGORY_LABELS } from "@toolhaus/tool-sdk";

export default function ToolsDirectoryPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container flex gap-8 px-4 py-8">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">All Tools</h1>
          <p className="mt-2 text-muted-foreground">
            {tools.length} developer utility tools. All processed in your
            browser.
          </p>

          <div className="mt-8 space-y-12">
            {categories.map((cat) => {
              const catTools = tools.filter((t) => t.category === cat);
              return (
                <section key={cat}>
                  <h2 className="mb-4 text-lg font-semibold">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {catTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <h3 className="font-medium">{tool.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {tool.description}
                        </p>
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
