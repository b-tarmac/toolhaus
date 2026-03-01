import { notFound } from "next/navigation";
import { Suspense } from "react";
import { tools, getToolBySlug } from "@/lib/tools-registry";
import { generateToolSchema } from "@/lib/seo";
import { ToolShell } from "@/components/shell/ToolShell";
import { ToolSkeleton } from "@/components/shell/ToolSkeleton";
import type { Metadata } from "next";

export const dynamicParams = false;

export async function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Toolhaus`,
    description: tool.description,
    keywords: tool.keywordsForSeo.join(", "),
    openGraph: {
      title: `${tool.name} — Toolhaus`,
      description: tool.description,
      url: `https://toolhaus.dev/tools/${tool.slug}`,
      siteName: "Toolhaus",
      type: "website",
    },
    alternates: {
      canonical: `https://toolhaus.dev/tools/${tool.slug}`,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const ToolComponent = tool.component;
  const schema = generateToolSchema(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Suspense fallback={<ToolSkeleton />}>
        <ToolShell tool={tool}>
          <Suspense fallback={<ToolSkeleton />}>
            <ToolComponent />
          </Suspense>
        </ToolShell>
      </Suspense>
    </>
  );
}
