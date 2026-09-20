import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="flex gap-3 justify-center">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-avengers-gold h-4 w-4" />
          <Input
            type="text"
            placeholder="Enter research topic or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base bg-card border-2 focus:border-avengers-gold border-avengers-gold/30 focus:border-avengers-gold text-foreground"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={!query.trim() || isLoading}
          className="avengers-button h-12 px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              RESEARCH
            </>
          )}
        </Button>
      </form>
    </div>
  );
}