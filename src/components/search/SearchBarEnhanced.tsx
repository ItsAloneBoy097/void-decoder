import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AutocompleteDropdown } from "./AutocompleteDropdown";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/integrations/supabase/client";
import { AutocompleteSuggestion } from "@/types/search";
import { useNavigate } from "react-router-dom";

interface SearchBarEnhancedProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBarEnhanced({ onSearch, placeholder = "Search maps, mods, plugins...", autoFocus }: SearchBarEnhancedProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion>({ resources: [], tags: [], creators: [] });
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions({ resources: [], tags: [], creators: [] });
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('autocomplete', {
          body: { q: debouncedQuery, limit: 8 }
        });

        if (error) throw error;
        if (data?.suggestions) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions({ resources: [], tags: [], creators: [] });
    inputRef.current?.focus();
  };

  const handleSelect = (type: 'resource' | 'tag' | 'creator', value: string) => {
    setShowSuggestions(false);
    
    switch (type) {
      case 'resource':
        navigate(`/resource/${value}`);
        break;
      case 'tag':
        navigate(`/search?tag=${encodeURIComponent(value)}`);
        break;
      case 'creator':
        navigate(`/profile/${value}`);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            autoFocus={autoFocus}
            className="h-10 md:h-12 pl-10 md:pl-12 pr-20 text-sm md:text-base bg-card/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:bg-card/70 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden md:inline-flex h-6 items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </form>

      {showSuggestions && query.length >= 2 && (
        <AutocompleteDropdown
          suggestions={suggestions}
          query={query}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
