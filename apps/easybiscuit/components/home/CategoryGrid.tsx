import { getToolsByCategory, categories } from "@/lib/tools/registry";
import { CategoryCard } from "./CategoryCard";
import type { EasyBiscuitToolCategory } from "@portfolio/tool-sdk";

export function CategoryGrid() {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
      <div className="flex min-w-max gap-6 pb-4 lg:grid lg:min-w-0 lg:grid-cols-5 lg:gap-6 lg:pb-0">
        {categories.map((cat) => {
          const tools = getToolsByCategory(cat as EasyBiscuitToolCategory);
          return (
            <div key={cat} className="w-[280px] shrink-0 lg:w-auto">
              <CategoryCard
                category={cat as EasyBiscuitToolCategory}
                toolCount={tools.length}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
