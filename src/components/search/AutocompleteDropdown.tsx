import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { AutocompleteSuggestion } from "@/types/search";
import { Hash, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AutocompleteDropdownProps {
  suggestions: AutocompleteSuggestion;
  query: string;
  onSelect: (type: 'resource' | 'tag' | 'creator', value: string) => void;
}

export function AutocompleteDropdown({ suggestions, query, onSelect }: AutocompleteDropdownProps) {
  const highlightMatch = (text: string, query: string) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <span className="text-primary font-semibold">{text.substring(index, index + query.length)}</span>
        {text.substring(index + query.length)}
      </>
    );
  };

  const hasResults = suggestions.resources.length > 0 || suggestions.tags.length > 0 || suggestions.creators.length > 0;

  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border border-primary/20 rounded-xl shadow-glow z-50 p-4">
        <p className="text-muted-foreground text-sm">No suggestions found</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border border-primary/20 rounded-xl shadow-glow z-50 overflow-hidden">
      <Command className="bg-transparent">
        <CommandList className="max-h-96">
          {suggestions.resources.length > 0 && (
            <CommandGroup heading="Resources">
              {suggestions.resources.map((resource) => (
                <CommandItem
                  key={resource.id}
                  onSelect={() => onSelect('resource', resource.slug)}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <FileText className="mr-3 h-4 w-4 text-primary" />
                  <div className="flex-1 flex items-center justify-between">
                    <span>{highlightMatch(resource.title, query)}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {resource.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {suggestions.tags.length > 0 && (
            <CommandGroup heading="Tags">
              {suggestions.tags.map((tag) => (
                <CommandItem
                  key={tag.name}
                  onSelect={() => onSelect('tag', tag.name)}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <Hash className="mr-3 h-4 w-4 text-primary" />
                  <div className="flex-1 flex items-center justify-between">
                    <span>{highlightMatch(tag.name, query)}</span>
                    <span className="text-xs text-muted-foreground">{tag.count}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {suggestions.creators.length > 0 && (
            <CommandGroup heading="Creators">
              {suggestions.creators.map((creator) => (
                <CommandItem
                  key={creator.id}
                  onSelect={() => onSelect('creator', creator.id)}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <Avatar className="mr-3 h-6 w-6">
                    <AvatarImage src={creator.avatar_url || ''} />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{highlightMatch(creator.username, query)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
