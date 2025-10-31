import { SearchFilters } from "@/types/search";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterSidebarProps {
  filters: Partial<SearchFilters>;
  onChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
}

const RESOURCE_TYPES = [
  { value: 'map', label: 'Maps' },
  { value: 'plugin', label: 'Plugins' },
  { value: 'mod', label: 'Mods' },
  { value: 'schematic', label: 'Schematics' },
  { value: 'datapack', label: 'Datapacks' },
  { value: 'resource_pack', label: 'Resource Packs' },
  { value: 'shader', label: 'Shaders' },
  { value: 'modpack', label: 'Modpacks' },
];

const MINECRAFT_VERSIONS = ['1.21', '1.20', '1.19', '1.18', '1.17', '1.16'];

const LICENSE_TYPES = [
  { value: 'mit', label: 'MIT' },
  { value: 'gpl', label: 'GPL' },
  { value: 'apache', label: 'Apache' },
  { value: 'cc_by', label: 'CC BY' },
  { value: 'cc_by_sa', label: 'CC BY-SA' },
  { value: 'cc0', label: 'CC0' },
];

export function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  const activeFilterCount = [
    filters.resourceTypes?.length || 0,
    filters.minecraftVersions?.length || 0,
    filters.licenseTypes?.length || 0,
    (filters.minRating && filters.minRating > 0) ? 1 : 0,
    (filters.minDownloads && filters.minDownloads > 0) ? 1 : 0,
    filters.verifiedOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="w-full lg:w-80 space-y-4">
      <div className="flex items-center justify-between px-4 py-3 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/20">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-primary/20 overflow-hidden">
        <Accordion type="multiple" defaultValue={['type', 'version']} className="w-full">
          <AccordionItem value="type" className="border-b border-border/50">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5">
              Resource Type
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {RESOURCE_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={filters.resourceTypes?.includes(type.value)}
                    onCheckedChange={() => toggleArrayFilter('resourceTypes', type.value)}
                  />
                  <Label
                    htmlFor={`type-${type.value}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="version" className="border-b border-border/50">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5">
              Minecraft Version
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {MINECRAFT_VERSIONS.map((version) => (
                <div key={version} className="flex items-center space-x-2">
                  <Checkbox
                    id={`version-${version}`}
                    checked={filters.minecraftVersions?.includes(version)}
                    onCheckedChange={() => toggleArrayFilter('minecraftVersions', version)}
                  />
                  <Label
                    htmlFor={`version-${version}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {version}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="license" className="border-b border-border/50">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5">
              License
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {LICENSE_TYPES.map((license) => (
                <div key={license.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`license-${license.value}`}
                    checked={filters.licenseTypes?.includes(license.value)}
                    onCheckedChange={() => toggleArrayFilter('licenseTypes', license.value)}
                  />
                  <Label
                    htmlFor={`license-${license.value}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {license.label}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rating" className="border-b border-border/50">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5">
              Minimum Rating
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{filters.minRating || 0}★</span>
                  <span>5★</span>
                </div>
                <Slider
                  value={[filters.minRating || 0]}
                  onValueChange={([value]) => onChange({ ...filters, minRating: value })}
                  max={5}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="downloads" className="border-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5">
              Minimum Downloads
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{filters.minDownloads || 0}</span>
                  <span>10,000+</span>
                </div>
                <Slider
                  value={[filters.minDownloads || 0]}
                  onValueChange={([value]) => onChange({ ...filters, minDownloads: value })}
                  max={10000}
                  step={100}
                  className="w-full"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-primary/20 p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={filters.verifiedOnly}
            onCheckedChange={(checked) => onChange({ ...filters, verifiedOnly: !!checked })}
          />
          <Label htmlFor="verified" className="text-sm cursor-pointer">
            Verified Creators Only
          </Label>
        </div>
      </div>
    </div>
  );
}
