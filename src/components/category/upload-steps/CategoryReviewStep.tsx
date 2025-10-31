import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type CategoryConfig } from '@/config/categories';
import { type CategoryUploadData } from '../CategoryUploadWizard';
import { FileText, Image as ImageIcon, Tag, Shield, Eye } from 'lucide-react';

interface CategoryReviewStepProps {
  category: CategoryConfig;
  data: CategoryUploadData;
}

export function CategoryReviewStep({ category, data }: CategoryReviewStepProps) {
  const Icon = category.icon;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review & Publish</h3>
        <p className="text-sm text-muted-foreground">
          Review your resource details before publishing
        </p>
      </div>

      <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm">
        {/* Category */}
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: `hsl(${category.color} / 0.1)` }}
          >
            <Icon className="h-6 w-6" style={{ color: `hsl(${category.color})` }} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="font-semibold">{category.label}</p>
          </div>
        </div>

        <Separator />

        {/* Basic Info */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Basic Information
          </h4>
          <div className="space-y-2 pl-6">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium">{data.title || 'Untitled'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{data.description || 'No description'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Resource Version</p>
                <p className="text-sm">{data.resource_version}</p>
              </div>
              {data.minecraft_version && (
                <div>
                  <p className="text-sm text-muted-foreground">Minecraft Version</p>
                  <p className="text-sm">{data.minecraft_version}</p>
                </div>
              )}
            </div>
            {data.minecraft_editions.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Editions</p>
                <div className="flex flex-wrap gap-1">
                  {data.minecraft_editions.map((edition) => (
                    <Badge key={edition} variant="secondary" className="text-xs capitalize">
                      {edition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Category-specific Metadata */}
        {Object.keys(data.category_metadata).length > 0 && (
          <>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {category.label} Details
              </h4>
              <div className="space-y-2 pl-6">
                {Object.entries(data.category_metadata).map(([key, value]) => {
                  if (!value) return null;
                  const field = category.fields.find(f => f.name === key);
                  if (!field) return null;

                  return (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground">{field.label}</p>
                      <p className="text-sm">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Tags */}
        {data.tags.length > 0 && (
          <>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2 pl-6">
                {data.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Images */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images
          </h4>
          <div className="pl-6 space-y-2">
            <p className="text-sm">
              Cover Image: {data.coverImage ? '✓ Uploaded' : '✗ Not provided'}
            </p>
            <p className="text-sm">
              Banner Image: {data.bannerImage ? '✓ Uploaded' : '✗ Not provided'}
            </p>
            <p className="text-sm">
              Screenshots: {data.images.length} uploaded
            </p>
          </div>
        </div>

        <Separator />

        {/* License & Visibility */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              License
            </h4>
            <p className="text-sm pl-6">{data.license.replace(/_/g, ' ').toUpperCase()}</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visibility
            </h4>
            <p className="text-sm pl-6 capitalize">{data.visibility}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
