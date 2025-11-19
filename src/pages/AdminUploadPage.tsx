import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Upload, Loader2, CheckCircle, X, AlertCircle, Sparkles } from 'lucide-react';
import { generateEmbedding, combinedSearchText } from '../services/embeddingService';

const CATEGORIES = ['Luxury Lifestyle', 'Boat Lifestyle', 'Supercars', 'Watches', 'Nature'];

const CATEGORY_KEYWORDS: Record<string, string> = {
  'Boat Lifestyle': 'Boat,Yacht,Sailing',
  'Supercars': 'Bugatti,Supercar,Ferrari,Lamborghini,Porsche,McLaren,Pagani,Koenigsegg,Rolls-Royce,Corvette,Audi,Aston Martin,Mercedes',
  'Watches': 'Watch,Rolex,Timepiece',
  'Nature': 'Nature',
};

function detectCategoriesFromFilename(filename: string): string[] {
  const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.')).toLowerCase();
  const detected: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
    if (keywordList.some(keyword => nameWithoutExtension.includes(keyword))) {
      detected.push(category);
    }
  }

  return detected.length > 0 ? detected : ['Luxury Lifestyle'];
}

function extractTags(filename: string): string[] {
  const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));
  const tags = nameWithoutExtension
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
  return tags;
}

