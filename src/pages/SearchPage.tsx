import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import AssetCard from '../components/AssetCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Asset } from '../data/mockAssets';
import { fetchAssets, categoryIncludes } from '../services/assetService';
import { SlidersHorizontal } from 'lucide-react';

type MediaType = 'all' | 'video' | 'photo';
type Orientation = 'all' | 'landscape' | 'portrait' | 'square';
type Resolution = 'all' | 'HD' | '4K';
type SortOption = 'relevance' | 'downloads' | 'newest';

const allCategories = ['Luxury Lifestyle', 'Boat Lifestyle', 'Supercars', 'Watches', 'Nature'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const isAI = searchParams.get('ai') === 'true';

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Asset[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [orientation, setOrientation] = useState<Orientation>('all');
  const [resolution, setResolution] = useState<Resolution>('all');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      const data = await fetchAssets();
      setAllAssets(data);
    };
    loadAssets();
  }, []);

  useEffect(() => {
    if (query || allAssets.length > 0) {
      performSearch();
    }
  }, [query, isAI, mediaType, orientation, resolution, category, sortBy, allAssets]);

  const performSearch = async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    let filtered = [...allAssets];

    const searchLower = query.toLowerCase();
    if (query) {
      filtered = filtered.filter((asset) => {
        const titleMatch = asset.title.toLowerCase().includes(searchLower);
        const descMatch = asset.description.toLowerCase().includes(searchLower);
        const tagMatch = asset.tags.some((tag) => tag.toLowerCase().includes(searchLower));
        const categoryMatch = asset.category.toLowerCase().includes(searchLower);

        return titleMatch || descMatch || tagMatch || categoryMatch;
      });
    }

    if (mediaType !== 'all') {
      filtered = filtered.filter((asset) => asset.type === mediaType);
    }

    if (orientation !== 'all') {
      filtered = filtered.filter((asset) => asset.orientation === orientation);
    }

    if (resolution !== 'all') {
      filtered = filtered.filter((asset) => asset.resolution === resolution);
    }

    if (category !== 'all') {
      filtered = filtered.filter((asset) => categoryIncludes(asset.category, category));
    }

    if (sortBy === 'downloads') {
      filtered.sort((a, b) => b.download_count - a.download_count);
    } else if (sortBy === 'newest') {
      filtered.reverse();
    }

    setResults(filtered);
    setLoading(false);
  };

  const handleSearch = (newQuery: string, newIsAI: boolean) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}&ai=${newIsAI}`);
  };

  const getRelevanceBadge = (index: number) => {
    if (!isAI) return undefined;
    if (index < 3) return 'Perfect Match';
    if (index < 8) return 'Great Match';
    return 'Good Match';
  };

  const categories = ['all', ...allCategories];

  return (
    <div>
      <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SearchBar onSearch={handleSearch} initialQuery={query} initialIsAI={isAI} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">
              {isAI ? 'AI is finding matches...' : 'Searching...'}
            </p>
          </div>
        )}

        {!loading && (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Found {results.length} results {query && `for "${query}"`}
              </h2>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Filters</span>
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 bg-white"
                >
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="downloads">Sort by: Most Downloaded</option>
                  <option value="newest">Sort by: Newest</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    Filters
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Media Type
                      </label>
                      <div className="space-y-2">
                        {(['all', 'video', 'photo'] as MediaType[]).map((type) => (
                          <label key={type} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="mediaType"
                              value={type}
                              checked={mediaType === type}
                              onChange={(e) => setMediaType(e.target.value as MediaType)}
                              className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                            />
                            <span className="ml-2 text-gray-700 capitalize">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Orientation
                      </label>
                      <div className="space-y-2">
                        {(['all', 'landscape', 'portrait', 'square'] as Orientation[]).map((orient) => (
                          <label key={orient} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="orientation"
                              value={orient}
                              checked={orientation === orient}
                              onChange={(e) => setOrientation(e.target.value as Orientation)}
                              className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                            />
                            <span className="ml-2 text-gray-700 capitalize">{orient}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Resolution
                      </label>
                      <div className="space-y-2">
                        {(['all', 'HD', '4K'] as Resolution[]).map((res) => (
                          <label key={res} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="resolution"
                              value={res}
                              checked={resolution === res}
                              onChange={(e) => setResolution(e.target.value as Resolution)}
                              className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                            />
                            <span className="ml-2 text-gray-700">{res}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat === 'all' ? 'All Categories' : cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </aside>

              <main className="flex-1">
                {results.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg mb-2">No results found</p>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((asset, index) => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        relevanceBadge={getRelevanceBadge(index)}
                      />
                    ))}
                  </div>
                )}
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
