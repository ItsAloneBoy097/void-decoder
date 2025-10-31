import { SearchFilters } from "@/types/search";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "./FilterSidebar";
import { X } from "lucide-react";

interface MobileFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Partial<SearchFilters>;
  onChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
  onApply: () => void;
}

export function MobileFilterDrawer({
  open,
  onOpenChange,
  filters,
  onChange,
  onReset,
  onApply,
}: MobileFilterDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <div className="overflow-y-auto p-4">
          <FilterSidebar filters={filters} onChange={onChange} onReset={onReset} />
        </div>

        <DrawerFooter className="border-t border-border/50 pt-4">
          <Button onClick={onApply} className="w-full">
            Apply Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