export default function AdminUploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [uploadedAssetId, setUploadedAssetId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Luxury Lifestyle']);
  const [tagUpdateMessage, setTagUpdateMessage] = useState('');
  const [categoryUpdateMessage, setCategoryUpdateMessage] = useState('');
  const [tagUpdateError, setTagUpdateError] = useState('');
  const [categoryUpdateError, setCategoryUpdateError] = useState('');
  const [embeddingMessage, setEmbeddingMessage] = useState('');
  const [embeddingWarning, setEmbeddingWarning] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (user.email !== 'maxdarling84@gmail.com') {
      return;
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (user.email !== 'maxdarling84@gmail.com') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white font-semibold">Access Denied</h1>
          <p className="text-gray-400 mt-2">Admin privileges required</p>
        </div>
      </div>
    );
  }

  const getVideoMetadata = (file: File): Promise<{ duration: number; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve({
          duration: Math.round(video.duration),
          width: video.videoWidth,
          height: video.videoHeight
        });
      };

      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const detectOrientation = (width: number, height: number): 'landscape' | 'portrait' | 'square' => {
    const aspectRatio = width / height;
    if (aspectRatio > 1.1) return 'landscape';
    if (aspectRatio < 0.9) return 'portrait';
    return 'square';
  };

  const handleFileUpload = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['mp4', 'mov', 'webm'].includes(extension || '')) {
      alert('Please upload a video file (MP4, MOV, or WEBM)');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const extractedTags = extractTags(file.name);
      const detectedCategories = detectCategoriesFromFilename(file.name);
      setSelectedCategories(detectedCategories);

      const { duration, width, height } = await getVideoMetadata(file);
      const orientation = detectOrientation(width, height);
      const resolution = height >= 2160 ? '4K' : 'HD';

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-r2-upload-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to get upload URL (${response.status})`);
      }

      const { uploadUrl, fileUrl: r2FileUrl } = await response.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed - network error or CORS issue'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'));
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      const title = file.name
        .substring(0, file.name.lastIndexOf('.'))
        .replace(/,/g, ' ')
        .trim();

      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

      setEmbeddingMessage('Generating AI search data...');
      let embedding: number[] | null = null;

      try {
        const searchText = combinedSearchText(
          extractedTags,
          detectedCategories.join(' ')
        );
        embedding = await generateEmbedding(searchText);

        if (embedding) {
          setEmbeddingMessage('AI search data generated successfully!');
        } else {
          setEmbeddingWarning('Could not generate AI search data. Video will be searchable with keywords only.');
          console.warn('Embedding generation returned null, continuing without embedding');
        }
      } catch (embeddingError) {
        setEmbeddingWarning('Could not generate AI search data. Video will be searchable with keywords only.');
        console.error('Embedding generation error:', embeddingError);
      }

      setTimeout(() => setEmbeddingMessage(''), 3000);

      const { data: insertData, error: insertError } = await supabase
        .from('assets')
        .insert({
          title,
          description: 'Stock video',
          file_url: r2FileUrl,
          thumbnail_url: r2FileUrl,
          type: 'video',
          resolution,
          orientation,
          category: detectedCategories.join(','),
          tags: extractedTags,
          file_size: `${fileSizeMB} MB`,
          formats: [extension],
          download_count: 0,
          duration,
          embedding: embedding || null
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Failed to save video to database: ${insertError.message}`);
      }

      setFileUrl(r2FileUrl);
      setUploadedAssetId(insertData.id);
      setTags(extractedTags);
      setUploadSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('Upload error:', err);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpdateTags = async () => {
    setTagUpdateMessage('');
    setTagUpdateError('');
    try {
      const { error: updateError } = await supabase
        .from('assets')
        .update({ tags })
        .eq('id', uploadedAssetId);

      if (updateError) throw updateError;

      setTagUpdateMessage('Tags updated successfully!');
      setTimeout(() => setTagUpdateMessage(''), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update tags';
      setTagUpdateError(errorMsg);
    }
  };

  const handleUpdateCategories = async () => {
    setCategoryUpdateMessage('');
    setCategoryUpdateError('');
    try {
      const { error: updateError } = await supabase
        .from('assets')
        .update({ category: selectedCategories.join(',') })
        .eq('id', uploadedAssetId);

      if (updateError) throw updateError;

      setCategoryUpdateMessage('Categories updated successfully!');
      setTimeout(() => setCategoryUpdateMessage(''), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update categories';
      setCategoryUpdateError(errorMsg);
    }
  };

  const handleReset = () => {
    setUploadSuccess(false);
    setFileUrl('');
    setUploadedAssetId('');
    setTags([]);
    setNewTag('');
    setError('');
    setUploadProgress(0);
    setSelectedCategories(['Luxury Lifestyle']);
    setTagUpdateMessage('');
    setTagUpdateError('');
    setCategoryUpdateMessage('');
    setCategoryUpdateError('');
    setEmbeddingMessage('');
    setEmbeddingWarning('');
  };

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#d4af37' }}>
          Admin Upload
        </h1>
        <p className="text-gray-400 mb-8">Upload videos to Cloudflare R2</p>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-300">
            {error}
            <button
              onClick={handleReset}
              className="block mt-2 px-4 py-2 rounded"
              style={{ backgroundColor: '#d4af37', color: '#000' }}
            >
              Try Again
            </button>
          </div>
        )}

        {!uploading && !uploadSuccess && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            className="bg-gray-900 border-2 border-dashed rounded-lg p-12 min-h-96 flex flex-col items-center justify-center"
            style={{ borderColor: dragActive ? '#d4af37' : '#d4af37' }}
          >
            <Upload className="w-24 h-24 mx-auto mb-4" style={{ color: '#d4af37' }} />
            <h2 className="text-2xl text-white font-semibold mb-2">Drop video file here</h2>
            <p className="text-gray-400 text-sm mb-4">Accepts: MP4, MOV, WEBM</p>
            <input
              type="file"
              accept=".mp4,.mov,.webm"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer underline"
              style={{ color: '#d4af37' }}
            >
              or click to browse
            </label>
            <p className="text-gray-500 text-xs mt-6">Tags will be extracted from filename</p>
            <p className="text-gray-600 text-xs mt-1">
              Example: forest,river,calm.mp4 → tags: forest, river, calm
            </p>
          </div>
        )}

        {uploading && (
          <div className="flex flex-col items-center justify-center min-h-96">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: '#d4af37' }} />
            <p className="text-xl text-white mb-4">Uploading...</p>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${uploadProgress}%`, backgroundColor: '#d4af37' }}
              />
            </div>
            <p className="text-gray-400 text-sm text-center mt-2">{uploadProgress}% complete</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl text-white font-semibold mb-6">Upload Complete!</h2>

            {embeddingMessage && (
              <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded text-green-300 text-sm flex items-center gap-2 w-full max-w-md justify-center">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                {embeddingMessage}
              </div>
            )}

            {embeddingWarning && (
              <div className="mb-4 p-3 bg-yellow-900 border border-yellow-700 rounded text-yellow-300 text-sm flex items-center gap-2 w-full max-w-md justify-center">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {embeddingWarning}
              </div>
            )}

            <video src={fileUrl} controls className="w-full rounded-lg mb-6" />

            <div className="w-full mb-6">
              <label className="block text-white font-semibold mb-3">Video Tags:</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    style={{ backgroundColor: '#d4af37', color: '#000' }}
                  >
                    {tag}
                    <X
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag();
                  }
                }}
                placeholder="Add new tag..."
                className="bg-gray-800 text-white border rounded px-3 py-2 w-full max-w-xs mb-2 focus:outline-none"
                style={{ borderColor: '#d4af37' }}
              />
              <button
                onClick={handleUpdateTags}
                className="px-6 py-2 rounded font-semibold"
                style={{ backgroundColor: '#d4af37', color: '#000' }}
              >
                Update Tags
              </button>
              {tagUpdateMessage && (
                <div className="mt-2 p-2 bg-green-900 border border-green-700 rounded text-green-300 text-sm">
                  {tagUpdateMessage}
                </div>
              )}
              {tagUpdateError && (
                <div className="mt-2 p-2 bg-red-900 border border-red-700 rounded text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{tagUpdateError}</span>
                </div>
              )}
            </div>

            <div className="w-full mb-6 border-t border-gray-700 pt-6">
              <label className="block text-white font-semibold mb-3">Video Categories:</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    style={{ backgroundColor: '#d4af37', color: '#000' }}
                  >
                    {category}
                    <X
                      className="w-4 h-4 cursor-pointer"
                      onClick={() =>
                        setSelectedCategories(
                          selectedCategories.filter((c) => c !== category)
                        )
                      }
                    />
                  </span>
                ))}
              </div>
              <div className="mb-4">
                {CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category]);
                        } else {
                          setSelectedCategories(
                            selectedCategories.filter((c) => c !== category)
                          );
                        }
                      }}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#d4af37' }}
                    />
                    <span className="ml-2 text-white text-sm">{category}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleUpdateCategories}
                className="px-6 py-2 rounded font-semibold"
                style={{ backgroundColor: '#d4af37', color: '#000' }}
              >
                Update Categories
              </button>
              {categoryUpdateMessage && (
                <div className="mt-2 p-2 bg-green-900 border border-green-700 rounded text-green-300 text-sm">
                  {categoryUpdateMessage}
                </div>
              )}
              {categoryUpdateError && (
                <div className="mt-2 p-2 bg-red-900 border border-red-700 rounded text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{categoryUpdateError}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleReset}
              className="px-8 py-3 rounded-lg font-semibold mt-6"
              style={{ backgroundColor: '#d4af37', color: '#000' }}
            >
              Upload Another Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
