import { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadProgress } from '@/hooks/useFileUpload';

interface StepFileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  uploads: Record<string, UploadProgress>;
}

export function StepFileUpload({ files, onFilesChange, uploads }: StepFileUploadProps) {
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onFilesChange([...files, ...selectedFiles]);
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFilesChange([...files, ...droppedFiles]);
  }, [files, onFilesChange]);

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
        <p className="text-sm text-muted-foreground">
          Add your resource files (max 100MB per file)
        </p>
      </div>

      {/* Drop Zone */}
      <Card
        className={cn(
          "p-8 border-2 border-dashed border-primary/20",
          "bg-card/50 backdrop-blur-sm",
          "hover:border-primary/40 transition-colors duration-200"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Upload className="h-12 w-12 text-primary" />
          <div>
            <p className="text-sm font-medium">Drag and drop files here</p>
            <p className="text-xs text-muted-foreground mt-1">or</p>
          </div>
          <Button
            variant="glow"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            Browse Files
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <p className="text-xs text-muted-foreground">
            Supported: .zip, .jar, .mcworld, .schematic, .json and more
          </p>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <Card
                key={index}
                className="p-4 bg-card/50 backdrop-blur-sm border-primary/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileIcon className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploads).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Upload Progress</h4>
          <div className="space-y-2">
            {Object.entries(uploads).map(([id, upload]) => (
              <Card
                key={id}
                className="p-4 bg-card/50 backdrop-blur-sm border-primary/10"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {upload.fileName}
                    </span>
                    <span className={cn(
                      "text-xs font-medium",
                      upload.status === 'complete' && "text-green-500",
                      upload.status === 'error' && "text-destructive",
                      upload.status === 'uploading' && "text-primary"
                    )}>
                      {upload.status === 'complete' && 'Complete'}
                      {upload.status === 'error' && 'Failed'}
                      {upload.status === 'uploading' && `${upload.progress}%`}
                    </span>
                  </div>
                  <Progress
                    value={upload.progress}
                    className={cn(
                      "h-2",
                      upload.status === 'complete' && "[&>div]:bg-green-500",
                      upload.status === 'error' && "[&>div]:bg-destructive"
                    )}
                  />
                  {upload.error && (
                    <p className="text-xs text-destructive">{upload.error}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
