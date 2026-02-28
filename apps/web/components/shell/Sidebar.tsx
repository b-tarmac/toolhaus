"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools, getToolsByCategory } from "@/lib/tools-registry";
import { CATEGORY_LABELS } from "@toolhaus/tool-sdk";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const slug = pathname?.split("/tools/")[1]?.split("/")[0];
  const categories = [...new Set(tools.map((t) => t.category))];

  return (
    <aside className="hidden w-56 shrink-0 border-r pr-4 lg:block">
      <nav className="space-y-6">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            All Tools
          </h3>
          <ul className="space-y-0.5">
            {tools.slice(0, 10).map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/tools/${tool.slug}`}
                  className={cn(
                    "block rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                    slug === tool.slug && "bg-muted font-medium"
                  )}
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </h3>
          <ul className="space-y-1">
            {categories.map((cat) => {
              const catTools = getToolsByCategory(cat);
              return (
                <li key={cat}>
                  <Link
                    href={`/tools/category/${cat}`}
                    className="block rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {CATEGORY_LABELS[cat] ?? cat} ({catTools.length})
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
