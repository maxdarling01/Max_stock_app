import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string, isAI: boolean) => void;
  initialQuery?: string;
  initialIsAI?: boolean;
}

export default function SearchBar({ onSearch, initialQuery = '', initialIsAI = true }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isAI, setIsAI] = useState(initialIsAI);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, isAI);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-center mb-4 space-x-4">
        <button
          type="button"
          onClick={() => setIsAI(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            !isAI
              ? 'bg-yellow-500 text-black shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Search className="w-4 h-4 inline-block mr-2" />
          Keyword Search
        </button>
        <button
          type="button"
          onClick={() => setIsAI(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isAI
              ? 'bg-yellow-500 text-black shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-4 h-4 inline-block mr-2" />
          AI Smart Search
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAI
                ? "Describe what you need... (e.g., 'businesswoman presenting in modern office')"
                : "Search by keywords..."
            }
            className="w-full px-6 py-4 pr-14 text-lg rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:outline-none shadow-lg transition-all text-black"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
          >
            {isAI ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
