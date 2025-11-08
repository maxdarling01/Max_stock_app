import { Film, Image, Download } from 'lucide-react';
import { Asset } from '../data/mockAssets';
import { Link } from 'react-router-dom';
import { getCategoryArray } from '../services/assetService';

interface AssetCardProps {
  asset: Asset;
  relevanceBadge?: 'Perfect Match' | 'Great Match' | 'Good Match';
}

export default function AssetCard({ asset, relevanceBadge }: AssetCardProps) {
  const badgeColors = {
    'Perfect Match': 'bg-yellow-500 text-black',
    'Great Match': 'bg-yellow-400 text-black',
    'Good Match': 'bg-gray-100 text-gray-800'
  };

  return (
    <Link
      to={`/asset/${asset.id}`}
      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-200">
        <img
          src={asset.thumbnail_url}
          alt={asset.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {asset.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all">
            <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Film className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        )}
        {relevanceBadge && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${badgeColors[relevanceBadge]}`}>
            {relevanceBadge}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-yellow-500 transition-colors">
          {asset.title}
        </h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
            asset.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
          }`}>
            {asset.type === 'video' ? (
              <Film className="w-3 h-3" />
            ) : (
              <Image className="w-3 h-3" />
            )}
            <span>{asset.type === 'video' ? 'Video' : 'Photo'}</span>
          </span>

          {asset.type === 'video' && asset.duration && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
              0:{asset.duration < 10 ? `0${asset.duration}` : asset.duration}
            </span>
          )}

          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium">
            {asset.resolution}
          </span>
        </div>

        {asset.category && (
          <div className="flex flex-wrap gap-1 mb-3">
            {getCategoryArray(asset.category).map((cat) => (
              <span
                key={cat}
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#d4af37', color: '#000' }}
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>{asset.download_count.toLocaleString()}</span>
          </span>
          <span className="text-xs capitalize">{asset.orientation}</span>
        </div>
      </div>
    </Link>
  );
}
