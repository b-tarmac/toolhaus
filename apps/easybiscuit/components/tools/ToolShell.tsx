"use client";

import { Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import type { EasyBiscuitToolCategory } from "@portfolio/tool-sdk";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PrivacyBadge } from "@/components/shared/PrivacyBadge";
import { ToolSeoContent } from "./ToolSeoContent";
import { RelatedTools } from "./RelatedTools";

/** Serializable tool metadata passed to ToolShell (excludes component) */
export interface ToolShellToolMeta {
  name: string;
  description: string;
  slug: string;
  category: EasyBiscuitToolCategory;
  about: string;
  seo: { faqs: Array<{ question: string; answer: string }> };
}

interface ToolShellProps {
  tool: ToolShellToolMeta;
  children: React.ReactNode;
}

function ToolSkeleton() {
  return (
    <div className="flex min-h-[200px] animate-pulse flex-col gap-4 rounded-xl border border-amber-100 bg-amber-50/30 p-6">
      <div className="h-4 w-3/4 rounded bg-amber-200" />
      <div className="h-4 w-1/2 rounded bg-amber-200" />
      <div className="mt-4 h-32 rounded bg-amber-200" />
    </div>
  );
}

export function ToolShell({ tool, children }: ToolShellProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";

  return (
    <div className={`min-h-screen gradient-bg ${isPro ? "is-pro" : ""}`}>
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            <div className="mb-6">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{tool.name}</h1>
                <PrivacyBadge />
              </div>
              <p className="text-slate-500">{tool.description}</p>
            </div>

            <Suspense fallback={<ToolSkeleton />}>
              {children}
            </Suspense>

            <ToolSeoContent tool={tool} />
          </div>

          <aside className="hidden w-72 shrink-0 lg:block">
            <RelatedTools
              category={tool.category}
              currentSlug={tool.slug}
              count={5}
            />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
