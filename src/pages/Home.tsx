import React, { useState, useEffect } from 'react';
import { Search, Play, Download, Heart, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface Asset {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'photo';
  thumbnail_url: string;
  file_url: string | null;
  duration: number | null;
  resolution: '4K' | 'HD';
  orientation: 'landscape' | 'portrait' | 'square';
  category: string;
  tags: string[];
  download_count: number;
  file_size: string;
  formats: string[];
  created_at: string | null;
  updated_at: string | null;
}

export function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchAssets();
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('assets')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error searching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'nature', 'business', 'technology', 'lifestyle', 'abstract'];
  const types = ['all', 'video', 'photo'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Premium Stock Videos & Photos
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover millions of high-quality stock videos and photos for your creative projects
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex rounded-lg overflow-hidden shadow-lg">
              <Input
                type="text"
                placeholder="Search for videos, photos, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 rounded-none"
              />
              <Button type="submit" className="rounded-none px-8">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video bg-gray-200">
                  <img
                    src={asset.thumbnail_url}
                    alt={asset.title}
                    className="w-full h-full object-cover"
                  />
                  {asset.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-3">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button className="bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition-colors">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {asset.resolution}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {asset.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {asset.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {asset.download_count} downloads
                    </span>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && assets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No assets found. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}