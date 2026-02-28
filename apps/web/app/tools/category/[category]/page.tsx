import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { getToolsByCategory, categories } from "@/lib/tools-registry";
import { CATEGORY_LABELS, type ToolCategory } from "@toolhaus/tool-sdk";
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!categories.includes(category as ToolCategory)) notFound();

  const catTools = getToolsByCategory(category as ToolCategory);
  const label = CATEGORY_LABELS[category] ?? category;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/tools"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            ← All tools
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{label} Tools</h1>
          <p className="mt-1 text-muted-foreground">
            {catTools.length} tools in this category
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {catTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <h2 className="font-medium">{tool.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
