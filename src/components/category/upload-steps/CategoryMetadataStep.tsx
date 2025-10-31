import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { useState } from 'react';
import { type CategoryConfig, MINECRAFT_EDITIONS } from '@/config/categories';
import { type CategoryUploadData } from '../CategoryUploadWizard';

interface CategoryMetadataStepProps {
  category: CategoryConfig;
  data: CategoryUploadData;
  onChange: (data: Partial<CategoryUploadData>) => void;
}

export function CategoryMetadataStep({ category, data, onChange }: CategoryMetadataStepProps) {
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      onChange({ tags: [...data.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange({ tags: data.tags.filter(tag => tag !== tagToRemove) });
  };

  const updateCategoryMetadata = (field: string, value: any) => {
    onChange({
      category_metadata: {
        ...data.category_metadata,
        [field]: value
      }
    });
  };

  const renderField = (field: any) => {
    const value = data.category_metadata[field.name];

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => updateCategoryMetadata(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="bg-background/50"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => updateCategoryMetadata(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="bg-background/50 resize-none"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => updateCategoryMetadata(field.name, parseInt(e.target.value))}
            placeholder={field.placeholder}
            required={field.required}
            className="bg-background/50"
          />
        );

      case 'select':
        return (
          <Select 
            value={value || ''} 
            onValueChange={(val) => updateCategoryMetadata(field.name, val)}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = (value || []) as string[];
        return (
          <div className="space-y-2">
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    updateCategoryMetadata(field.name, newValues);
                  }}
                />
                <label
                  htmlFor={`${field.name}-${option}`}
                  className="text-sm cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'toggle':
        return (
          <Switch
            checked={value || false}
            onCheckedChange={(checked) => updateCategoryMetadata(field.name, checked)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
      <div>
        <h3 className="text-lg font-semibold mb-2">Resource Details</h3>
        <p className="text-sm text-muted-foreground">
          Provide information about your {category.label.toLowerCase().replace(/s$/, '')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={`My Amazing ${category.label.replace(/s$/, '')}`}
            className="bg-background/50"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description *</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Brief description (shown on cards)"
            rows={3}
            className="bg-background/50 resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="long-description">Full Description</Label>
          <Textarea
            id="long-description"
            value={data.long_description || ''}
            onChange={(e) => onChange({ long_description: e.target.value })}
            placeholder="Detailed description with features, installation instructions, etc. (Markdown supported)"
            rows={6}
            className="bg-background/50 resize-none"
          />
        </div>

        {/* Versioning */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="resource-version">Resource Version</Label>
            <Input
              id="resource-version"
              value={data.resource_version}
              onChange={(e) => onChange({ resource_version: e.target.value })}
              placeholder="1.0.0"
              className="bg-background/50"
            />
          </div>

          {category.supportsVersioning && (
            <div className="space-y-2">
              <Label htmlFor="minecraft-version">Minecraft Version</Label>
              <Input
                id="minecraft-version"
                value={data.minecraft_version}
                onChange={(e) => onChange({ minecraft_version: e.target.value })}
                placeholder="1.20.4"
                className="bg-background/50"
              />
            </div>
          )}
        </div>

        {/* Editions */}
        {category.supportsEditions && (
          <div className="space-y-2">
            <Label>Minecraft Editions</Label>
            <div className="space-y-2">
              {MINECRAFT_EDITIONS.map((edition) => (
                <div key={edition.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edition-${edition.id}`}
                    checked={data.minecraft_editions.includes(edition.id)}
                    onCheckedChange={(checked) => {
                      const newEditions = checked
                        ? [...data.minecraft_editions, edition.id]
                        : data.minecraft_editions.filter(e => e !== edition.id);
                      onChange({ minecraft_editions: newEditions });
                    }}
                  />
                  <label htmlFor={`edition-${edition.id}`} className="text-sm cursor-pointer">
                    {edition.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category-specific fields */}
        {category.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && '*'}
            </Label>
            {renderField(field)}
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        ))}

        {/* Tags */}
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
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.tags.map((tag) => (
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

        {/* License and Visibility */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="license">License</Label>
            <Select value={data.license} onValueChange={(val) => onChange({ license: val })}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_rights_reserved">All Rights Reserved</SelectItem>
                <SelectItem value="cc_by">CC BY</SelectItem>
                <SelectItem value="cc_by_sa">CC BY-SA</SelectItem>
                <SelectItem value="cc_by_nc">CC BY-NC</SelectItem>
                <SelectItem value="mit">MIT</SelectItem>
                <SelectItem value="gpl">GPL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={data.visibility} onValueChange={(val) => onChange({ visibility: val })}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
