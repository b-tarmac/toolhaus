import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  toolRegistry,
  getToolBySlugAndCategory,
} from "@/lib/tools/registry";
import {
  generateEasyBiscuitToolMetadata,
  generateEasyBiscuitToolJsonLd,
} from "@portfolio/seo";
import { ToolShell } from "@/components/tools/ToolShell";
import type { Metadata } from "next";

const SITE_CONFIG = { baseUrl: "https://easybiscuit.co", siteName: "EasyBiscuit" };

export const dynamicParams = false;

export async function generateStaticParams() {
  return toolRegistry.map((tool) => ({
    category: tool.category,
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const tool = getToolBySlugAndCategory(category, slug);
  if (!tool) return {};
  return generateEasyBiscuitToolMetadata(tool, SITE_CONFIG);
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const tool = getToolBySlugAndCategory(category, slug);
  if (!tool) notFound();

  const ToolComponent = tool.component;
  const schemas = generateEasyBiscuitToolJsonLd(tool, SITE_CONFIG);

  const toolMeta = {
    name: tool.name,
    description: tool.description,
    slug: tool.slug,
    category: tool.category,
    about: tool.about,
    seo: tool.seo,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": schemas,
          }),
        }}
      />
      <ToolShell tool={toolMeta}>
        <Suspense
          fallback={
            <div className="flex min-h-[200px] animate-pulse flex-col gap-4 rounded-xl border border-amber-100 bg-amber-50/30 p-6">
              <div className="h-4 w-3/4 rounded bg-amber-200" />
              <div className="h-4 w-1/2 rounded bg-amber-200" />
              <div className="mt-4 h-32 rounded bg-amber-200" />
            </div>
          }
        >
          <ToolComponent />
        </Suspense>
      </ToolShell>
    </>
  );
}
