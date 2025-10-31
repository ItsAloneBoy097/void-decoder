import { Card } from '@/components/ui/card';
import { Package, Map, Wrench, Box, Sparkles, Palette, FileCode, Globe, Cuboid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepResourceTypeProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

const RESOURCE_TYPES = [
  { id: 'map', label: 'Map', icon: Map },
  { id: 'plugin', label: 'Plugin', icon: Wrench },
  { id: 'mod', label: 'Mod', icon: Package },
  { id: 'modpack', label: 'Modpack', icon: Box },
  { id: 'resource_pack', label: 'Resource Pack', icon: Box },
  { id: 'texture_pack', label: 'Texture Pack', icon: Palette },
  { id: 'shader', label: 'Shader', icon: Sparkles },
  { id: 'skin', label: 'Skin', icon: Palette },
  { id: 'schematic', label: 'Schematic', icon: Cuboid },
  { id: 'datapack', label: 'Datapack', icon: FileCode },
  { id: 'world', label: 'World', icon: Globe },
  { id: 'seed', label: 'Seed', icon: Globe },
  { id: 'build', label: 'Build', icon: Cuboid },
  { id: 'script', label: 'Script', icon: FileCode },
  { id: 'other', label: 'Other', icon: Package }
];

export function StepResourceType({ selectedType, onSelectType }: StepResourceTypeProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Resource Type</h3>
        <p className="text-sm text-muted-foreground">
          Choose the type of resource you're uploading
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {RESOURCE_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.id}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:scale-105",
                "bg-card/50 backdrop-blur-sm border-primary/10",
                "flex flex-col items-center gap-3 text-center",
                selectedType === type.id && "border-primary bg-primary/10 shadow-glow"
              )}
              onClick={() => onSelectType(type.id)}
            >
              <Icon className={cn(
                "h-8 w-8",
                selectedType === type.id ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-medium",
                selectedType === type.id && "text-primary"
              )}>
                {type.label}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
