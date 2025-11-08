import { supabase } from '../lib/supabase';
import { Asset } from '../data/mockAssets';
import { mockAssets } from '../data/mockAssets';

export async function fetchAssets(): Promise<Asset[]> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assets:', error);
      return mockAssets;
    }

    if (!data || data.length === 0) {
      return mockAssets;
    }

    return data.map((asset: any) => ({
      id: asset.id,
      title: asset.title,
      description: asset.description,
      type: asset.type || 'video',
      thumbnail_url: asset.thumbnail_url,
      file_url: asset.file_url,
      duration: asset.duration,
      resolution: asset.resolution,
      orientation: asset.orientation,
      category: asset.category,
      tags: asset.tags || [],
      download_count: asset.download_count || 0,
      file_size: asset.file_size,
      formats: asset.formats || [],
    }));
  } catch (err) {
    console.error('Exception fetching assets:', err);
    return mockAssets;
  }
}

export function categoryIncludes(assetCategories: string, targetCategory: string): boolean {
  if (!assetCategories) return false;
  const categories = assetCategories.split(',').map(c => c.trim());
  return categories.some(cat => cat.toLowerCase() === targetCategory.toLowerCase());
}

export function getCategoryArray(categoryString: string): string[] {
  if (!categoryString) return [];
  return categoryString.split(',').map(c => c.trim()).filter(c => c.length > 0);
}
