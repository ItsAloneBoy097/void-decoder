import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';

interface StepMetadataProps {
  title: string;
  description: string;
  minecraftVersion: string;
  tags: string[];
  onChange: (data: any) => void;
}

export function StepMetadata({
  title,
  description,
  minecraftVersion,
  tags,
  onChange
}: StepMetadataProps) {
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onChange({ tags: [...tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange({ tags: tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Resource Information</h3>
        <p className="text-sm text-muted-foreground">
          Add details about your resource
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="My Awesome Resource"
            className="bg-background/50"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe your resource in detail..."
            rows={6}
            className="bg-background/50 resize-none"
            required
          />
          <p className="text-xs text-muted-foreground">
            Supports Markdown formatting
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minecraft-version">Minecraft Version</Label>
          <Input
            id="minecraft-version"
            value={minecraftVersion}
            onChange={(e) => onChange({ minecraftVersion: e.target.value })}
            placeholder="1.20.4"
            className="bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tags..."
              className="bg-background/50"
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
