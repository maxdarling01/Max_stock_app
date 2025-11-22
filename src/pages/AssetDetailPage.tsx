import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Film, Download, ChevronRight, Play } from 'lucide-react';
import { Asset } from '../data/mockAssets';
import { fetchAssets, categoryIncludes, getCategoryArray } from '../services/assetService';
import AssetCard from '../components/AssetCard';
import DownloadModal from '../components/DownloadModal';

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [similarAssets, setSimilarAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadAsset = async () => {
      const allAssets = await fetchAssets();
      const found = allAssets.find((a) => a.id === id);
      setAsset(found || null);

      if (found) {
        const similar = allAssets
          .filter((a) => {
            const assetCats = getCategoryArray(a.category);
            const foundCats = getCategoryArray(found.category);
            return (
              assetCats.some((cat) => foundCats.includes(cat)) &&
              a.id !== found.id
            );
          })
          .slice(0, 6);
        setSimilarAssets(similar);
      }
      setLoading(false);
    };
    loadAsset();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Asset not found</h2>
        <Link to="/" className="text-yellow-500 hover:text-yellow-400">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-yellow-500 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/search" className="hover:text-yellow-500 transition-colors">
            Search
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{asset.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div
              className="bg-gray-900 rounded-xl overflow-hidden relative group w-full flex items-center justify-center"
              style={{ maxHeight: '70vh', aspectRatio: '9 / 16' }}
              onMouseEnter={() => {
                setIsHoveringVideo(true);
                if (videoRef.current && asset.type === 'video' && asset.file_url) {
                  videoRef.current.play().catch(() => {});
                }
              }}
              onMouseLeave={() => {
                setIsHoveringVideo(false);
                if (videoRef.current) {
                  videoRef.current.pause();
                  videoRef.current.currentTime = 0;
                }
              }}
            >
              {asset.type === 'video' && asset.file_url ? (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${asset.thumbnail_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <video
                    ref={videoRef}
                    src={asset.file_url}
                    className={`relative w-full h-full object-contain transition-opacity duration-300 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                </>
              ) : (
                <img
                  src={asset.thumbnail_url}
                  alt={asset.title}
                  className="w-full h-full object-contain"
                />
              )}
              {asset.type === 'video' && (
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black transition-all ${
                    isHoveringVideo ? 'bg-opacity-0' : 'bg-opacity-30'
                  }`}
                >
                  {!isHoveringVideo && (
                    <div className="w-20 h-20 rounded-full bg-white bg-opacity-90 flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer">
                      <Play className="w-10 h-10 text-yellow-500 ml-1" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{asset.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{asset.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium ${
                    asset.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    <Film className="w-4 h-4" />
                    <span className="capitalize">{asset.type}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Resolution</span>
                  <span className="font-semibold text-gray-900">{asset.resolution}</span>
                </div>

                {asset.type === 'video' && asset.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-gray-900">
                      0:{asset.duration < 10 ? `0${asset.duration}` : asset.duration}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">File Size</span>
                  <span className="font-semibold text-gray-900">{asset.file_size}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Downloads</span>
                  <span className="font-semibold text-gray-900">
                    {asset.download_count.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Orientation</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {asset.orientation}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {getCategoryArray(asset.category).map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: '#d4af37', color: '#000' }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-yellow-100 hover:text-yellow-800 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowDownloadModal(true)}
                className="w-full py-4 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Royalty-free commercial license included
              </p>
            </div>
          </div>
        </div>

        {similarAssets.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Assets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {similarAssets.map((similarAsset) => (
                <AssetCard key={similarAsset.id} asset={similarAsset} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showDownloadModal && (
        <DownloadModal
          asset={asset}
          onClose={() => setShowDownloadModal(false)}
        />
      )}
    </>
  );
}
