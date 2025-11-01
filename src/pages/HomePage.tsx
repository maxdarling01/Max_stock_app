import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import AssetCard from '../components/AssetCard';
import { mockAssets } from '../data/mockAssets';

const categories = ['Nature', 'Business', 'Lifestyle', 'Technology', 'Food', 'Travel'];

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = (query: string, isAI: boolean) => {
    navigate(`/search?q=${encodeURIComponent(query)}&ai=${isAI}`);
  };

  const featuredAssets = selectedCategory
    ? mockAssets.filter((asset) => asset.category === selectedCategory).slice(0, 12)
    : mockAssets.slice(0, 12);

  return (
    <div>
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Perfect Stock Assets
              <br />
              <span className="text-blue-300">with AI-Powered Search</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-12">
              Search millions of royalty-free videos and photos using natural language.
              Powered by advanced AI to understand exactly what you need.
            </p>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-blue-800 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-800 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory ? `${selectedCategory} Assets` : 'Featured Assets'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>

        {featuredAssets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No assets found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
