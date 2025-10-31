export interface CategoryResource {
  id: string;
  category_id: string;
  creator_id: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  
  // Versioning
  resource_version: string;
  minecraft_version: string;
  minecraft_editions: string[]; // ['java', 'bedrock', 'education']
  
  // Metadata
  tags: string[];
  license: string;
  visibility: 'public' | 'unlisted' | 'draft';
  
  // Category-specific data stored as JSONB
  category_metadata: Record<string, any>;
  
  // Statistics
  downloads: number;
  views: number;
  rating: number;
  rating_count: number;
  
  // Media
  cover_image_url?: string;
  banner_image_url?: string;
  screenshots: string[];
  
  // Files
  file_url?: string;
  file_name?: string;
  file_size?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  featured: boolean;
}

export interface CategoryMetadata {
  [key: string]: string | number | boolean | string[];
}
