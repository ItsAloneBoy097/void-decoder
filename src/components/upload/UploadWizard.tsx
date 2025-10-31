import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { StepResourceType } from './steps/StepResourceType';
import { StepFileUpload } from './steps/StepFileUpload';
import { StepMetadata } from './steps/StepMetadata';
import { StepImages } from './steps/StepImages';
import { StepLicense } from './steps/StepLicense';
import { StepReview } from './steps/StepReview';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface UploadWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ResourceData {
  type: string;
  title: string;
  description: string;
  minecraftVersion: string;
  tags: string[];
  license: string;
  visibility: string;
  files: File[];
  images: File[];
  coverImage?: File;
  bannerImage?: File;
}

const STEPS = [
  'Resource Type',
  'Upload Files',
  'Metadata',
  'Images',
  'License & Visibility',
  'Review'
];

export function UploadWizard({ open, onOpenChange }: UploadWizardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { uploadFile, uploadMultipleFiles, uploads } = useFileUpload();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [resourceData, setResourceData] = useState<ResourceData>({
    type: '',
    title: '',
    description: '',
    minecraftVersion: '',
    tags: [],
    license: 'all_rights_reserved',
    visibility: 'draft',
    files: [],
    images: []
  });

  const updateResourceData = (data: Partial<ResourceData>) => {
    setResourceData(prev => ({ ...prev, ...data }));
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
      case 0: return resourceData.type !== '';
      case 1: return resourceData.files.length > 0;
      case 2: return resourceData.title !== '' && resourceData.description !== '';
      case 3: return true;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload resources",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate slug
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_slug', { 
          title: resourceData.title,
          creator_id: user.id 
        });

      if (slugError) throw slugError;

      // Create resource entry
      const { data: resource, error: resourceError } = await supabase
        .from('resources')
        .insert({
          creator_id: user.id,
          title: resourceData.title,
          slug: slugData,
          description: resourceData.description,
          type: resourceData.type,
          minecraft_version: resourceData.minecraftVersion,
          license: resourceData.license,
          visibility: resourceData.visibility
        } as any)
        .select()
        .single();

      if (resourceError) throw resourceError;

      // Upload files
      const userPath = `${user.id}/${resource.id}`;
      const fileUrls: string[] = [];
      
      for (const file of resourceData.files) {
        const url = await uploadFile(file, 'resource-files', userPath);
        if (url) {
          // Insert file record
          await supabase.from('resource_files').insert({
            resource_id: resource.id,
            file_url: url,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            minecraft_version: resourceData.minecraftVersion,
            is_primary: fileUrls.length === 0
          });
          fileUrls.push(url);
        }
      }

      // Upload images
      if (resourceData.images.length > 0) {
        const imageUrls = await uploadMultipleFiles(
          resourceData.images,
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
      if (resourceData.coverImage) {
        const coverUrl = await uploadFile(
          resourceData.coverImage,
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
      if (resourceData.bannerImage) {
        const bannerUrl = await uploadFile(
          resourceData.bannerImage,
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
      for (const tagName of resourceData.tags) {
        // Create or get tag
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

        // Link tag to resource
        await supabase.from('resource_tags').insert({
          resource_id: resource.id,
          tag_id: tagId
        });
      }

      toast({
        title: "Resource uploaded!",
        description: "Your resource has been successfully uploaded."
      });

      onOpenChange(false);
      navigate(`/resource/${resource.id}`);
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
            Upload Resource
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
          </p>
        </DialogHeader>

        {/* Progress Bar */}
        <Progress value={(currentStep / (STEPS.length - 1)) * 100} className="h-2" />

        {/* Step Content */}
        <div className="py-6">
          {currentStep === 0 && (
            <StepResourceType
              selectedType={resourceData.type}
              onSelectType={(type) => updateResourceData({ type })}
            />
          )}
          {currentStep === 1 && (
            <StepFileUpload
              files={resourceData.files}
              onFilesChange={(files) => updateResourceData({ files })}
              uploads={uploads}
            />
          )}
          {currentStep === 2 && (
            <StepMetadata
              title={resourceData.title}
              description={resourceData.description}
              minecraftVersion={resourceData.minecraftVersion}
              tags={resourceData.tags}
              onChange={updateResourceData}
            />
          )}
          {currentStep === 3 && (
            <StepImages
              images={resourceData.images}
              coverImage={resourceData.coverImage}
              bannerImage={resourceData.bannerImage}
              onChange={updateResourceData}
            />
          )}
          {currentStep === 4 && (
            <StepLicense
              license={resourceData.license}
              visibility={resourceData.visibility}
              onChange={updateResourceData}
            />
          )}
          {currentStep === 5 && <StepReview data={resourceData} />}
        </div>

        {/* Navigation */}
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
