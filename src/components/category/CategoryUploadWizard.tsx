import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getCategoryById, getAllCategories, type CategoryConfig } from '@/config/categories';
import { CategoryUploadStep } from './upload-steps/CategoryUploadStep';
import { CategoryMetadataStep } from './upload-steps/CategoryMetadataStep';
import { CategoryImagesStep } from './upload-steps/CategoryImagesStep';
import { CategoryReviewStep } from './upload-steps/CategoryReviewStep';

interface CategoryUploadWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategoryId?: string;
}

export interface CategoryUploadData {
  category_id: string;
  title: string;
  description: string;
  long_description?: string;
  resource_version: string;
  minecraft_version: string;
  minecraft_editions: string[];
  tags: string[];
  license: string;
  visibility: string;
  category_metadata: Record<string, any>;
  files: File[];
  images: File[];
  coverImage?: File;
  bannerImage?: File;
}

const STEPS = ['Category', 'Files', 'Details', 'Images', 'Review'];

export function CategoryUploadWizard({ open, onOpenChange, initialCategoryId }: CategoryUploadWizardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { uploadFile, uploadMultipleFiles, uploads } = useFileUpload();
  
  const [currentStep, setCurrentStep] = useState(initialCategoryId ? 1 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(
    initialCategoryId ? getCategoryById(initialCategoryId) || null : null
  );
  
  const [uploadData, setUploadData] = useState<CategoryUploadData>({
    category_id: initialCategoryId || '',
    title: '',
    description: '',
    resource_version: '1.0.0',
    minecraft_version: '',
    minecraft_editions: [],
    tags: [],
    license: 'all_rights_reserved',
    visibility: 'draft',
    category_metadata: {},
    files: [],
    images: []
  });

  // Handle initial category from location state
  useEffect(() => {
    const stateCategory = (location.state as any)?.categoryId;
    if (stateCategory && !selectedCategory) {
      const cat = getCategoryById(stateCategory);
      if (cat) {
        setSelectedCategory(cat);
        setUploadData(prev => ({ ...prev, category_id: cat.id }));
        setCurrentStep(1);
      }
    }
  }, [location.state, selectedCategory]);

  const updateUploadData = (data: Partial<CategoryUploadData>) => {
    setUploadData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedCategory !== null;
      case 1: return uploadData.files.length > 0 || selectedCategory?.fileTypes.length === 0;
      case 2: return uploadData.title !== '' && uploadData.description !== '';
      case 3: return !selectedCategory?.requiresScreenshots || uploadData.images.length >= (selectedCategory.minScreenshots || 0);
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a category and sign in",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate slug
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_slug', { 
          title: uploadData.title,
          creator_id: user.id 
        });

      if (slugError) throw slugError;

      // Create resource entry
      const { data: resource, error: resourceError } = await supabase
        .from('resources')
        .insert({
          creator_id: user.id,
          category_id: selectedCategory.id,
          title: uploadData.title,
          slug: slugData,
          description: uploadData.description,
          long_description: uploadData.long_description,
          resource_version: uploadData.resource_version,
          minecraft_version: uploadData.minecraft_version,
          minecraft_editions: uploadData.minecraft_editions,
          license: uploadData.license,
          visibility: uploadData.visibility,
          category_metadata: uploadData.category_metadata
        } as any)
        .select()
        .single();

      if (resourceError) throw resourceError;

      // Upload files
      const userPath = `${user.id}/${resource.id}`;
      
      if (uploadData.files.length > 0) {
        for (const file of uploadData.files) {
          const url = await uploadFile(file, 'resource-files', userPath);
          if (url) {
            await supabase.from('resource_files').insert({
              resource_id: resource.id,
              file_url: url,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              minecraft_version: uploadData.minecraft_version,
              is_primary: true
            });
          }
        }
      }

      // Upload images
      if (uploadData.images.length > 0) {
        const imageUrls = await uploadMultipleFiles(
          uploadData.images,
          'resource-images',
          userPath
        );

        for (let i = 0; i < imageUrls.length; i++) {
          await supabase.from('resource_images').insert({
            resource_id: resource.id,
            image_url: imageUrls[i],
            image_type: 'screenshot',
            display_order: i
          });
        }
      }

      // Upload cover image
      if (uploadData.coverImage) {
        const coverUrl = await uploadFile(
          uploadData.coverImage,
          'resource-images',
          userPath
        );
        if (coverUrl) {
          await supabase.from('resource_images').insert({
            resource_id: resource.id,
            image_url: coverUrl,
            image_type: 'cover',
            display_order: 0
          });
        }
      }

      // Upload banner image
      if (uploadData.bannerImage) {
        const bannerUrl = await uploadFile(
          uploadData.bannerImage,
          'resource-images',
          userPath
        );
        if (bannerUrl) {
          await supabase.from('resource_images').insert({
            resource_id: resource.id,
            image_url: bannerUrl,
            image_type: 'banner',
            display_order: 0
          });
        }
      }

      // Handle tags
      for (const tagName of uploadData.tags) {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-');
        const { data: tag } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', slug)
          .single();

        let tagId: string;
        
        if (tag) {
          tagId = tag.id;
        } else {
          const { data: newTag, error: tagError } = await supabase
            .from('tags')
            .insert({ name: tagName, slug })
            .select('id')
            .single();
          
          if (tagError) throw tagError;
          tagId = newTag.id;
        }

        await supabase.from('resource_tags').insert({
          resource_id: resource.id,
          tag_id: tagId
        });
      }

      toast({
        title: "Resource uploaded!",
        description: `Your ${selectedCategory.label.toLowerCase().replace(/s$/, '')} has been successfully uploaded.`
      });

      onOpenChange(false);
      navigate(`/${selectedCategory.slug}/${resource.slug}`);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-cyan bg-clip-text text-transparent">
            {selectedCategory ? `Upload ${selectedCategory.label.replace(/s$/, '')}` : 'Upload Resource'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
          </p>
        </DialogHeader>

        <Progress value={(currentStep / (STEPS.length - 1)) * 100} className="h-2" />

        <div className="py-6">
          {currentStep === 0 && (
            <CategoryUploadStep
              categories={getAllCategories()}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                updateUploadData({ category_id: cat.id });
              }}
            />
          )}
          {currentStep === 1 && selectedCategory && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload Files</h3>
              <p className="text-sm text-muted-foreground">
                {selectedCategory.fileTypes.length > 0 
                  ? `Accepted formats: ${selectedCategory.fileTypes.join(', ')} (Max: ${selectedCategory.maxFileSize}MB)`
                  : 'No file upload required for this category'}
              </p>
              {/* File upload component would go here */}
            </div>
          )}
          {currentStep === 2 && selectedCategory && (
            <CategoryMetadataStep
              category={selectedCategory}
              data={uploadData}
              onChange={updateUploadData}
            />
          )}
          {currentStep === 3 && selectedCategory && (
            <CategoryImagesStep
              category={selectedCategory}
              data={uploadData}
              onChange={updateUploadData}
            />
          )}
          {currentStep === 4 && selectedCategory && (
            <CategoryReviewStep
              category={selectedCategory}
              data={uploadData}
            />
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-primary/10">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              variant="glow"
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="glow"
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Resource'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
