import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ResourceData } from '../UploadWizard';
import { FileIcon, ImageIcon } from 'lucide-react';

interface StepReviewProps {
  data: ResourceData;
}

export function StepReview({ data }: StepReviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const totalSize = data.files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review & Publish</h3>
        <p className="text-sm text-muted-foreground">
          Review your resource details before publishing
        </p>
      </div>

      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10 space-y-4">
        {/* Basic Info */}
        <div>
          <h4 className="font-semibold text-primary mb-2">Basic Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Title:</span>
              <span className="font-medium">{data.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="secondary">{data.type.replace('_', ' ')}</Badge>
            </div>
            {data.minecraftVersion && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minecraft Version:</span>
                <span className="font-medium">{data.minecraftVersion}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h4 className="font-semibold text-primary mb-2">Description</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {data.description}
          </p>
        </div>

        {/* Tags */}
        {data.tags.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-primary mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Files */}
        <div>
          <h4 className="font-semibold text-primary mb-2">Files ({data.files.length})</h4>
          <div className="space-y-2">
            {data.files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-primary/10">
              <span>Total Size:</span>
              <span>{formatFileSize(totalSize)}</span>
            </div>
          </div>
        </div>

        {/* Images */}
        {(data.images.length > 0 || data.coverImage || data.bannerImage) && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-primary mb-2">Images</h4>
              <div className="space-y-2 text-sm">
                {data.coverImage && (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Cover Image</span>
                  </div>
                )}
                {data.bannerImage && (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Banner Image</span>
                  </div>
                )}
                {data.images.length > 0 && (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{data.images.length} Screenshot(s)</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* License & Visibility */}
        <div>
          <h4 className="font-semibold text-primary mb-2">License & Visibility</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">License:</span>
              <Badge variant="outline">{data.license.replace('_', ' ')}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visibility:</span>
              <Badge variant="outline">{data.visibility}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          By publishing this resource, you agree to the Minecraft Gallery Terms of Service
          and confirm that you have the rights to share this content.
        </p>
      </Card>
    </div>
  );
}
