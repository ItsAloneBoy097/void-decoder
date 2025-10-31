import { SortOption } from "@/types/search";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'trending', label: 'Trending' },
  { value: 'most_downloaded', label: 'Most Downloaded' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'recently_updated', label: 'Recently Updated' },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] md:w-[200px] bg-card/50 backdrop-blur-sm border-primary/20">
        <ArrowUpDown className="mr-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
