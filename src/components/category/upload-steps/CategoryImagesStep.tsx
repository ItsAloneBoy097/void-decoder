import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { type CategoryConfig } from '@/config/categories';
import { type CategoryUploadData } from '../CategoryUploadWizard';

interface CategoryImagesStepProps {
  category: CategoryConfig;
  data: CategoryUploadData;
  onChange: (data: Partial<CategoryUploadData>) => void;
}

export function CategoryImagesStep({ category, data, onChange }: CategoryImagesStepProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'screenshots' | 'cover' | 'banner') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'screenshots') {
      const newImages = Array.from(files);
      const total = data.images.length + newImages.length;
      
      if (category.maxScreenshots && total > category.maxScreenshots) {
        alert(`Maximum ${category.maxScreenshots} screenshots allowed`);
        return;
      }
      
      onChange({ images: [...data.images, ...newImages] });
    } else if (type === 'cover') {
      onChange({ coverImage: files[0] });
    } else if (type === 'banner') {
      onChange({ bannerImage: files[0] });
    }
  };

  const removeImage = (index: number) => {
    onChange({ images: data.images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Images & Screenshots</h3>
        <p className="text-sm text-muted-foreground">
          {category.requiresScreenshots 
            ? `Required: ${category.minScreenshots || 1}-${category.maxScreenshots || 10} screenshots`
            : 'Add images to showcase your resource (optional)'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Cover Image */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
          <p className="text-xs text-muted-foreground">Main image shown on cards (recommended: 16:9 ratio)</p>
          
          {data.coverImage ? (
            <Card className="relative overflow-hidden">
              <img 
                src={URL.createObjectURL(data.coverImage)} 
                alt="Cover" 
                className="w-full aspect-video object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onChange({ coverImage: undefined })}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ) : (
            <label className="cursor-pointer">
              <Card className="border-2 border-dashed border-border hover:border-primary transition-colors p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                </div>
              </Card>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'cover')}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Banner Image */}
        <div className="space-y-2">
          <Label>Banner Image (Optional)</Label>
          <p className="text-xs text-muted-foreground">Wide banner for detail page (recommended: 21:9 ratio)</p>
          
          {data.bannerImage ? (
            <Card className="relative overflow-hidden">
              <img 
                src={URL.createObjectURL(data.bannerImage)} 
                alt="Banner" 
                className="w-full aspect-[21/9] object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onChange({ bannerImage: undefined })}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ) : (
            <label className="cursor-pointer">
              <Card className="border-2 border-dashed border-border hover:border-primary transition-colors p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload banner image</p>
                </div>
              </Card>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'banner')}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Screenshots */}
        {category.requiresScreenshots && (
          <div className="space-y-2">
            <Label>Screenshots {category.requiresScreenshots && '*'}</Label>
            <p className="text-xs text-muted-foreground">
              {category.minScreenshots && `Minimum ${category.minScreenshots} required. `}
              {category.maxScreenshots && `Maximum ${category.maxScreenshots} allowed.`}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.images.map((image, index) => (
                <Card key={index} className="relative overflow-hidden group">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Screenshot ${index + 1}`} 
                    className="w-full aspect-video object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}

              {(!category.maxScreenshots || data.images.length < category.maxScreenshots) && (
                <label className="cursor-pointer">
                  <Card className="border-2 border-dashed border-border hover:border-primary transition-colors p-6 aspect-video flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground text-center">Add Screenshot</p>
                    </div>
                  </Card>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, 'screenshots')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
