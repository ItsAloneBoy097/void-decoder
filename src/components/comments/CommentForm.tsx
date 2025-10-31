import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  isEditing?: boolean;
  disabled?: boolean;
}

export function CommentForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  submitLabel = 'Comment',
  isEditing = false,
  disabled = false,
}: CommentFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  const charCount = value.length;
  const maxChars = 1500;
  const isOverLimit = charCount > maxChars;
  const isUnderMin = charCount < 3;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[100px] resize-none bg-background/50 backdrop-blur-sm"
          disabled={disabled}
        />
        <div className={`absolute bottom-2 right-2 text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
          {charCount}/{maxChars}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-between">
        <p className="text-xs text-muted-foreground">
          Tip: Press <kbd className="px-1 py-0.5 rounded bg-muted">Ctrl+Enter</kbd> to submit
        </p>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={onSubmit}
            disabled={disabled || isOverLimit || isUnderMin || !value.trim()}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
