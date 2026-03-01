import { notFound } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { getToolBySlug } from "@/lib/tools-registry";
import { ToolShell } from "@/components/shell/ToolShell";
import { ToolSkeleton } from "@/components/shell/ToolSkeleton";
import { SharedLinkBanner } from "@/components/share/SharedLinkBanner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await db.execute({
    sql: "SELECT tool_slug, name FROM share_links WHERE slug = ?",
    args: [slug],
  });
  const row = result.rows[0];
  if (!row) return { title: "Not found" };

  const tool = getToolBySlug(row.tool_slug as string);
  return {
    title: `${row.name} — ${tool?.name ?? "Tool"} — Toolhaus`,
    description: `Shared ${tool?.name ?? "tool"} configuration`,
  };
}

export default async function ShareLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await db.execute({
    sql: "SELECT tool_slug, name, state_json FROM share_links WHERE slug = ?",
    args: [slug],
  });

  const row = result.rows[0];
  if (!row) notFound();

  const toolSlug = row.tool_slug as string;
  const name = row.name as string;
  const tool = getToolBySlug(toolSlug);

  if (!tool) notFound();

  let state: Record<string, unknown> = {};
  try {
    state = JSON.parse(row.state_json as string) as Record<string, unknown>;
  } catch {
    // use empty state if parse fails
  }

  const ToolComponent = tool.component;

  return (
    <Suspense fallback={<ToolSkeleton />}>
      <ToolShell
        tool={tool}
        initialWorkspaceState={state}
        readOnly={true}
        shareLinkBanner={
          <SharedLinkBanner name={name} toolSlug={toolSlug} />
        }
      >
        <Suspense fallback={<ToolSkeleton />}>
          <ToolComponent />
        </Suspense>
      </ToolShell>
    </Suspense>
  );
}
