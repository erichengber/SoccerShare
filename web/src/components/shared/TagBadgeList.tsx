import { Badge } from "@/components/ui/badge";
import type { ClipTag } from "@/types/domain";

interface TagBadgeListProps {
  tags: ClipTag[];
}

export function TagBadgeList({ tags }: TagBadgeListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
