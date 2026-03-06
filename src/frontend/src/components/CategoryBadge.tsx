import { Badge } from "@/components/ui/badge";
import { categoryColors } from "../hooks/useQueries";

interface CategoryBadgeProps {
  category: string;
}

const categoryLabels: Record<string, string> = {
  cleanser: "Cleanser",
  toner: "Toner",
  serum: "Serum",
  moisturizer: "Moisturizer",
  sunscreen: "Sunscreen",
  other: "Other",
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold ${categoryColors[category] ?? "bg-gray-100 text-gray-700"}`}
    >
      {categoryLabels[category] ?? category}
    </span>
  );
}
