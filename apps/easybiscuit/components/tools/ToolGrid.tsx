"use client";

import { ToolCard } from "./ToolCard";

export interface ToolGridToolMeta {
  slug: string;
  name: string;
  description: string;
  category: string;
}

interface ToolGridProps {
  tools: ToolGridToolMeta[];
  badgeClass?: string;
}

export function ToolGrid({ tools, badgeClass }: ToolGridProps) {
  return (
    <div className="stagger-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} badgeClass={badgeClass} />
      ))}
    </div>
  );
}
