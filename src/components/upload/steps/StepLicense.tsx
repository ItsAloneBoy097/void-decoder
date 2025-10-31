import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';

interface StepLicenseProps {
  license: string;
  visibility: string;
  onChange: (data: any) => void;
}

const LICENSES = [
  { id: 'all_rights_reserved', name: 'All Rights Reserved', description: 'Full copyright protection' },
  { id: 'mit', name: 'MIT License', description: 'Permissive open source' },
  { id: 'gpl', name: 'GPL License', description: 'Copyleft open source' },
  { id: 'cc_by', name: 'CC BY 4.0', description: 'Creative Commons Attribution' },
  { id: 'cc_by_sa', name: 'CC BY-SA 4.0', description: 'Creative Commons ShareAlike' },
  { id: 'cc0', name: 'CC0', description: 'Public domain dedication' },
  { id: 'apache', name: 'Apache 2.0', description: 'Permissive with patent grant' },
];

const VISIBILITY_OPTIONS = [
  { id: 'draft', name: 'Draft', description: 'Only visible to you' },
  { id: 'public', name: 'Public', description: 'Visible to everyone' },
  { id: 'private', name: 'Private', description: 'Hidden from public listings' },
];

export function StepLicense({ license, visibility, onChange }: StepLicenseProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">License & Visibility</h3>
        <p className="text-sm text-muted-foreground">
          Choose how others can use your resource
        </p>
      </div>

      {/* License Selection */}
      <div className="space-y-3">
        <Label>License Type</Label>
        <RadioGroup value={license} onValueChange={(value) => onChange({ license: value })}>
          <div className="space-y-2">
            {LICENSES.map((lic) => (
              <Card
                key={lic.id}
                className="p-4 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onChange({ license: lic.id })}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={lic.id} id={lic.id} />
                  <div className="flex-1">
                    <Label htmlFor={lic.id} className="cursor-pointer font-medium">
                      {lic.name}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lic.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Visibility Selection */}
      <div className="space-y-3">
        <Label>Visibility</Label>
        <RadioGroup value={visibility} onValueChange={(value) => onChange({ visibility: value })}>
          <div className="space-y-2">
            {VISIBILITY_OPTIONS.map((vis) => (
              <Card
                key={vis.id}
                className="p-4 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onChange({ visibility: vis.id })}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={vis.id} id={vis.id} />
                  <div className="flex-1">
                    <Label htmlFor={vis.id} className="cursor-pointer font-medium">
                      {vis.name}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vis.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
