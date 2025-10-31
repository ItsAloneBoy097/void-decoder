import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

export function useFileUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadProgress>>({});

  const uploadFile = async (
    file: File,
    bucket: 'resource-files' | 'resource-images',
    path: string
  ): Promise<string | null> => {
    const fileId = `${file.name}-${Date.now()}`;
    
    setUploads(prev => ({
      ...prev,
      [fileId]: {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }
    }));

    try {
      const filePath = `${path}/${file.name}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      setUploads(prev => ({
        ...prev,
        [fileId]: {
          fileName: file.name,
          progress: 100,
          status: 'complete'
        }
      }));

      // Get public URL for images, signed URL for files
      if (bucket === 'resource-images') {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        return publicUrl;
      } else {
        return filePath;
      }
    } catch (error: any) {
      setUploads(prev => ({
        ...prev,
        [fileId]: {
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: error.message
        }
      }));

      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });

      return null;
    }
  };

  const uploadMultipleFiles = async (
    files: File[],
    bucket: 'resource-files' | 'resource-images',
    path: string
  ): Promise<string[]> => {
    const results = await Promise.all(
      files.map(file => uploadFile(file, bucket, path))
    );
    return results.filter((url): url is string => url !== null);
  };

  const clearUploads = () => setUploads({});

  return {
    uploads,
    uploadFile,
    uploadMultipleFiles,
    clearUploads
  };
}
