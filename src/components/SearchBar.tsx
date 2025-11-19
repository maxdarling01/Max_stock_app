import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string, isAI: boolean) => void;
  initialQuery?: string;
  initialIsAI?: boolean;
}

const exampleSearches = [
  'Luxury yacht sailing at sunset',
  'Bugatti driving at sunset on the beach',
  'Expensive watches',
  'McLaren driving through the mountains',
];

export default function SearchBar({ onSearch, initialQuery = '', initialIsAI = true }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isAI, setIsAI] = useState(initialIsAI);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, isAI);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    onSearch(example, true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-center mb-6 space-x-3">
        <button
          type="button"
          onClick={() => setIsAI(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            !isAI
              ? 'bg-yellow-500 text-black shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Search className="w-4 h-4" />
          Keyword Search
        </button>
        <button
          type="button"
          onClick={() => setIsAI(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            isAI
              ? 'bg-yellow-500 text-black shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Smart Search
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-6">
        <div
          className={`relative rounded-xl overflow-hidden transition-all ${
            isAI ? 'ring-2 ring-yellow-500 ring-opacity-30' : ''
          }`}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAI
                ? "Describe what you're looking for... (e.g. 'Bugatti driving on the beach at sunset')"
                : "Enter keywords... (e.g. 'Supercar, Sunset, Beach')"
            }
            className="w-full px-6 py-4 pr-14 text-lg rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:outline-none shadow-lg transition-all text-black"
          />
          {isAI && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-yellow-500 text-black text-xs font-semibold rounded">
              AI
            </div>
          )}
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

      {isAI && (
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">Example searches:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {exampleSearches.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full hover:bg-yellow-500 hover:text-black transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
