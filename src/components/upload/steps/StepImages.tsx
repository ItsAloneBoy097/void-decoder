import { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepImagesProps {
  images: File[];
  coverImage?: File;
  bannerImage?: File;
  onChange: (data: any) => void;
}

export function StepImages({ images, coverImage, bannerImage, onChange }: StepImagesProps) {
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'screenshots' | 'cover' | 'banner') => {
    const selectedFiles = Array.from(e.target.files || []);
    if (type === 'screenshots') {
      onChange({ images: [...images, ...selectedFiles] });
    } else if (type === 'cover') {
      onChange({ coverImage: selectedFiles[0] });
    } else {
      onChange({ bannerImage: selectedFiles[0] });
    }
  }, [images, onChange]);

  const removeImage = (index: number) => {
    onChange({ images: images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Images & Screenshots</h3>
        <p className="text-sm text-muted-foreground">
          Add visual previews of your resource (optional)
        </p>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <Card
          className={cn(
            "p-6 border-2 border-dashed border-primary/20",
            "bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-colors"
          )}
        >
          {coverImage ? (
            <div className="relative">
              <img
                src={URL.createObjectURL(coverImage)}
                alt="Cover"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onChange({ coverImage: undefined })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <Button
                variant="outline"
                onClick={() => document.getElementById('cover-input')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Cover Image
              </Button>
              <input
                id="cover-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e, 'cover')}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1280x720px
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Banner Image */}
      <div className="space-y-2">
        <Label>Banner Image</Label>
        <Card
          className={cn(
            "p-6 border-2 border-dashed border-primary/20",
            "bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-colors"
          )}
        >
          {bannerImage ? (
            <div className="relative">
              <img
                src={URL.createObjectURL(bannerImage)}
                alt="Banner"
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onChange({ bannerImage: undefined })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <Button
                variant="outline"
                onClick={() => document.getElementById('banner-input')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Banner Image
              </Button>
              <input
                id="banner-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e, 'banner')}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1920x400px
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Screenshots */}
      <div className="space-y-2">
        <Label>Screenshots</Label>
        <Card
          className={cn(
            "p-6 border-2 border-dashed border-primary/20",
            "bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-colors"
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <Button
              variant="outline"
              onClick={() => document.getElementById('screenshots-input')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Screenshots
            </Button>
            <input
              id="screenshots-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageSelect(e, 'screenshots')}
            />
          </div>
        </Card>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
