"use client";

import Link from "next/link";
import { getToolBySlug } from "@/lib/tools-registry";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RelatedToolsProps {
  slugs: string[];
  variant?: "card" | "grid";
}

export function RelatedTools({ slugs, variant = "card" }: RelatedToolsProps) {
  const tools = slugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is NonNullable<typeof t> => t != null)
    .slice(0, 5);

  if (tools.length === 0) return null;

  const links = (
    <div
      className={
        variant === "grid"
          ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
          : "space-y-1"
      }
    >
      {tools.map((tool) => (
        <Link
          key={tool.slug}
          href={`/tools/${tool.slug}`}
          className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          {tool.name}
        </Link>
      ))}
    </div>
  );

  if (variant === "grid") return links;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Related Tools</CardTitle>
      </CardHeader>
      <CardContent>{links}</CardContent>
    </Card>
  );
}
